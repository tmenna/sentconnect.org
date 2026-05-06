import {
  createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode,
} from "react";
import { useLocation } from "wouter";
import { getOrgRoutingContext } from "@/lib/org";
import logoWhiteStatic from "@/assets/logo-white.png";

export interface LogoContextValue {
  /** Best logo URL to use in the app (org logo → platform header logo → platform logo → static fallback) */
  logo: string;
  /** Footer-specific logo */
  footerLogo: string;
  /** The raw org-level logo URL (null if org has no custom logo) */
  orgLogo: string | null;
  /** The raw platform logo URL from landing page content */
  platformLogo: string | null;
  /** Call after uploading a new logo to refresh all pages */
  refresh: () => void;
}

const LogoContext = createContext<LogoContextValue>({
  logo: logoWhiteStatic,
  footerLogo: logoWhiteStatic,
  orgLogo: null,
  platformLogo: null,
  refresh: () => {},
});

export function useLogo() {
  return useContext(LogoContext);
}

export function LogoProvider({ children }: { children: ReactNode }) {
  const [platformHeaderLogo, setPlatformHeaderLogo] = useState<string | null>(null);
  const [platformFooterLogo, setPlatformFooterLogo] = useState<string | null>(null);
  const [platformLogo, setPlatformLogo] = useState<string | null>(null);
  const [orgLogo, setOrgLogo] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  const [location] = useLocation();
  const { orgSlug } = getOrgRoutingContext(location);
  const prevSlugRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/landing-page")
      .then(r => r.ok ? r.json() : {})
      .then((d: any) => {
        if (!cancelled) {
          setPlatformHeaderLogo(d.headerLogoUrl || null);
          setPlatformFooterLogo(d.footerLogoUrl || null);
          setPlatformLogo(d.logoUrl || null);
        }
      })
      .catch(() => {});

    if (orgSlug && orgSlug !== prevSlugRef.current) {
      prevSlugRef.current = orgSlug;
      fetch(`/api/orgs/resolve?subdomain=${encodeURIComponent(orgSlug)}`)
        .then(r => r.ok ? r.json() : {})
        .then((d: any) => {
          if (!cancelled) setOrgLogo(d.logoUrl || null);
        })
        .catch(() => {});
    } else if (!orgSlug) {
      setOrgLogo(null);
    }

    return () => { cancelled = true; };
  }, [orgSlug, tick]);

  const effectivePlatformLogo = platformHeaderLogo || platformLogo || null;
  const logo = orgLogo || effectivePlatformLogo || logoWhiteStatic;
  const footerLogo = orgLogo || platformFooterLogo || effectivePlatformLogo || logoWhiteStatic;

  return (
    <LogoContext.Provider value={{
      logo,
      footerLogo,
      orgLogo,
      platformLogo: effectivePlatformLogo,
      refresh,
    }}>
      {children}
    </LogoContext.Provider>
  );
}
