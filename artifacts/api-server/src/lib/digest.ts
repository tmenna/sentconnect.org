import { db, usersTable, reportsTable, organizationsTable, photosTable, notificationLogsTable } from "@workspace/db";
import { eq, and, gte, inArray, desc } from "drizzle-orm";
import { logger } from "./logger";
import { sendWeeklyDigestEmail, type DigestPost } from "./mailer";
import { resolveObjectUrl } from "./r2Storage";

// ─── Weekly digest to church admins ──────────────────────────────────────────
// Every Thursday morning (America/New_York), each active church's admins get one
// email summarizing the mission updates posted in the previous 7 days, ready
// to forward to their congregation. Orgs with no new posts are skipped.

const DIGEST_TYPE = "weekly_digest";
const DIGEST_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
// Don't resend if a digest was already logged for the admin within the last 6 days
// (protects against restarts and multiple ticks during the send window).
const DIGEST_DEDUP_MS = 6 * 24 * 60 * 60 * 1000;
const DIGEST_CHECK_INTERVAL_MS = 15 * 60 * 1000; // check every 15 minutes
const DEMO_SUBDOMAIN = "demo";
// Emails may be opened days later — sign image URLs for the S3 maximum of 7 days.
const DIGEST_IMAGE_TTL_SECONDS = 7 * 24 * 60 * 60;

const CANONICAL_DOMAIN = (process.env["TENANT_ROOT_DOMAINS"] ?? "sentconnect.org").split(",")[0]!.trim();
const APP_URL = process.env["APP_BASE_URL"] ?? `https://${CANONICAL_DOMAIN}`;

/** Emails need absolute URLs — prefix any relative path with the app URL. */
async function emailImageUrl(url: string | null | undefined): Promise<string | null> {
  const resolved = await resolveObjectUrl(url, DIGEST_IMAGE_TTL_SECONDS);
  if (!resolved) return null;
  return resolved.startsWith("/") ? `${APP_URL}${resolved}` : resolved;
}

/** Returns { weekday, hour } in America/New_York for the given date. */
function easternNow(date: Date): { weekday: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "numeric",
    hour12: false,
  }).formatToParts(date);
  const weekday = parts.find(p => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find(p => p.type === "hour")?.value ?? "0");
  return { weekday, hour };
}

function snippet(textValue: string | null, max = 280): string {
  const t = (textValue ?? "").replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

function weekLabel(now: Date): string {
  const start = new Date(now.getTime() - DIGEST_WINDOW_MS);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });
  return `${fmt(start)} – ${fmt(now)}`;
}

/**
 * Sends the weekly digest for every active org that has posts from the last
 * 7 days, to each of its active admins (skipping any admin who already
 * received one in the past 6 days). Returns the number of emails sent.
 */
