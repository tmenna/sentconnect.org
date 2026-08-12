import {
  createContext, useContext, useEffect, useState, useCallback, ReactNode,
} from "react";
import { useLocation } from "wouter";
import { getOrgRoutingContext } from "@/lib/org";
import logoWhiteStatic from "@/assets/logo-white.png";

// Platform branding is static (bundled with the app) — no fetch, no flash.
// Only org-specific logos are loaded dynamically, for org login pages/portals.

export interface LogoContextValue {
  logo: string;
  footerLogo: string;
  signupLogo: string;
  orgLogo: string | null;
  platformLogo: string | null;
  isCustomLogo: boolean;
  isCustomFooterLogo: boolean;
  isCustomSignupLogo: boolean;
  isLogoReady: boolean;
  refresh: () => void;
}

const LogoContext = createContext<LogoContextValue>({
  logo: logoWhiteStatic,
  footerLogo: logoWhiteStatic,
  signupLogo: logoWhiteStatic,
  orgLogo: null,
  platformLogo: null,
  isCustomLogo: false,
  isCustomFooterLogo: false,
  isCustomSignupLogo: false,
  isLogoReady: true,
  refresh: () => {},
});

export function useLogo() {
  return useContext(LogoContext);
}

// Preloads a logo URL into the browser cache before we update React state,
// so the swap from static → custom org logo is instant with no blank flash.
function preloadImage(url: string | null): Promise<string | null> {
  if (!url) return Promise.resolve(null);
  return new Promise(resolve => {
    const img = new window.Image();
    img.onload  = () => resolve(url);
    img.onerror = () => resolve(null); // treat load failures as "no logo" → fallback to static
    img.src = url;
  });
}

// ─── Org logo cache ───────────────────────────────────────────────────────────
// Module-level + localStorage so returning visitors get the org logo on first
// paint (no default → custom swap). TTL governs background refetching.

const CACHE_TTL_MS = 4 * 60 * 1000;
const ORG_LS_KEY = "sc-org-logos-v1";

interface OrgLogoCache {
  logoUrl: string | null;
  fetchedAt: number;
}

function readLS<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeLS(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full / private mode — non-fatal
  }
}

const orgCacheMap: Map<string, OrgLogoCache> = new Map(
  Object.entries(readLS<Record<string, OrgLogoCache>>(ORG_LS_KEY) ?? {}),
);

function orgCacheValid(slug: string, forceRefreshTick: number): boolean {
  const entry = orgCacheMap.get(slug);
  return forceRefreshTick === 0 && !!entry && (Date.now() - entry.fetchedAt < CACHE_TTL_MS);
}

export function LogoProvider({ children }: { children: ReactNode }) {
  const [orgLogo, setOrgLogo] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    orgCacheMap.clear();
    setTick(t => t + 1);
  }, []);

  const [location] = useLocation();
  const { orgSlug } = getOrgRoutingContext(location);

  // Fetch org-scoped logo
  useEffect(() => {
    if (!orgSlug) {
      setOrgLogo(null);
      return;
    }

    if (orgCacheValid(orgSlug, tick)) {
      setOrgLogo(orgCacheMap.get(orgSlug)!.logoUrl);
      return;
    }

    // Show the last-known logo immediately (even if stale) while refetching,
    // so the header doesn't flash the default logo on repeat visits.
    const stale = orgCacheMap.get(orgSlug);
    if (stale) setOrgLogo(stale.logoUrl);

    let cancelled = false;
    fetch(`/api/orgs/resolve?subdomain=${encodeURIComponent(orgSlug)}`)
      .then(r => r.ok ? r.json() : {})
      .then(async (d: any) => {
        if (cancelled) return;
        const url = (d.logoUrl as string) || null;
        const loadedUrl = await preloadImage(url);
        if (cancelled) return;
        orgCacheMap.set(orgSlug, { logoUrl: loadedUrl, fetchedAt: Date.now() });
        writeLS(ORG_LS_KEY, Object.fromEntries(orgCacheMap));
        setOrgLogo(loadedUrl);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [orgSlug, tick]);

  const logo       = orgLogo || logoWhiteStatic;
  const footerLogo = orgLogo || logoWhiteStatic;
  const signupLogo = logoWhiteStatic;

  return (
    <LogoContext.Provider value={{
      logo,
      footerLogo,
      signupLogo,
      orgLogo,
      platformLogo: null,
      isCustomLogo: logo !== logoWhiteStatic,
      isCustomFooterLogo: footerLogo !== logoWhiteStatic,
      isCustomSignupLogo: false,
      isLogoReady: true,
      refresh,
    }}>
      {children}
    </LogoContext.Provider>
  );
}
