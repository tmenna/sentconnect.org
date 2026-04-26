import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { logger } from "./logger";

/**
 * Idempotent schema migrations — run once at server startup.
 * Uses IF NOT EXISTS / DO-NOTHING patterns so they are safe to re-run on
 * any database state, including production.
 */
export async function runMigrations(): Promise<void> {
  const migrations: Array<{ name: string; sql: string }> = [
    {
      name: "organizations.email column",
      sql: `ALTER TABLE organizations ADD COLUMN IF NOT EXISTS email TEXT`,
    },
    {
      name: "notification_logs table",
      sql: `CREATE TABLE IF NOT EXISTS notification_logs (
        id          SERIAL PRIMARY KEY,
        event_type  TEXT NOT NULL,
        recipient   TEXT NOT NULL,
        status      TEXT NOT NULL DEFAULT 'sent',
        error       TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
    },
    // ── Performance indexes ──────────────────────────────────────────────────
    // These indexes are critical for feed query performance as data grows.
    // Composite index covers the most common query: org feed sorted by date.
    {
      name: "idx_reports_org_created (composite)",
      sql: `CREATE INDEX IF NOT EXISTS idx_reports_org_created ON reports(organization_id, created_at DESC)`,
    },
    {
      name: "idx_reports_missionary_created (composite)",
      sql: `CREATE INDEX IF NOT EXISTS idx_reports_missionary_created ON reports(missionary_id, created_at DESC)`,
    },
    {
      name: "idx_reports_is_mission_moment",
      sql: `CREATE INDEX IF NOT EXISTS idx_reports_is_mission_moment ON reports(is_mission_moment) WHERE is_mission_moment = TRUE`,
    },
    {
      name: "idx_photos_report_id",
      sql: `CREATE INDEX IF NOT EXISTS idx_photos_report_id ON photos(report_id)`,
    },
    {
      name: "idx_comments_post_id",
      sql: `CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)`,
    },
    {
      name: "idx_likes_post_id",
      sql: `CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id)`,
    },
    {
      name: "idx_users_organization_id",
      sql: `CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id)`,
    },
  ];

  for (const migration of migrations) {
    try {
      await db.execute(sql.raw(migration.sql));
      logger.info(`Migration OK: ${migration.name}`);
    } catch (err) {
      logger.error({ err }, `Migration FAILED: ${migration.name}`);
    }
  }
}