export async function sendWeeklyDigests(now = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - DIGEST_WINDOW_MS);
  const dedupCutoff = new Date(now.getTime() - DIGEST_DEDUP_MS);

  const orgs = await db
    .select({ id: organizationsTable.id, name: organizationsTable.name, subdomain: organizationsTable.subdomain })
    .from(organizationsTable)
    .where(eq(organizationsTable.status, "active"));

  let sentCount = 0;

  for (const org of orgs) {
    if (org.subdomain === DEMO_SUBDOMAIN) continue; // never email the demo org

    try {
      // Posts from the last 7 days, newest first
      const posts = await db
        .select({
          id: reportsTable.id,
          title: reportsTable.title,
          description: reportsTable.description,
          location: reportsTable.location,
          createdAt: reportsTable.createdAt,
          authorName: usersTable.name,
          authorAvatarUrl: usersTable.avatarUrl,
        })
        .from(reportsTable)
        .innerJoin(usersTable, eq(usersTable.id, reportsTable.missionaryId))
        .where(and(eq(reportsTable.organizationId, org.id), gte(reportsTable.createdAt, cutoff)))
        .orderBy(desc(reportsTable.createdAt));
      if (posts.length === 0) continue;

      // First photo per post
      const photoRows = await db
        .select({ reportId: photosTable.reportId, url: photosTable.url })
        .from(photosTable)
        .where(inArray(photosTable.reportId, posts.map(p => p.id)));
      const firstPhoto = new Map<number, string>();
      for (const ph of photoRows) {
        if (!firstPhoto.has(ph.reportId)) firstPhoto.set(ph.reportId, ph.url);
      }

      // Active admins of this org
      const admins = await db
        .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email })
        .from(usersTable)
        .where(and(
          eq(usersTable.organizationId, org.id),
          eq(usersTable.role, "admin"),
          eq(usersTable.status, "active"),
        ));
      if (admins.length === 0) continue;

      // Skip admins with any digest log this week — sent OR claimed.
      // The claim row is written BEFORE sending (see below), so a crash
      // mid-send can never cause a duplicate email; at worst that admin's
      // digest is skipped for the week.
      const recentLogs = await db
        .select({ recipientEmail: notificationLogsTable.recipientEmail })
        .from(notificationLogsTable)
        .where(and(
          eq(notificationLogsTable.type, DIGEST_TYPE),
          gte(notificationLogsTable.createdAt, dedupCutoff),
        ));
      const alreadySent = new Set(recentLogs.map(l => l.recipientEmail));

      const digestPosts: DigestPost[] = await Promise.all(posts.slice(0, 10).map(async p => ({
        postId: p.id,
        authorName: p.authorName,
        authorAvatarUrl: await emailImageUrl(p.authorAvatarUrl),
        title: p.title,
        snippet: snippet(p.description),
        imageUrl: await emailImageUrl(firstPhoto.get(p.id)),
        location: p.location,
        postedAt: p.createdAt,
      })));

      for (const admin of admins) {
        if (alreadySent.has(admin.email)) continue;
        // Claim first (sent=false), then send, then record the outcome.
        const [claim] = await db.insert(notificationLogsTable).values({
          type: DIGEST_TYPE,
          recipientId: admin.id,
          recipientEmail: admin.email,
          subject: `Weekly Missionary Digest · ${org.name}`,
          sent: false,
        }).returning({ id: notificationLogsTable.id });
        const result = await sendWeeklyDigestEmail({
          to: admin.email,
          adminName: admin.name,
          orgName: org.name,
          orgSubdomain: org.subdomain,
          weekLabel: weekLabel(now),
          posts: digestPosts,
        });
        await db.update(notificationLogsTable)
          .set({ sent: result.sent, error: result.error })
          .where(eq(notificationLogsTable.id, claim.id));
        if (result.sent) sentCount++;
      }
    } catch (err) {
      logger.error({ err, orgId: org.id }, "[digest] failed to send weekly digest for org");
    }
  }

  if (sentCount > 0) logger.info(`[digest] weekly digests sent: ${sentCount}`);
  return sentCount;
}

/**
 * Starts the scheduler: every 15 minutes, checks whether it's Thursday between
 * 8 AM and noon Eastern; if so, sends any digests not yet sent this week.
 * Restart-safe — deduplication is backed by the notification log.
 */
export function startWeeklyDigestScheduler(): void {
  const tick = async () => {
    const now = new Date();
    const { weekday, hour } = easternNow(now);
    if (weekday !== "Thu" || hour < 8 || hour >= 12) return;
    await sendWeeklyDigests(now);
  };
  const run = () => tick().catch(err => logger.error({ err }, "[digest] scheduler tick failed"));
  run(); // immediate tick so a restart inside the send window doesn't miss the week
  const timer = setInterval(run, DIGEST_CHECK_INTERVAL_MS);
  timer.unref?.();
  logger.info("[digest] weekly digest scheduler started (Thursdays 8am–12pm Eastern)");
}
