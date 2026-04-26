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
