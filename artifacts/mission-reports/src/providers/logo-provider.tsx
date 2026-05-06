import {
  createContext, useContext, useEffect, useState, useCallback, ReactNode,
} from "react";
import { useLocation } from "wouter";
import { getOrgRoutingContext } from "@/lib/org";
import logoWhiteStatic from "@/assets/logo-white.png";

export interface LogoContextValue {
  /** Best logo URL to use in the app (org logo → platform header logo → platform logo → static fallback) */
  logo: string;
  /** Footer-specific logo */
  footerLogo: string;
  /** Signup-page-specific logo (falls back to effectivePlatformLogo → static fallback) */
  signupLogo: string;
  /** The raw org-level logo URL (null if org has no custom logo) */
  orgLogo: string | null;
  /** The raw platform logo URL from landing page content */
  platformLogo: string | null;
  /** True when an uploaded logo is active (not the static built-in fallback) */
  isCustomLogo: boolean;
  /** True when the footer logo is an uploaded one */
  isCustomFooterLogo: boolean;
  /** True when the signup logo is an uploaded one */
  isCustomSignupLogo: boolean;
  /** Call after uploading a new logo to refresh all pages */
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

export function LogoProvider({ children }: { children: ReactNode }) {
  const [platformHeaderLogo, setPlatformHeaderLogo] = useState<string | null>(null);
  const [platformFooterLogo, setPlatformFooterLogo] = useState<string | null>(null);
  const [platformSignupLogo, setPlatformSignupLogo] = useState<string | null>(null);
  const [platformLogo, setPlatformLogo] = useState<string | null>(null);
  const [orgLogo, setOrgLogo] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  const [location] = useLocation();
  const { orgSlug } = getOrgRoutingContext(location);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/landing-page")
      .then(r => r.ok ? r.json() : {})
      .then((d: any) => {
        if (cancelled) return;
        const headerUrl = (d.headerLogoUrl as string) || null;
        const footerUrl = (d.footerLogoUrl as string) || null;
        const signupUrl = (d.signupLogoUrl as string) || null;
        const logoUrl   = (d.logoUrl as string)       || null;

        const apply = () => {
          if (!cancelled) {
            setPlatformHeaderLogo(headerUrl);
            setPlatformFooterLogo(footerUrl);
            setPlatformSignupLogo(signupUrl);
            setPlatformLogo(logoUrl);
          }
        };

        // Pre-load the visible logo before updating state so the swap is
        // instantaneous (no blank gap while the browser fetches the new URL).
        const preload = headerUrl || logoUrl;
        if (preload) {
          const img = new window.Image();
          img.onload  = apply;
          img.onerror = apply;   // still update even if image fails
          img.src = preload;
        } else {
          apply();
        }
      })
      .catch(() => {});

    if (orgSlug) {
      fetch(`/api/orgs/resolve?subdomain=${encodeURIComponent(orgSlug)}`)
        .then(r => r.ok ? r.json() : {})
        .then((d: any) => {
          if (cancelled) return;
          const url = (d.logoUrl as string) || null;
          if (url) {
            const img = new window.Image();
            img.onload  = () => { if (!cancelled) setOrgLogo(url); };
            img.onerror = () => { if (!cancelled) setOrgLogo(url); };
            img.src = url;
          } else {
            setOrgLogo(null);
          }
        })
        .catch(() => {});
    } else {
      setOrgLogo(null);
    }

    return () => { cancelled = true; };
  }, [orgSlug, tick]);

  const effectivePlatformLogo = platformHeaderLogo || platformLogo || null;
  const logo = orgLogo || effectivePlatformLogo || logoWhiteStatic;
  const footerLogo = orgLogo || platformFooterLogo || effectivePlatformLogo || logoWhiteStatic;
  const signupLogo = platformSignupLogo || effectivePlatformLogo || logoWhiteStatic;

  const isCustomLogo = logo !== logoWhiteStatic;
  const isCustomFooterLogo = footerLogo !== logoWhiteStatic;
  const isCustomSignupLogo = signupLogo !== logoWhiteStatic;

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
