import "express-session";
import type { organizationsTable } from "@workspace/db";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

declare global {
  namespace Express {
    interface Request {
      /**
       * Resolved organization attached by the org-resolver middleware.
       * Present when the `X-Org-Subdomain` header matches a known org.
       * Will be set from `req.hostname` once real subdomain routing is live.
       */
      resolvedOrg?: typeof organizationsTable.$inferSelect;
    }
  }
}
