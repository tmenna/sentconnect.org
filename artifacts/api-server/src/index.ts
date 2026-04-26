import app from "./app";
import { logger } from "./lib/logger";
import { seedIfEmpty, ensureSuperAdmin, cleanupDemoOrgs } from "./lib/seed";
import { runMigrations } from "./lib/migrate";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

// Run startup tasks sequentially so cleanup completes before super-admin sync
(async () => {
  try {
    await runMigrations();
  } catch (err) {
    logger.error({ err }, "runMigrations failed");
  }

  try {
    await cleanupDemoOrgs();
  } catch (err) {
    logger.error({ err }, "cleanupDemoOrgs failed");
  }

  // Only seed demo data in development — never recreate cleaned-up orgs in production
  if (process.env["NODE_ENV"] !== "production") {
    try {
      await seedIfEmpty();
    } catch (err) {
      logger.error({ err }, "Seed failed");
    }
  }

  try {
    await ensureSuperAdmin();
  } catch (err) {
    logger.error({ err }, "ensureSuperAdmin failed");
  }
})();
