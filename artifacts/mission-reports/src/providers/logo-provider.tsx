import {
  createContext, useContext, useEffect, useState, useCallback, ReactNode,
} from "react";
import { useLocation } from "wouter";
import { getOrgRoutingContext } from "@/lib/org";
import logoWhiteStatic from "@/assets/logo-white.png";

export interface LogoContextValue {
  logo: string;
  footerLogo: string;
  signupLogo: string;
  orgLogo: string | null;
  platformLogo: string | null;
  isCustomLogo: boolean;
  isCustomFooterLogo: boolean;
  isCustomSignupLogo: boolean;
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
  refresh: () => {},
});

export function useLogo() {
  return useContext(LogoContext);
}

// ─── Module-level cache ────────────────────────────────────────────────────────
// Avoids redundant API calls when navigating between pages within the same org.
// The API response has Cache-Control: max-age=300, so we mirror a similar TTL
// here to avoid hitting the API on every React navigation.

const CACHE_TTL_MS = 4 * 60 * 1000; // 4 minutes (just inside the 5-min API cache)

interface PlatformLogoCache {
  headerLogoUrl: string | null;
  footerLogoUrl: string | null;
  signupLogoUrl: string | null;
  logoUrl: string | null;
  fetchedAt: number;
}

interface OrgLogoCache {
  logoUrl: string | null;
  fetchedAt: number;
}

let platformCache: PlatformLogoCache | null = null;
let orgCacheMap: Map<string, OrgLogoCache> = new Map();

function platformCacheValid(forceRefreshTick: number): boolean {
  return forceRefreshTick === 0 && !!platformCache && (Date.now() - platformCache.fetchedAt < CACHE_TTL_MS);
}

function orgCacheValid(slug: string, forceRefreshTick: number): boolean {
  const entry = orgCacheMap.get(slug);
  return forceRefreshTick === 0 && !!entry && (Date.now() - entry.fetchedAt < CACHE_TTL_MS);
}

export function LogoProvider({ children }: { children: ReactNode }) {
  const [platformHeaderLogo, setPlatformHeaderLogo] = useState<string | null>(() => platformCache?.headerLogoUrl ?? null);
  const [platformFooterLogo, setPlatformFooterLogo] = useState<string | null>(() => platformCache?.footerLogoUrl ?? null);
  const [platformSignupLogo, setPlatformSignupLogo] = useState<string | null>(() => platformCache?.signupLogoUrl ?? null);
  const [platformLogo, setPlatformLogo] = useState<string | null>(() => platformCache?.logoUrl ?? null);
  const [orgLogo, setOrgLogo] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    // Bust both module caches and trigger re-fetch
    platformCache = null;
    orgCacheMap.clear();
    setTick(t => t + 1);
  }, []);

  const [location] = useLocation();
  const { orgSlug } = getOrgRoutingContext(location);

  // Fetch platform logos
  useEffect(() => {
    if (platformCacheValid(tick)) {
      setPlatformHeaderLogo(platformCache!.headerLogoUrl);
      setPlatformFooterLogo(platformCache!.footerLogoUrl);
      setPlatformSignupLogo(platformCache!.signupLogoUrl);
      setPlatformLogo(platformCache!.logoUrl);
      return;
    }

    let cancelled = false;
    fetch("/api/landing-page")
      .then(r => r.ok ? r.json() : {})
      .then((d: any) => {
        if (cancelled) return;
        const headerUrl  = (d.headerLogoUrl as string) || null;
        const footerUrl  = (d.footerLogoUrl as string) || null;
        const signupUrl  = (d.signupLogoUrl as string) || null;
        const logoUrl    = (d.logoUrl as string)       || null;

        platformCache = { headerLogoUrl: headerUrl, footerLogoUrl: footerUrl, signupLogoUrl: signupUrl, logoUrl, fetchedAt: Date.now() };

        // Update state immediately — no blocking image preload.
        // The browser will swap from the static fallback to the custom logo
        // as soon as the image arrives, with no blank gap.
        setPlatformHeaderLogo(headerUrl);
        setPlatformFooterLogo(footerUrl);
        setPlatformSignupLogo(signupUrl);
        setPlatformLogo(logoUrl);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [tick]);

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

    let cancelled = false;
    fetch(`/api/orgs/resolve?subdomain=${encodeURIComponent(orgSlug)}`)
      .then(r => r.ok ? r.json() : {})
      .then((d: any) => {
        if (cancelled) return;
        const url = (d.logoUrl as string) || null;
        orgCacheMap.set(orgSlug, { logoUrl: url, fetchedAt: Date.now() });
        setOrgLogo(url);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [orgSlug, tick]);

  const effectivePlatformLogo = platformHeaderLogo || platformLogo || null;
  const logo        = orgLogo || effectivePlatformLogo || logoWhiteStatic;
  const footerLogo  = orgLogo || platformFooterLogo || effectivePlatformLogo || logoWhiteStatic;
  const signupLogo  = platformSignupLogo || effectivePlatformLogo || logoWhiteStatic;

  const isCustomLogo        = logo !== logoWhiteStatic;
  const isCustomFooterLogo  = footerLogo !== logoWhiteStatic;
  const isCustomSignupLogo  = signupLogo !== logoWhiteStatic;

  return (
    <LogoContext.Provider value={{
      logo,
      footerLogo,
      signupLogo,
      orgLogo,
      platformLogo: effectivePlatformLogo,
      isCustomLogo,
      isCustomFooterLogo,
      isCustomSignupLogo,
      refresh,
    }}>
      {children}
    </LogoContext.Provider>
  );
}
