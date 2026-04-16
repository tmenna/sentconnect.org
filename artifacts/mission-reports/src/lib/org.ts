/**
 * Org utilities for path-based multi-tenant routing.
 *
 * SWAP POINT — when real subdomain routing is enabled, `extractOrgSlug`
 * will no longer be needed on the frontend. Instead, the backend will
 * derive the org from `req.hostname`. This file can then be removed and
 * all references to `orgSlug` in the URL can be dropped.
 */

/**
 * Path segments that are reserved application routes and must never be
 * interpreted as organization slugs.
 */
export const RESERVED_PATHS = new Set([
  "login",
  "signup",
  "admin",
  "feed",
  "submit",
  "reports",
  "missionaries",
  "profile",
  "super-admin",
  "forgot-password",
  "reset-password",
  "platform",
  "api",
  "health",
  "static",
  "assets",
  "favicon.ico",
  "robots.txt",
]);

/**
 * Given a URL pathname, returns the org slug if the first path segment
 * looks like a subdomain (i.e. is not a reserved route).
 *
 * Examples:
 *   /ep2/dashboard  → "ep2"
 *   /ep2/login      → "ep2"
 *   /login          → null  (reserved route)
 *   /admin          → null  (reserved route)
 */
export function extractOrgSlug(pathname: string): string | null {
  // Strip the Vite BASE_URL prefix if present (handles /app/ep2/... → ep2/...)
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
  const relative = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;

  const firstSegment = relative.split("/").filter(Boolean)[0];
  if (!firstSegment) return null;
  if (RESERVED_PATHS.has(firstSegment)) return null;

  // Slug must be valid: lowercase letters, numbers, hyphens, 2-40 chars
  if (!/^[a-z0-9-]{2,40}$/.test(firstSegment)) return null;

  return firstSegment;
}
