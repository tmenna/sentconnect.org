import app from "./app";
import { logger } from "./lib/logger";
import { seedIfEmpty, ensureSuperAdmin, cleanupDemoOrgs } from "./lib/seed";

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

cleanupDemoOrgs().catch((err) => {
  logger.error({ err }, "cleanupDemoOrgs failed");
});

// Only seed demo data in development — never recreate cleaned-up orgs in production
if (process.env["NODE_ENV"] !== "production") {
  seedIfEmpty().catch((err) => {
    logger.error({ err }, "Seed failed");
  });
}

ensureSuperAdmin().catch((err) => {
  logger.error({ err }, "ensureSuperAdmin failed");
});

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
