/**
 * Org utilities for multi-tenant routing.
 *
 * Development/Replit preview uses path-based routing: /calvary/login.
 * Production custom domains use hostname routing: calvary.sentconnect.org/login.
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

const DEFAULT_TENANT_ROOT_DOMAINS = ["sentconnect.org", "sentonnect.org"];
const DEFAULT_PLATFORM_ADMIN_SUBDOMAINS = ["teki"];

function tenantRootDomains(): string[] {
  const configured = import.meta.env.VITE_TENANT_ROOT_DOMAINS as string | undefined;
  return (configured?.split(",") ?? DEFAULT_TENANT_ROOT_DOMAINS)
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
}

function platformAdminSubdomains(): string[] {
  const configured = import.meta.env.VITE_PLATFORM_ADMIN_SUBDOMAINS as string | undefined;
  return (configured?.split(",") ?? DEFAULT_PLATFORM_ADMIN_SUBDOMAINS)
    .map((subdomain) => subdomain.trim().toLowerCase())
    .filter(Boolean);
}

export function extractHostnameOrgSlug(hostname = window.location.hostname): string | null {
  const host = hostname.toLowerCase().replace(/\.$/, "");

  for (const rootDomain of tenantRootDomains()) {
    if (host === rootDomain || host === `www.${rootDomain}`) return null;
    if (!host.endsWith(`.${rootDomain}`)) continue;

    const candidate = host.slice(0, -(rootDomain.length + 1));
    if (!candidate || candidate === "www") return null;
    if (platformAdminSubdomains().includes(candidate)) return null;
    if (!/^[a-z0-9-]{2,40}$/.test(candidate)) return null;
    return candidate;
  }

  return null;
}

export function getOrgRoutingContext(pathname: string): {
  orgSlug: string | null;
  usesPathPrefix: boolean;
} {
  const hostnameOrgSlug = extractHostnameOrgSlug();
  if (hostnameOrgSlug) {
    return { orgSlug: hostnameOrgSlug, usesPathPrefix: false };
  }

  const pathOrgSlug = extractOrgSlug(pathname);
  return { orgSlug: pathOrgSlug, usesPathPrefix: Boolean(pathOrgSlug) };
}

export function isTenantRootHost(hostname = window.location.hostname): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return tenantRootDomains().some((rootDomain) => host === rootDomain || host === `www.${rootDomain}`);
}

export function isPlatformAdminHost(hostname = window.location.hostname): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return tenantRootDomains().some((rootDomain) =>
    platformAdminSubdomains().some((subdomain) => host === `${subdomain}.${rootDomain}`),
  );
}

export function buildOrgHref(subdomain: string, path = "/"): string {
  const cleanSubdomain = subdomain.trim().toLowerCase();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const currentHost = window.location.hostname.toLowerCase();
  const matchedRootDomain = tenantRootDomains().find(
    (rootDomain) => currentHost === rootDomain || currentHost === `www.${rootDomain}` || currentHost.endsWith(`.${rootDomain}`),
  );

  if (matchedRootDomain) {
    return `${window.location.protocol}//${cleanSubdomain}.${matchedRootDomain}${cleanPath}`;
  }

  return `/${cleanSubdomain}${cleanPath}`;
}

export function buildOrgHomeHref(subdomain: string): string {
  return buildOrgHref(subdomain, "/");
}

export function buildOrgLoginHref(subdomain: string): string {
  return buildOrgHref(subdomain, "/login");
}
