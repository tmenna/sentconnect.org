import { db, usersTable, reportsTable, notificationLogsTable, photosTable, organizationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { sendNewPostEmail, sendNewCommentEmail } from "./mailer";
import { logger } from "./logger";

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

export async function notifyAdminsOfNewPost(postId: number, authorId: number): Promise<void> {
  try {
    const [post] = await db.select().from(reportsTable).where(eq(reportsTable.id, postId));
    if (!post) return;

    const [author] = await db.select().from(usersTable).where(eq(usersTable.id, authorId));
    if (!author) return;

    const orgId = post.organizationId;
    if (!orgId) return;

    // Fetch org for subdomain (used to build correct deep-link URL in the email)
    const [org] = await db.select({ name: organizationsTable.name, subdomain: organizationsTable.subdomain })
      .from(organizationsTable).where(eq(organizationsTable.id, orgId));

    const admins = await db.select().from(usersTable).where(
      and(eq(usersTable.organizationId, orgId), eq(usersTable.role, "admin"))
    );

    if (admins.length === 0) return;

    const photos = await db.select().from(photosTable).where(eq(photosTable.reportId, postId));
    const firstImageUrl = photos[0]?.url ?? null;

    const snippet = post.description
      ? post.description.slice(0, 200) + (post.description.length > 200 ? "…" : "")
      : "A new mission update has been posted.";

    const orgName = org?.name ?? author.organization ?? "your organization";
    const orgSubdomain = org?.subdomain ?? null;

    await Promise.allSettled(
      admins
        .filter(a => a.id !== authorId)
        .map(async (admin) => {
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
        })
    );
  } catch (err) {
    logger.error({ err, postId, authorId }, "[notifier] notifyAdminsOfNewPost failed");
  }
}

export async function notifyAuthorOfComment(
  postId: number,
  commentId: number,
  commenterId: number,
  commentText: string
): Promise<void> {
  try {
    const [post] = await db.select().from(reportsTable).where(eq(reportsTable.id, postId));
    if (!post) return;

    if (post.missionaryId === commenterId) return;

    const [postAuthor] = await db.select().from(usersTable).where(eq(usersTable.id, post.missionaryId));
    if (!postAuthor) return;

    const [commenter] = await db.select().from(usersTable).where(eq(usersTable.id, commenterId));
    if (!commenter) return;

    // Fetch org for subdomain
    const orgId = post.organizationId;
    const [org] = orgId
      ? await db.select({ name: organizationsTable.name, subdomain: organizationsTable.subdomain })
          .from(organizationsTable).where(eq(organizationsTable.id, orgId))
      : [null];

    const snippet = post.description
      ? post.description.slice(0, 120) + (post.description.length > 120 ? "…" : "")
      : "your post";

    const orgName = org?.name ?? postAuthor.organization ?? "your organization";
    const orgSubdomain = org?.subdomain ?? null;

    const result = await sendNewCommentEmail({
      to: postAuthor.email,
      commenterName: commenter.name,
      commenterAvatarUrl: commenter.avatarUrl,
      commentText: commentText.slice(0, 300),
      postSnippet: snippet,
      postId,
      orgName,
      orgSubdomain,
      commentedAt: new Date(),
    });

    await logNotification({
      type: "new_comment",
      recipientId: postAuthor.id,
      recipientEmail: postAuthor.email,
      subject: `${commenter.name} commented on your post`,
      relatedPostId: postId,
      relatedCommentId: commentId,
      sent: result.sent,
      error: result.error,
    });
  } catch (err) {
    logger.error({ err, postId, commentId }, "[notifier] notifyAuthorOfComment failed");
  }
}
