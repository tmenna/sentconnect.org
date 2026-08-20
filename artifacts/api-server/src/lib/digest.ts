import { db, usersTable, reportsTable, organizationsTable, notificationLogsTable } from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";
import { logger } from "./logger";
import { sendWeeklyDigestReminderEmail } from "./mailer";

// ─── Weekly digest reminder to church admins ─────────────────────────────────
// Every Friday morning (America/Los_Angeles), each active church's admins get
// one short reminder to view the full Weekly Digest inside SentConnect.
// Orgs with no new posts are skipped.

const DIGEST_TYPE = "weekly_digest";
const DIGEST_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
// Don't resend if a digest was already logged for the admin within the last 6 days
// (protects against restarts and multiple ticks during the send window).
const DIGEST_DEDUP_MS = 6 * 24 * 60 * 60 * 1000;
const DIGEST_CHECK_INTERVAL_MS = 15 * 60 * 1000; // check every 15 minutes
const DEMO_SUBDOMAIN = "demo";

/** Returns { weekday, hour } in Pacific time for the given date. */
export function pacificNow(date: Date): { weekday: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    hour: "numeric",
    hour12: false,
  }).formatToParts(date);
  const weekday = parts.find(p => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find(p => p.type === "hour")?.value ?? "0");
  return { weekday, hour };
}

export function shouldSendWeeklyReminder(date: Date): boolean {
  const { weekday, hour } = pacificNow(date);
  return weekday === "Fri" && hour >= 8 && hour < 12;
}

function weekLabel(now: Date): string {
  const start = new Date(now.getTime() - DIGEST_WINDOW_MS);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Los_Angeles" });
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
      // Only the count belongs in the email. The report content stays in-app.
      const posts = await db
        .select({ id: reportsTable.id })
        .from(reportsTable)
        .where(and(eq(reportsTable.organizationId, org.id), gte(reportsTable.createdAt, cutoff)));
      if (posts.length === 0) continue;

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

      for (const admin of admins) {
        // Take a transaction-scoped PostgreSQL advisory lock for this reminder
        // and admin. This makes the check + claim atomic across server instances.
        // Recipient IDs are globally unique, so one email used in two orgs does
        // not suppress either organization's reminder.
        const claim = await db.transaction(async tx => {
          await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${DIGEST_TYPE}), ${admin.id})`);
          const [recentClaim] = await tx
            .select({ id: notificationLogsTable.id })
            .from(notificationLogsTable)
            .where(and(
              eq(notificationLogsTable.type, DIGEST_TYPE),
              eq(notificationLogsTable.recipientId, admin.id),
              gte(notificationLogsTable.createdAt, dedupCutoff),
            ))
            .limit(1);
          if (recentClaim) return null;

          const [newClaim] = await tx.insert(notificationLogsTable).values({
            type: DIGEST_TYPE,
            recipientId: admin.id,
            recipientEmail: admin.email,
            subject: `Your Weekly Missionary Report is ready · ${org.name}`,
            sent: false,
          }).returning({ id: notificationLogsTable.id });
          return newClaim;
        });
        if (!claim) continue;

        const result = await sendWeeklyDigestReminderEmail({
          to: admin.email,
          adminName: admin.name,
          orgName: org.name,
          orgSubdomain: org.subdomain,
          weekLabel: weekLabel(now),
          updateCount: posts.length,
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

  if (sentCount > 0) logger.info(`[digest] weekly reminders sent: ${sentCount}`);
  return sentCount;
}

/**
 * Sends a one-off TEST reminder for a single org to a single email address.
 * Does not write dedup/claim rows, so it never interferes with the real
 * Friday send. Uses the same query + template as the real reminder.
 * Returns a short status string.
 */
export async function sendTestDigest(orgSubdomain: string, toEmail: string): Promise<string> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - DIGEST_WINDOW_MS);

  const [org] = await db
    .select({ id: organizationsTable.id, name: organizationsTable.name, subdomain: organizationsTable.subdomain })
    .from(organizationsTable)
    .where(eq(organizationsTable.subdomain, orgSubdomain));
  if (!org) return `org not found: ${orgSubdomain}`;

  const posts = await db
    .select({ id: reportsTable.id })
    .from(reportsTable)
    .where(and(eq(reportsTable.organizationId, org.id), gte(reportsTable.createdAt, cutoff)));
  if (posts.length === 0) return `no posts in the last 7 days for ${orgSubdomain} — nothing to send`;

  const result = await sendWeeklyDigestReminderEmail({
    to: toEmail,
    adminName: "Admin",
    orgName: org.name,
    orgSubdomain: org.subdomain,
    weekLabel: weekLabel(now),
    updateCount: posts.length,
  });
  return result.sent
    ? `test weekly reminder sent to ${toEmail} (${posts.length} update${posts.length === 1 ? "" : "s"})`
    : `send failed: ${result.error ?? "unknown error"}`;
}

/**
 * Starts the scheduler: every 15 minutes, checks whether it's Friday between
 * 8 AM and noon Pacific; if so, sends reminders not yet sent this week.
 * Restart-safe — deduplication is backed by the notification log.
 */
export function startWeeklyDigestScheduler(): void {
  const tick = async () => {
    const now = new Date();
    if (!shouldSendWeeklyReminder(now)) return;
    await sendWeeklyDigests(now);
  };
  const run = () => tick().catch(err => logger.error({ err }, "[digest] scheduler tick failed"));
  run(); // immediate tick so a restart inside the send window doesn't miss the week
  const timer = setInterval(run, DIGEST_CHECK_INTERVAL_MS);
  timer.unref?.();
  logger.info("[digest] weekly reminder scheduler started (Fridays 8am–12pm Pacific)");
}
