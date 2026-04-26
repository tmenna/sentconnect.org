import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Shuffle } from "lucide-react";
import { LOGO_WHITE, LOGO_BLUE } from "@/hooks/use-platform-logo";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth-provider";
import { useAuth } from "@/components/auth-provider";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import { OrgProvider, useOrg } from "@/providers/org-provider";
import { getOrgRoutingContext, isPlatformAdminHost, isTenantRootHost } from "@/lib/org";

import Timeline from "./pages/timeline";
import ReportDetail from "./pages/report-detail";
import Profile from "./pages/profile";
import MissionaryProfile from "./pages/missionary-profile";
import SubmitReport from "./pages/submit-report";
import Login from "./pages/login";
import AdminDashboard from "./pages/admin";
import MissionaryDashboard from "./pages/missionary-dashboard";
import Signup from "./pages/signup";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import SuperAdminPanel from "./pages/super-admin";
import PublicPost from "./pages/public-post";
import SignupSuccess from "./pages/signup-success";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,      // data stays fresh for 60 s — no redundant refetch on tab switch
      gcTime: 5 * 60 * 1000,     // keep unused data in cache for 5 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type LandingPageContent = {
  logoUrl: string;
  headerLogoUrl: string;
  footerLogoUrl: string;
  headerBrandName: string;
  headerPrimaryCtaLabel: string;
  headerPrimaryCtaHref: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  previewCardTitle: string;
  previewLabel: string;
  previewTitle1: string;
  previewTitle2: string;
  previewTitle3: string;
  howItWorksLabel: string;
  howItWorksHeading: string;
  step1Title: string;
  step1Description: string;
  step2Title: string;
  step2Description: string;
  step3Title: string;
  step3Description: string;
  ctaBandHeading: string;
  ctaBandSubtext: string;
  footerBrandName: string;
  footerOwnerText: string;
};

const DEFAULT_LANDING_PAGE_CONTENT: LandingPageContent = {
  logoUrl: "",
  headerLogoUrl: "",
  footerLogoUrl: "",
  headerBrandName: "SentConnect",
  headerPrimaryCtaLabel: "Sign up",
  headerPrimaryCtaHref: "/signup",
  heroEyebrow: "Private missionary updates",
  heroTitle: "Stay connected with your field teams from one private mission feed.",
  heroDescription: "SentConnect gives churches and mission organizations a dedicated space where missionaries can share updates, photos, prayer needs, and impact reports with the people who support them.",
  primaryCtaLabel: "Set Up Your Organization",
  primaryCtaHref: "/signup",
  previewCardTitle: "Mission Moments",
  previewLabel: "Latest field updates",
  previewTitle1: "Prayer gathering in Kigali",
  previewTitle2: "New family visits this week",
  previewTitle3: "Youth outreach photos shared",
  howItWorksLabel: "How it works",
  howItWorksHeading: "Simple for churches. Powerful for teams.",
  step1Title: "1. Sign up",
  step1Description: "Create your organization and choose a short subdomain, like rvc.",
  step2Title: "2. Use your portal",
  step2Description: "Your team signs in at your dedicated address, such as rvc.sentconnect.org/login.",
  step3Title: "3. Share updates",
  step3Description: "Invite field users, collect reports, and keep your church connected to ministry work.",
  ctaBandHeading: "Bring your church and field teams closer together.",
  ctaBandSubtext: "Set up your organization in minutes.",
  footerBrandName: "SentConnect",
  footerOwnerText: "Holtek Solutions LLC, 2108 N ST STE N, Sacramento, CA 95816 USA",
};

