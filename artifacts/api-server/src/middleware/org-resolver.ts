import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db, organizationsTable } from "@workspace/db";

/**
 * Org-resolution middleware — attaches the resolved organization to `req.resolvedOrg`.
 *
 * Routing strategy is controlled by the USE_HOSTNAME_ROUTING environment variable:
 *
 *   USE_HOSTNAME_ROUTING=false (default / dev)
 *     Org slug arrives via X-Org-Subdomain header from the frontend.
 *     Used during development with path-based routing (e.g. /ep2/login).
 *
 *   USE_HOSTNAME_ROUTING=true (production)
 *     Org slug is derived from req.hostname (e.g. ep2.sentconnect.org → "ep2").
 *     Set this when real subdomain routing is live.
 *
 * Everything downstream (query scoping, login, etc.) needs zero changes when swapping.
 */
export async function resolveOrg(req: Request, _res: Response, next: NextFunction): Promise<void> {
  let subdomain: string | undefined;

  if (process.env["USE_HOSTNAME_ROUTING"] === "true") {
    // Production: derive org from subdomain (e.g. ep2.sentconnect.org → "ep2")
    const parts = req.hostname?.split(".");
    const candidate = parts && parts.length >= 3 ? parts[0] : undefined;
    // Ignore "www" and bare root-domain hits
    if (candidate && candidate !== "www") {
      subdomain = candidate.trim().toLowerCase();
    }
  } else {
    // Development: org slug arrives via header sent by the frontend
    subdomain = (req.headers["x-org-subdomain"] as string | undefined)?.trim().toLowerCase();
  }

  if (subdomain) {
    const [org] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.subdomain, subdomain));

    if (org) {
      req.resolvedOrg = org;
    }
  }

  next();
}
