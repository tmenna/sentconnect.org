import { createContext, useContext, useEffect, useRef } from "react";
import { setOrgSubdomain } from "@workspace/api-client-react";

interface OrgContextValue {
  /** The org's subdomain slug from the hostname or URL path (e.g. "ep2"). */
  orgSlug: string | null;
  /** Returns the path prefix to prepend when building intra-app links. */
  prefix: (path: string) => string;
}

const OrgContext = createContext<OrgContextValue>({
  orgSlug: null,
  prefix: (p) => p,
});

export function useOrg() {
  return useContext(OrgContext);
}

interface OrgProviderProps {
  orgSlug: string | null;
  usesPathPrefix?: boolean;
  children: React.ReactNode;
}

/**
 * Provides org context throughout the app and syncs the current org slug
 * with the API client so every request includes `X-Org-Subdomain`.
 *
 * In hostname-routing production the header is redundant because the API can
 * derive the org from req.hostname, but keeping it preserves local path routing.
 */
export function OrgProvider({ orgSlug, usesPathPrefix = true, children }: OrgProviderProps) {
  const prevSlug = useRef<string | null>(undefined);

  useEffect(() => {
    if (prevSlug.current !== orgSlug) {
      setOrgSubdomain(orgSlug);
      prevSlug.current = orgSlug;
    }
    return () => {
      setOrgSubdomain(null);
    };
  }, [orgSlug]);

  function prefix(path: string): string {
    if (!orgSlug || !usesPathPrefix) return path;
    const clean = path.startsWith("/") ? path : `/${path}`;
    return `/${orgSlug}${clean}`;
  }

  return <OrgContext.Provider value={{ orgSlug, prefix }}>{children}</OrgContext.Provider>;
}