function LandingPage() {
  const [content, setContent] = useState<LandingPageContent>(DEFAULT_LANDING_PAGE_CONTENT);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/landing-page")
      .then((res) => res.ok ? res.json() : DEFAULT_LANDING_PAGE_CONTENT)
      .then((data) => {
        if (!cancelled) setContent({ ...DEFAULT_LANDING_PAGE_CONTENT, ...data });
      })
      .catch(() => {
        if (!cancelled) setContent(DEFAULT_LANDING_PAGE_CONTENT);
      });
    return () => { cancelled = true; };
  }, []);

  const BLUE      = "#1E88FF";
  const BLUE_DARK = "#0A6CFF";
  const YELLOW    = "#FFEB00";
  const CHARCOAL  = "#1F2937";
  const TEXT      = "#0F172A";
  const TEXT2     = "#64748B";
  const BG        = "#F8FBFF";

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: BG, color: TEXT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        @keyframes lp-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-animate  { animation: lp-fade-up 0.6s cubic-bezier(.22,1,.36,1) both; }
        .lp-delay-1  { animation-delay: 0.06s; }
        .lp-delay-2  { animation-delay: 0.14s; }
        .lp-delay-3  { animation-delay: 0.22s; }
        .lp-delay-4  { animation-delay: 0.30s; }
        .lp-delay-5  { animation-delay: 0.40s; }

        .lp-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        .lp-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          position: relative;
        }
        .lp-connector { display: block; }
        .lp-footer-cols {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
          gap: 40px;
        }

        .lp-footer-link {
          display: block;
          font-size: 13.5px;
          color: #9CA3AF;
          text-decoration: none;
          margin-bottom: 10px;
          transition: color .15s;
        }
        .lp-footer-link:hover { color: #1E88FF; }

        .lp-social-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.2);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #9CA3AF;
          font-size: 12px;
          cursor: pointer;
          transition: border-color .15s, color .15s;
          text-decoration: none;
        }
        .lp-social-btn:hover { border-color: #1E88FF; color: #1E88FF; }

        @media (max-width: 1024px) {
          .lp-footer-cols { grid-template-columns: 1fr 1fr 1fr; gap: 32px; }
        }
        @media (max-width: 900px) {
          .lp-steps-grid  { grid-template-columns: 1fr; }
          .lp-connector   { display: none; }
        }
        @media (max-width: 767px) {
          .lp-hero-grid   { grid-template-columns: 1fr; gap: 40px; }
          .lp-footer-cols { grid-template-columns: 1fr 1fr; gap: 28px; }
        }
        @media (max-width: 480px) {
          .lp-footer-cols { grid-template-columns: 1fr; }
        }

        /* ── Footer alignment ── */
        .lp-footer-brand-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: start;
          gap: 40px;
          padding-bottom: 48px;
        }
        .lp-footer-left  { text-align: left; }
        .lp-footer-right { text-align: right; }

        .lp-footer-legal {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: nowrap;
          gap: 16px;
          padding-bottom: 32px;
        }

        @media (max-width: 640px) {
          .lp-footer-brand-row {
            grid-template-columns: 1fr;
            gap: 24px;
            padding-bottom: 32px;
          }
          .lp-footer-left  { text-align: left; }
          .lp-footer-right { text-align: left; }
          .lp-footer-legal {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
        }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: BLUE, boxShadow: "0 2px 16px rgba(30,136,255,0.28)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6" style={{ height: 72 }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            {(content.headerLogoUrl || content.logoUrl || LOGO_WHITE) ? (
              <img src={content.headerLogoUrl || content.logoUrl || LOGO_WHITE} alt={content.headerBrandName} style={{ height: 36, width: "auto", maxWidth: 180, objectFit: "contain" }} />
            ) : (
              <span style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em" }}>{content.headerBrandName}</span>
            )}
          </a>
          <a
            href={content.headerPrimaryCtaHref}
            style={{ fontSize: 14, fontWeight: 700, color: TEXT, background: YELLOW, padding: "9px 22px", borderRadius: 999, textDecoration: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.14)", transition: "background .15s, transform .15s, box-shadow .15s", display: "inline-flex", alignItems: "center" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#F0DE00"; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 4px 16px rgba(0,0,0,0.18)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = YELLOW; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 2px 10px rgba(0,0,0,0.14)"; }}
          >{content.headerPrimaryCtaLabel}</a>
        </div>
      </header>

      <main>
        {/* ── HERO ── */}
        <section style={{ padding: "112px 0 96px", background: BG, position: "relative", overflow: "hidden" }}>
          {/* subtle radial glow */}
          <div style={{ position: "absolute", top: -200, right: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(30,136,255,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div className="lp-hero-grid mx-auto max-w-6xl px-6">
            {/* Left */}
            <div>
              <div className="lp-animate lp-delay-1" style={{ display: "inline-flex", alignItems: "center", marginBottom: 28, background: YELLOW, borderRadius: 999, padding: "5px 16px", boxShadow: "0 2px 10px rgba(255,235,0,0.4)" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: TEXT, letterSpacing: "0.1em", textTransform: "uppercase" }}>{content.heroEyebrow}</span>
              </div>

              <h1 className="lp-animate lp-delay-2" style={{ fontSize: "clamp(42px, 5.5vw, 62px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.04em", color: TEXT, margin: "0 0 24px", whiteSpace: "pre-line" }}>
                {content.heroTitle}
              </h1>

              <p className="lp-animate lp-delay-3" style={{ fontSize: 18, lineHeight: 1.8, color: TEXT2, maxWidth: 460, margin: "0 0 44px" }}>
                {content.heroDescription}
              </p>

              <div className="lp-animate lp-delay-4">
                <a
                  href={content.primaryCtaHref}
                  style={{ display: "inline-flex", alignItems: "center", height: 52, padding: "0 30px", borderRadius: 14, background: BLUE, color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 20px rgba(30,136,255,0.32)", transition: "background .15s, transform .15s, box-shadow .15s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = BLUE_DARK; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 8px 28px rgba(30,136,255,0.4)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = BLUE; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 4px 20px rgba(30,136,255,0.32)"; }}
                >{content.primaryCtaLabel}</a>
              </div>
            </div>

            {/* Right — Mission Moments card */}
            <div className="lp-animate lp-delay-5" style={{ background: "#fff", borderRadius: 24, boxShadow: "0 12px 40px rgba(15,23,42,0.08), 0 2px 8px rgba(15,23,42,0.04)", padding: "24px", position: "relative" }}>
              {/* accent dot */}
              <div style={{ position: "absolute", top: -12, right: 32, width: 24, height: 24, borderRadius: "50%", background: BLUE, boxShadow: "0 4px 12px rgba(30,136,255,0.45)" }} />

              {/* card header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #F1F5F9" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Shuffle style={{ width: 16, height: 16, color: "#fff" }} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: "-0.01em" }}>{content.previewCardTitle}</p>
                  <p style={{ fontSize: 11, color: "#94A3B8", margin: "2px 0 0" }}>{content.previewLabel}</p>
                </div>
                <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }} />
              </div>

              {/* feed rows */}
              {[
                { title: content.previewTitle1, ago: "2h ago", w: "80%", color: "rgba(30,136,255,0.18)" },
                { title: content.previewTitle2, ago: "3h ago", w: "65%", color: "rgba(30,136,255,0.12)" },
                { title: content.previewTitle3, ago: "5h ago", w: "52%", color: "rgba(30,136,255,0.08)" },
              ].map(({ title, ago, w, color }, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: i < 2 ? "1px solid #F8FAFC" : "none" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</p>
                    <p style={{ fontSize: 11, color: "#94A3B8", margin: "0 0 8px" }}>{ago}</p>
                    <div style={{ height: 5, background: "rgba(30,136,255,0.08)", borderRadius: 999, width: "100%" }} />
                    <div style={{ height: 5, background: "rgba(30,136,255,0.06)", borderRadius: 999, width: w, marginTop: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ background: "#fff", padding: "112px 0" }}>
          <div className="mx-auto max-w-6xl px-6">
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>HOW IT WORKS</p>
              <h2 style={{ fontSize: "clamp(30px, 3.5vw, 46px)", fontWeight: 900, letterSpacing: "-0.035em", color: TEXT, margin: 0 }}>{content.howItWorksHeading}</h2>
            </div>

            <div className="lp-steps-grid">
              {/* connector line */}
              <div className="lp-connector" style={{ position: "absolute", top: 36, left: "calc(16.66% + 16px)", right: "calc(16.66% + 16px)", height: 1, background: "linear-gradient(90deg, transparent, rgba(30,136,255,0.2), transparent)", pointerEvents: "none" }} />

              {[
                { title: content.step1Title, desc: content.step1Description, n: "01" },
                { title: content.step2Title, desc: content.step2Description, n: "02" },
                { title: content.step3Title, desc: content.step3Description, n: "03" },
              ].map(({ title, desc, n }) => (
                <div key={n} style={{ background: "#fff", borderRadius: 20, padding: "32px 28px", boxShadow: "0 12px 40px rgba(15,23,42,0.08)", border: "1px solid #F1F5F9" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: "0 4px 14px rgba(30,136,255,0.3)" }}>
                    <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", letterSpacing: "0.02em" }}>{n}</span>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: TEXT, margin: "0 0 12px", letterSpacing: "-0.025em" }}>{title}</h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.75, color: TEXT2, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BAND ── */}
        <section style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_DARK} 100%)`, padding: "100px 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 46px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.035em", lineHeight: 1.2, margin: "0 0 18px" }}>
              {content.ctaBandHeading}
            </h2>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.78)", margin: "0 0 40px", lineHeight: 1.7 }}>
              {content.ctaBandSubtext}
            </p>
            <a
              href={content.primaryCtaHref}
              style={{ display: "inline-flex", alignItems: "center", height: 56, padding: "0 36px", borderRadius: 999, background: YELLOW, color: TEXT, fontSize: 16, fontWeight: 800, textDecoration: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.18)", transition: "transform .15s, box-shadow .15s, background .15s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#F0DE00"; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 32px rgba(0,0,0,0.24)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = YELLOW; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 4px 24px rgba(0,0,0,0.18)"; }}
            >{content.primaryCtaLabel}</a>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: `linear-gradient(180deg, #263341 0%, ${CHARCOAL} 100%)`, padding: "72px 24px 0" }}>
        <div className="mx-auto max-w-6xl">
          {/* Row 1 — brand left / contact right */}
          <div className="lp-footer-brand-row">
            {/* Left: logo + tagline */}
            <div className="lp-footer-left">
              {(content.footerLogoUrl || LOGO_WHITE) ? (
                <img src={content.footerLogoUrl || LOGO_WHITE} alt={content.footerBrandName} style={{ height: 36, width: "auto", maxWidth: 160, objectFit: "contain", marginBottom: 14, display: "block" }} />
              ) : (
                <span style={{ fontSize: 17, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", display: "block", marginBottom: 14 }}>{content.footerBrandName}</span>
              )}
              <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "#9CA3AF", maxWidth: 280, margin: 0 }}>
                Private updates for churches and mission teams, all in one secure feed.
              </p>
            </div>

            {/* Right: contact info */}
            <div className="lp-footer-right">
              <p style={{ fontSize: 13.5, fontWeight: 600, color: "#D1D5DB", margin: "0 0 6px" }}>Holtek Solutions LLC</p>
              <p style={{ fontSize: 13, color: "#9CA3AF", margin: "0 0 6px", lineHeight: 1.6 }}>
                2108 N ST STE N, Sacramento, CA 95816
              </p>
              <a
                href="mailto:support@sentconnect.org"
                style={{ fontSize: 13, color: "#9CA3AF", textDecoration: "none", transition: "color .15s", display: "inline-block" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#1E88FF")}
                onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
              >
                support@sentconnect.org
              </a>
            </div>
          </div>

          {/* Divider — equal spacing above (from brand row pb) and below (mb) */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 24 }} />

          {/* Row 2 — legal bar */}
          <div className="lp-footer-legal">
            <p style={{ fontSize: 12.5, color: "#6B7280", margin: 0 }}>{content.footerOwnerText}</p>
            <p style={{ fontSize: 12.5, color: "#6B7280", margin: 0, flexShrink: 0 }}>© 2026 Holtek Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AdminAccessMoved() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm border border-slate-200">
        <h1 className="text-2xl font-black text-slate-950">Admin access has moved</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The main platform admin is no longer available from sentconnect.org/admin.
        </p>
        <a href="/" className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#1898F3] text-sm font-bold text-white hover:bg-[#1280D0]">
          Return to SentConnect
        </a>
      </div>
    </div>
  );
}

/**
 * Loading shell shown while the auth query is in flight.
 * Prevents a flash of the redirect-to-login before the session resolves.
 */
function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
      <div className="animate-pulse text-muted-foreground text-sm">Loading…</div>
    </div>
  );
}

function OrgUnavailable({ orgSlug, reason }: { orgSlug: string; reason?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "#1898F3" }}>
      <div className="w-full max-w-[440px] bg-white rounded-2xl px-8 py-10 text-center" style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-50 border-2 border-red-100">
          <span className="text-red-600 text-2xl font-bold">!</span>
        </div>
        <h1 className="text-[22px] font-bold text-gray-900 mb-2">Organization not found</h1>
        <p className="text-[14px] text-gray-500 mb-6">
          No SentConnect organization is registered for <span className="font-semibold text-gray-700">{orgSlug}</span>.
          {reason ? ` ${reason}` : ""}
        </p>
        <a href="/" className="inline-flex w-full h-11 items-center justify-center rounded-xl text-[15px] font-bold text-white bg-[#1898F3] hover:bg-[#1280D0] transition-colors">
          Go to SentConnect
        </a>
      </div>
    </div>
  );
}

function OrgGate({ orgSlug, children }: { orgSlug: string | null; children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "valid" | "missing" | "inactive">(() => orgSlug ? "loading" : "valid");

  useEffect(() => {
    let cancelled = false;

    async function resolveOrg() {
      if (!orgSlug) {
        setState("valid");
        return;
      }

      setState("loading");
      try {
        const res = await fetch(`/api/orgs/resolve?subdomain=${encodeURIComponent(orgSlug)}`, {
          credentials: "include",
        });

        if (cancelled) return;
        if (res.status === 404) {
          setState("missing");
          return;
        }
        if (!res.ok) {
          setState("missing");
          return;
        }

        const org = await res.json();
        setState(org.status === "active" ? "valid" : "inactive");
      } catch {
        if (!cancelled) setState("missing");
      }
    }

    resolveOrg();
    return () => {
      cancelled = true;
    };
  }, [orgSlug]);

  if (!orgSlug || state === "valid") return <>{children}</>;
  if (state === "loading") return <AuthLoading />;
  if (state === "inactive") return <OrgUnavailable orgSlug={orgSlug} reason="This organization is currently inactive." />;
  return <OrgUnavailable orgSlug={orgSlug} />;
}

const PLATFORM_ROLES = ["super_admin", "platform_admin", "platform_manager"] as const;
function isPlatformRole(role: string | undefined) {
  return (PLATFORM_ROLES as readonly string[]).includes(role ?? "");
}

function HomeRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <AuthLoading />;
  if (!isAuthenticated) return <Redirect href="/login" />;
  if (isPlatformRole(user?.role) || user?.role === "admin") return <Redirect href="/admin" />;
  return <MissionaryDashboard />;
}

function AdminFeedRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  if (isLoading) return <AuthLoading />;
  if (!isAuthenticated) return <Redirect href={`/login?from=${encodeURIComponent(location)}`} />;
  if (user?.role !== "admin" && !isPlatformRole(user?.role)) return <Redirect href="/" />;
  return <Timeline />;
}

function LoginRoute() {
  const { orgSlug } = useOrg();
  if (!orgSlug && isTenantRootHost() && !isPlatformAdminHost()) return <LandingPage />;
  return <Login platformMode={isPlatformAdminHost()} />;
}

function LandingPreviewRoute() {
  if (!import.meta.env.DEV) return <NotFound />;
  return <LandingPage />;
}

/**
 * /admin — two contexts:
 *
 * Platform context (no org slug in URL, e.g. sentconnect.org/admin):
 *   - Not authenticated  → render Login directly (so /admin IS the login page)
 *   - super_admin / platform_admin / platform_manager → SuperAdminPanel
 *   - admin (org-level)  → AdminDashboard scoped to their org via session
 *
 * Org context (e.g. /calvary/admin):
 *   - Not authenticated  → redirect to /{org}/login
 *   - admin / super_admin → AdminDashboard for that org
 */
function AdminRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { orgSlug } = useOrg();
  const [location] = useLocation();
  const platformHost = isPlatformAdminHost();

  if (isLoading) return <AuthLoading />;

  // Org context — send unauthenticated users to the org login page
  if (orgSlug) {
    if (!isAuthenticated) return <Redirect href={`/login?from=${encodeURIComponent(location)}`} />;
    if (user?.role !== "admin" && user?.role !== "super_admin") return <Redirect href="/" />;
    return <Layout><AdminDashboard /></Layout>;
  }

  if (isTenantRootHost() && !platformHost) return <AdminAccessMoved />;

  // Platform context — only available from the reserved platform admin host
  if (!isAuthenticated) return <Login platformMode />;

  if (isPlatformRole(user?.role)) return <SuperAdminPanel />;
  if (user?.role === "admin") return <Layout><AdminDashboard /></Layout>;
  return <Redirect href="/" />;
}

function AppRoutes() {
  const platformHost = isPlatformAdminHost();
  const tenantRootHost = isTenantRootHost();

  return (
    <Switch>
      {/* Org user login — always /{org}/login */}
      <Route path="/login" component={LoginRoute} />
      <Route path="/sentconnect-home" component={LandingPreviewRoute} />
      <Route path="/signup" component={Signup} />
      <Route path="/signup/success" component={SignupSuccess} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      {/* Public shareable post view — no auth required */}
      <Route path="/post/:id" component={PublicPost} />
      {/* /admin handles its own layout (login page or panel) */}
      <Route path="/admin" component={AdminRoute} />
      <Route path="/super-admin"><Redirect href="/admin" /></Route>
      <Route>
        {platformHost ? (
          <Switch>
            <Route path="/"><AdminRoute /></Route>
            <Route component={NotFound} />
          </Switch>
        ) : tenantRootHost ? (
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route component={NotFound} />
          </Switch>
        ) : (
          <Layout>
            <Switch>
              <Route path="/" component={HomeRoute} />
              <Route path="/feed" component={AdminFeedRoute} />
              <Route path="/reports/:id" component={ReportDetail} />
              <Route path="/missionaries/:id" component={MissionaryProfile} />
              <Route path="/submit" component={SubmitReport} />
              <Route path="/profile" component={Profile} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        )}
      </Route>
    </Switch>
  );
}

/**
 * Sits inside WouterRouter so it can read the current location.
 * Detects either production hostname routing (org.sentconnect.org) or
 * development path routing (/org/...) and provides the org context.
 */
function OrgAwareApp() {
  const [location] = useLocation();
  const { orgSlug, usesPathPrefix } = getOrgRoutingContext(location);

  return (
    <OrgProvider orgSlug={orgSlug} usesPathPrefix={usesPathPrefix}>
      <OrgGate orgSlug={orgSlug}>
        <AuthProvider>
          <TooltipProvider>
            {orgSlug && usesPathPrefix ? (
              <WouterRouter base={`/${orgSlug}`}>
                <AppRoutes />
              </WouterRouter>
            ) : (
              <AppRoutes />
            )}
          </TooltipProvider>
        </AuthProvider>
      </OrgGate>
    </OrgProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <OrgAwareApp />
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
