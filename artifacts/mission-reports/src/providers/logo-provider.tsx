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

// ─── Image preloader ──────────────────────────────────────────────────────────
// Preloads a logo URL into the browser cache before we update React state.
// This ensures the swap from static → custom logo is instant with no blank flash.

function preloadImage(url: string | null): Promise<string | null> {
  if (!url) return Promise.resolve(null);
  return new Promise(resolve => {
    const img = new window.Image();
    img.onload  = () => resolve(url);
    img.onerror = () => resolve(null); // treat load failures as "no logo" → fallback to static
    img.src = url;
  });
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
      .then(async (d: any) => {
        if (cancelled) return;
        const headerUrl  = (d.headerLogoUrl as string) || null;
        const footerUrl  = (d.footerLogoUrl as string) || null;
        const signupUrl  = (d.signupLogoUrl as string) || null;
        const logoUrl    = (d.logoUrl as string)       || null;

        // Preload all images before touching state so the swap is instant.
        // Returns null for any URL that fails to load (e.g. 401) → falls back to static.
        const [loadedHeader, loadedFooter, loadedSignup, loadedLogo] = await Promise.all([
          preloadImage(headerUrl),
          preloadImage(footerUrl),
          preloadImage(signupUrl),
          preloadImage(logoUrl),
        ]);
        if (cancelled) return;

        platformCache = { headerLogoUrl: loadedHeader, footerLogoUrl: loadedFooter, signupLogoUrl: loadedSignup, logoUrl: loadedLogo, fetchedAt: Date.now() };
        setPlatformHeaderLogo(loadedHeader);
        setPlatformFooterLogo(loadedFooter);
        setPlatformSignupLogo(loadedSignup);
        setPlatformLogo(loadedLogo);
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
      .then(async (d: any) => {
        if (cancelled) return;
        const url = (d.logoUrl as string) || null;
        const loadedUrl = await preloadImage(url);
        if (cancelled) return;
        orgCacheMap.set(orgSlug, { logoUrl: loadedUrl, fetchedAt: Date.now() });
        setOrgLogo(loadedUrl);
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
