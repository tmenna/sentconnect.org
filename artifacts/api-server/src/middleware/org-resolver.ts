import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db, organizationsTable } from "@workspace/db";

/**
 * Org-resolution middleware — attaches the resolved organization to `req.resolvedOrg`.
 *
 * SWAP POINT — to switch from path-based to real subdomain routing, replace
 * the header-based extraction below with:
 *
 *   const subdomain = req.hostname.split(".")[0];
 *
 * Everything downstream (query scoping, login, etc.) needs zero changes.
 */
export async function resolveOrg(req: Request, _res: Response, next: NextFunction): Promise<void> {
  // Currently: org slug arrives via header sent by the frontend.
  // Later:     derive from req.hostname (subdomain routing).
  const subdomain = (req.headers["x-org-subdomain"] as string | undefined)?.trim().toLowerCase();

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
