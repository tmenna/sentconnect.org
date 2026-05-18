import { db, usersTable, reportsTable, notificationLogsTable, photosTable, organizationsTable } from "@workspace/db";
import { eq, and, ne } from "drizzle-orm";
import { sendNewPostEmail, sendNewCommentEmail, sendAdminCommentAlertEmail } from "./mailer";
import { logger } from "./logger";
import { resolveObjectUrl } from "./r2Storage";

// ─── Expo Push Notification helper ───────────────────────────────────────────

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
  badge?: number;
}

async function sendExpoPushNotifications(messages: ExpoPushMessage[]): Promise<void> {
  if (messages.length === 0) return;
  // Filter to only valid Expo push tokens
  const valid = messages.filter(m => m.to.startsWith("ExponentPushToken[") || m.to.startsWith("ExpoPushToken["));
  if (valid.length === 0) return;
  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(valid),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      logger.warn({ status: res.status, body: text }, "[notifier] Expo push API returned non-200");
    }
  } catch (err) {
    logger.error({ err }, "[notifier] sendExpoPushNotifications failed");
  }
}

async function logNotification(params: {
  type: string;
  recipientId?: number;
  recipientEmail: string;
  subject: string;
  relatedPostId?: number;
  relatedCommentId?: number;
  sent: boolean;
  error?: string;
}) {
  try {
    await db.insert(notificationLogsTable).values(params);
  } catch (err) {
    logger.error({ err }, "[notifier] failed to log notification");
  }
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

async function getOrgInfo(orgId: number | null | undefined) {
  if (!orgId) return null;
  const [org] = await db
    .select({ id: organizationsTable.id, name: organizationsTable.name, subdomain: organizationsTable.subdomain })
    .from(organizationsTable)
    .where(eq(organizationsTable.id, orgId));
  return org ?? null;
}

// ─── 1. New post → notify org admins ─────────────────────────────────────────

export async function notifyAdminsOfNewPost(postId: number, authorId: number): Promise<void> {
  try {
    const [post] = await db.select().from(reportsTable).where(eq(reportsTable.id, postId));
    if (!post) return;

    const [author] = await db.select().from(usersTable).where(eq(usersTable.id, authorId));
    if (!author) return;

    const orgId = post.organizationId;
    if (!orgId) return;

    const org = await getOrgInfo(orgId);

    // Fetch admins (for email) and all org members (for push) in parallel
    const [admins, allOrgUsers, photos] = await Promise.all([
      db.select().from(usersTable).where(
        and(eq(usersTable.organizationId, orgId), eq(usersTable.role, "admin"))
      ),
      db.select({ id: usersTable.id, expoPushToken: usersTable.expoPushToken }).from(usersTable).where(
        and(eq(usersTable.organizationId, orgId), ne(usersTable.id, authorId))
      ),
      db.select().from(photosTable).where(eq(photosTable.reportId, postId)),
    ]);
    if (admins.length === 0 && allOrgUsers.length === 0) return;

    const firstImageUrl = await resolveObjectUrl(photos[0]?.url ?? null);

    const snippet = post.description
      ? post.description.slice(0, 200) + (post.description.length > 200 ? "…" : "")
      : "A new mission update has been posted.";

    const orgName = org?.name ?? author.organization ?? "your organization";
    const orgSubdomain = org?.subdomain ?? null;

    const eligibleAdmins = admins.filter(a => a.id !== authorId);
    const pushRecipients = allOrgUsers.filter(u => !!u.expoPushToken);

    await Promise.allSettled([
      ...eligibleAdmins.map(async (admin) => {
        const result = await sendNewPostEmail({
          to: admin.email,
          senderName: author.name,
          senderAvatarUrl: author.avatarUrl,
          postSnippet: snippet,
          postImageUrl: firstImageUrl,
          postId,
          orgName,
          orgSubdomain,
          postedAt: post.createdAt,
        });
        await logNotification({
          type: "new_post",
          recipientId: admin.id,
          recipientEmail: admin.email,
          subject: `New Mission Update from ${author.name}`,
          relatedPostId: postId,
          sent: result.sent,
          error: result.error,
        });
      }),
      sendExpoPushNotifications(
        pushRecipients.map(u => ({
          to: u.expoPushToken!,
          title: `New update from ${author.name}`,
          body: snippet,
          data: { postId, screen: "post" },
          sound: "default" as const,
        }))
      ),
    ]);
  } catch (err) {
    logger.error({ err, postId, authorId }, "[notifier] notifyAdminsOfNewPost failed");
  }
}

// ─── 2. New comment → notify post author ─────────────────────────────────────

export async function notifyAuthorOfComment(
  postId: number,
  commentId: number,
  commenterId: number,
  commentText: string
): Promise<void> {
  try {
    const [post] = await db.select().from(reportsTable).where(eq(reportsTable.id, postId));
    if (!post) return;

    // Post has no author recorded — nothing to notify
    if (!post.missionaryId) {
      logger.warn({ postId }, "[notifier] post has no missionaryId, skipping author notification");
      return;
    }

    // Don't notify if the post author is commenting on their own post
    if (post.missionaryId === commenterId) return;

    const [postAuthor] = await db.select().from(usersTable).where(eq(usersTable.id, post.missionaryId));
    if (!postAuthor) {
      logger.warn({ postId, missionaryId: post.missionaryId }, "[notifier] post author not found");
      return;
    }

    const [commenter] = await db.select().from(usersTable).where(eq(usersTable.id, commenterId));
    if (!commenter) return;

    const org = await getOrgInfo(post.organizationId);

    const snippet = post.description
      ? post.description.slice(0, 120) + (post.description.length > 120 ? "…" : "")
      : "your post";

    const orgName = org?.name ?? postAuthor.organization ?? "your organization";
    const orgSubdomain = org?.subdomain ?? null;

    const [result] = await Promise.allSettled([
      sendNewCommentEmail({
        to: postAuthor.email,
        commenterName: commenter.name,
        commenterAvatarUrl: commenter.avatarUrl,
        commentText: commentText.slice(0, 300),
        postSnippet: snippet,
        postId,
        orgName,
        orgSubdomain,
        commentedAt: new Date(),
      }),
      postAuthor.expoPushToken
        ? sendExpoPushNotifications([{
            to: postAuthor.expoPushToken,
            title: `${commenter.name} commented on your post`,
            body: commentText.slice(0, 200),
            data: { postId, screen: "post" },
            sound: "default" as const,
          }])
        : Promise.resolve(),
    ]);

    const emailResult = result.status === "fulfilled" ? result.value : { sent: false, error: String((result as PromiseRejectedResult).reason) };

    await logNotification({
      type: "new_comment",
      recipientId: postAuthor.id,
      recipientEmail: postAuthor.email,
      subject: `${commenter.name} commented on your post`,
      relatedPostId: postId,
      relatedCommentId: commentId,
      sent: emailResult.sent,
      error: emailResult.error,
    });
  } catch (err) {
    logger.error({ err, postId, commentId }, "[notifier] notifyAuthorOfComment failed");
  }
}

// ─── 3. New comment → notify org admins ──────────────────────────────────────
// Keeps admins in the loop on all conversations in their org.
// Skips: the admin who wrote the comment, and the post author (already notified above).

export async function notifyAdminsOfNewComment(
  postId: number,
  commentId: number,
  commenterId: number,
  commentText: string
): Promise<void> {
  try {
    const [post] = await db.select().from(reportsTable).where(eq(reportsTable.id, postId));
    if (!post || !post.organizationId) return;

    const [commenter] = await db.select().from(usersTable).where(eq(usersTable.id, commenterId));
    if (!commenter) return;

    const [postAuthor] = post.missionaryId
      ? await db.select().from(usersTable).where(eq(usersTable.id, post.missionaryId))
      : [null];

    const org = await getOrgInfo(post.organizationId);
    if (!org) return;

    const admins = await db.select().from(usersTable).where(
      and(eq(usersTable.organizationId, post.organizationId), eq(usersTable.role, "admin"))
    );
    if (admins.length === 0) return;

    const snippet = post.description
      ? post.description.slice(0, 120) + (post.description.length > 120 ? "…" : "")
      : "a mission update";

    const now = new Date();

    const eligibleAdmins = admins
      .filter(a => a.id !== commenterId)
      .filter(a => a.id !== post.missionaryId);

    await Promise.allSettled([
      ...eligibleAdmins.map(async (admin) => {
        const result = await sendAdminCommentAlertEmail({
          to: admin.email,
          commenterName: commenter.name,
          commenterAvatarUrl: commenter.avatarUrl,
          commentText: commentText.slice(0, 300),
          postAuthorName: postAuthor?.name ?? "a team member",
          postSnippet: snippet,
          postId,
          orgName: org.name,
          orgSubdomain: org.subdomain,
          commentedAt: now,
        });
        await logNotification({
          type: "admin_comment_alert",
          recipientId: admin.id,
          recipientEmail: admin.email,
          subject: `${commenter.name} commented on ${postAuthor?.name ?? "a member"}'s post`,
          relatedPostId: postId,
          relatedCommentId: commentId,
          sent: result.sent,
          error: result.error,
        });
      }),
      sendExpoPushNotifications(
        eligibleAdmins
          .filter(a => !!a.expoPushToken)
          .map(admin => ({
            to: admin.expoPushToken!,
            title: `${commenter.name} commented on ${postAuthor?.name ?? "a member"}'s post`,
            body: commentText.slice(0, 200),
            data: { postId, screen: "post" },
            sound: "default" as const,
          }))
      ),
    ]);
  } catch (err) {
    logger.error({ err, postId, commentId }, "[notifier] notifyAdminsOfNewComment failed");
  }
}
