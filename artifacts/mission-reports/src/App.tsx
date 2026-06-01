import { useEffect, useState, lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Shuffle } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth-provider";
import { useAuth } from "@/components/auth-provider";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import { OrgProvider, useOrg } from "@/providers/org-provider";
import { LogoProvider, useLogo } from "@/providers/logo-provider";
import { getOrgRoutingContext, isPlatformAdminHost, isTenantRootHost } from "@/lib/org";
import "./landing-page.css";
import AppPreview from "./pages/app-preview";

// Critical path — eagerly bundled (small or needed immediately)
import Login from "./pages/login";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import PublicPost from "./pages/public-post";
import SignupSuccess from "./pages/signup-success";

// Heavy pages — code-split so share links and first loads stay fast
const Timeline = lazy(() => import("./pages/timeline"));
const ReportDetail = lazy(() => import("./pages/report-detail"));
const Profile = lazy(() => import("./pages/profile"));
const MissionaryProfile = lazy(() => import("./pages/missionary-profile"));
const SubmitReport = lazy(() => import("./pages/submit-report"));
const AdminDashboard = lazy(() => import("./pages/admin"));
const MissionaryDashboard = lazy(() => import("./pages/missionary-dashboard"));
const Signup = lazy(() => import("./pages/signup"));
const SuperAdminPanel = lazy(() => import("./pages/super-admin"));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
    <div className="animate-pulse text-muted-foreground text-sm">Loading…</div>
  </div>
);

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
  howItWorksHeading: "Connecting churches and field teams",
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { logo: lpLogo, footerLogo: lpFooterLogo } = useLogo();
  const [, navigate] = useLocation();

  function handleCtaClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) return;
    e.preventDefault();
    navigate(href);
  }

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

  const BLUE      = "#1085FD";
  const BLUE_DARK = "#1085FD";
  const TEAL      = "#10B981";
  const TEAL_DARK = "#059669";
  const CHARCOAL  = "#1F2937";
  const TEXT      = "#0F172A";
  const TEXT2     = "#64748B";
  const BG        = "#FFFFFF";

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: TEXT, display: "flex", flexDirection: "column", minHeight: "100dvh" }}>

      {/* ── HEADER — white bar ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "#fff", borderBottom: "1px solid #E8ECF0", height: 60, display: "flex", alignItems: "center", padding: "0 36px", flexShrink: 0 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1400, margin: "0 auto", width: "100%" }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            {lpLogo
              ? <img src={lpLogo} alt="SentConnect" style={{ maxHeight: 26, width: "auto", maxWidth: 160, display: "block" }} />
              : <><img src="/favicon.svg" alt="" style={{ width: 26, height: 26, borderRadius: 7, display: "block" }} /><span style={{ fontSize: 16, fontWeight: 800, color: TEXT, letterSpacing: "-0.02em" }}>sentconnect</span></>
            }
          </a>
          <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <a href="/about" style={{ fontSize: 14, fontWeight: 600, color: "#607089", textDecoration: "none", transition: "color .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = TEXT; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#607089"; }}
            >About</a>
            <a href="/help" target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 600, color: "#607089", textDecoration: "none", transition: "color .15s", display: "inline-flex", alignItems: "center", gap: 5 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = TEXT; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#607089"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Help
            </a>
            <a href="/login" style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: BLUE, padding: "8px 22px", borderRadius: 999, textDecoration: "none", transition: "background .15s", display: "inline-flex", alignItems: "center" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#0053CC"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = BLUE; }}
            >Sign in</a>
          </nav>
        </div>
      </header>

      {/* ── HERO — split panel ── */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ flex: "0 0 38%", background: "#EEF2F9", display: "flex", flexDirection: "column", justifyContent: "center", padding: "56px 52px 56px 60px", overflowY: "auto" }}>

          {/* Eyebrow badge */}
          <div style={{ display: "inline-flex", alignItems: "center", marginBottom: 22, background: "rgba(255,255,255,0.75)", borderRadius: 6, padding: "5px 14px", border: "1px solid rgba(16,133,253,0.22)", width: "fit-content" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: BLUE, letterSpacing: "0.12em", textTransform: "uppercase" }}>{content.heroEyebrow}</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: "clamp(30px, 3.2vw, 48px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", color: TEXT, margin: "0 0 18px" }}>
            {content.heroTitle}
          </h1>

          {/* Description */}
          <p style={{ fontSize: 15.5, lineHeight: 1.75, color: "#3A4A5C", margin: "0 0 32px", maxWidth: 360 }}>
            {content.heroDescription}
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, marginBottom: 40, flexWrap: "wrap" }}>
            <a href="/calvary/feed"
              style={{ height: 46, borderRadius: 10, background: BLUE, color: "#fff", fontSize: 14.5, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, padding: "0 22px", transition: "background .15s, transform .15s", boxShadow: "0 4px 14px rgba(16,133,253,0.35)" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#0053CC"; el.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = BLUE; el.style.transform = "translateY(0)"; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>
              Try Demo
            </a>
            <a href={content.primaryCtaHref} onClick={e => handleCtaClick(e, content.primaryCtaHref)}
              style={{ height: 46, borderRadius: 10, background: "#fff", color: TEXT, fontSize: 14.5, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", padding: "0 22px", border: "1.5px solid #C8D4E4", transition: "border-color .15s, transform .15s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = BLUE; el.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#C8D4E4"; el.style.transform = "translateY(0)"; }}
            >Sign up</a>
          </div>

          {/* Feature rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {([
              { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", label: "Secure & Private", desc: "Your mission data is encrypted and protected." },
              { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75", label: "Built for Ministry", desc: "Designed specifically for churches and missionaries." },
              { d: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z", label: "Anytime, Anywhere", desc: "Access updates from any device, any time." },
            ] as const).map(({ d, label, desc }) => (
              <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(16,133,253,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: "0 0 2px" }}>{label}</p>
                  <p style={{ fontSize: 12, color: "#607089", margin: 0, lineHeight: 1.5 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ flex: 1, background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* Heading */}
          <div style={{ padding: "28px 36px 16px 36px", flexShrink: 0 }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: TEXT, margin: "0 0 5px", letterSpacing: "-0.02em" }}>See what it's like inside SentConnect</h2>
            <p style={{ fontSize: 13.5, color: TEXT2, margin: 0 }}>A unified space for mission updates, prayer requests, and real-time connection.</p>
          </div>

          {/* App mockup — browser frame */}
          <div style={{ flex: 1, margin: "0 24px", borderRadius: "12px 12px 0 0", overflow: "hidden", boxShadow: "0 -4px 32px rgba(15,23,42,0.12), 0 -1px 4px rgba(15,23,42,0.06)", display: "flex", flexDirection: "column", minHeight: 0 }}>

            {/* Browser chrome */}
            <div style={{ background: "#E2E5EA", padding: "9px 16px", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FC5C65" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FED330" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#26DE81" }} />
              <div style={{ flex: 1, margin: "0 14px", background: "#fff", borderRadius: 5, padding: "4px 12px", fontSize: 11, color: "#94A3B8" }}>sentconnect.org/calvary/feed</div>
            </div>

            {/* App screenshot — real UI with fictional missionary data */}
            <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
              <img
                src="/app-preview.jpg"
                alt="SentConnect app feed preview"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left", display: "block" }}
              />
            </div>
          </div>

          {/* Bottom CTA bar */}
          <div style={{ margin: "0 24px", padding: "13px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, background: "#F8FAFC", border: "1px solid #E8ECF0", borderTop: "none", borderRadius: "0 0 12px 12px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 34, height: 34, background: "#EEF5FF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: TEXT, margin: 0 }}>Ready to strengthen your mission connections?</p>
                <p style={{ fontSize: 11.5, color: TEXT2, margin: 0 }}>Join churches and mission teams already using SentConnect.</p>
              </div>
            </div>
            <a href="/calvary/feed"
              style={{ height: 34, borderRadius: 8, background: BLUE, color: "#fff", fontSize: 12.5, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, padding: "0 14px", whiteSpace: "nowrap", transition: "background .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#0053CC"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = BLUE; }}
            >
              Open Demo Workspace
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </div>
        </div>
      </div>

      <main>
        {/* ── HOW IT WORKS ── */}
        <section style={{ background: "#fff", padding: "112px 0" }}>
          <div className="mx-auto max-w-6xl px-6">
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>How SentConnect Works</p>
              <h2 style={{ fontSize: "clamp(30px, 3.5vw, 46px)", fontWeight: 900, letterSpacing: "-0.035em", color: TEXT, margin: 0 }}>{content.howItWorksHeading}</h2>
            </div>

            <div className="lp-steps-grid">
              {/* connector line */}
              <div className="lp-connector" style={{ position: "absolute", top: 36, left: "calc(16.66% + 16px)", right: "calc(16.66% + 16px)", height: 1, background: "linear-gradient(90deg, transparent, rgba(138,5,255,0.2), transparent)", pointerEvents: "none" }} />

              {[
                { title: content.step1Title, desc: content.step1Description, n: "01" },
                { title: content.step2Title, desc: content.step2Description, n: "02" },
                { title: content.step3Title, desc: content.step3Description, n: "03" },
              ].map(({ title, desc, n }) => (
                <div key={n} style={{ background: "#fff", borderRadius: 20, padding: "32px 28px", boxShadow: "0 12px 40px rgba(15,23,42,0.08)", border: "1px solid #F1F5F9" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: "0 4px 14px rgba(0,89,214,0.3)" }}>
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
              onClick={e => handleCtaClick(e, content.primaryCtaHref)}
              style={{ display: "inline-flex", alignItems: "center", height: 56, padding: "0 36px", borderRadius: 999, background: TEAL, color: "#fff", fontSize: 16, fontWeight: 800, textDecoration: "none", boxShadow: "0 4px 24px rgba(16,185,129,0.45)", transition: "transform .15s, box-shadow .15s, background .15s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = TEAL_DARK; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 32px rgba(16,185,129,0.55)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = TEAL; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 4px 24px rgba(16,185,129,0.45)"; }}
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
              <img src={logoWhite} alt="SentConnect" style={{ maxHeight: 28, width: "auto", maxWidth: 160, display: "block", marginBottom: 14 }} />
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
                onMouseEnter={e => (e.currentTarget.style.color = "#111827")}
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

type AboutPageContent = { aboutTitle: string; aboutImageUrl: string; aboutBody: string };

const DEFAULT_ABOUT_PAGE_CONTENT: AboutPageContent = {
  aboutTitle: "Why We Created SentConnect",
  aboutImageUrl: "",
  aboutBody: "",
};

function AboutPage() {
  const [lpContent, setLpContent] = useState<LandingPageContent>(DEFAULT_LANDING_PAGE_CONTENT);
  const [about, setAbout] = useState<AboutPageContent>(DEFAULT_ABOUT_PAGE_CONTENT);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { logo: lpLogo } = useLogo();
  const [, navigate] = useLocation();

  function handleCtaClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) return;
    e.preventDefault();
    navigate(href);
  }

  useEffect(() => {
    fetch("/api/landing-page")
      .then(r => r.ok ? r.json() : DEFAULT_LANDING_PAGE_CONTENT)
      .then(d => setLpContent({ ...DEFAULT_LANDING_PAGE_CONTENT, ...d }))
      .catch(() => setLpContent(DEFAULT_LANDING_PAGE_CONTENT));

    fetch("/api/about-page")
      .then(r => r.ok ? r.json() : DEFAULT_ABOUT_PAGE_CONTENT)
      .then(d => setAbout({ ...DEFAULT_ABOUT_PAGE_CONTENT, ...d }))
      .catch(() => setAbout(DEFAULT_ABOUT_PAGE_CONTENT));
  }, []);

  const BLUE      = "#1085FD";
  const BLUE_DARK = "#1085FD";
  const TEXT      = "#0F172A";
  const TEXT2     = "#374151";
  const BG        = "#FFFFFF";

  const paragraphs = about.aboutBody.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: BG, color: TEXT }}>
      {/* ── HEADER ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: BLUE, boxShadow: "0 2px 16px rgba(0,89,214,0.28)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6" style={{ height: 64 }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <img src={logoWhite} alt="SentConnect" style={{ maxHeight: 26, width: "auto", maxWidth: 160, display: "block" }} />
          </a>

          {/* Desktop nav */}
          <nav className="hidden sm:flex" style={{ alignItems: "center", gap: 28 }}>
            <a
              href="/about"
              style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)", textDecoration: "none", transition: "color .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)"; }}
            >About</a>
            <a
              href="/help"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)", textDecoration: "none", transition: "color .15s", display: "inline-flex", alignItems: "center", gap: 5 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Help
            </a>
            <a
              href={lpContent.headerPrimaryCtaHref}
              onClick={e => handleCtaClick(e, lpContent.headerPrimaryCtaHref)}
              style={{ fontSize: 14, fontWeight: 700, color: "#111827", background: "#FFFFFF", padding: "9px 22px", borderRadius: 999, textDecoration: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.14)", transition: "background .15s, transform .15s, box-shadow .15s", display: "inline-flex", alignItems: "center" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#F5F5F5"; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 4px 16px rgba(0,0,0,0.18)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#FFFFFF"; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 2px 10px rgba(0,0,0,0.14)"; }}
            >{lpContent.headerPrimaryCtaLabel}</a>
          </nav>

          {/* Mobile: Sign up pill + hamburger */}
          <div className="flex sm:hidden items-center gap-3">
            <a
              href={lpContent.headerPrimaryCtaHref}
              onClick={e => handleCtaClick(e, lpContent.headerPrimaryCtaHref)}
              style={{ fontSize: 13, fontWeight: 700, color: "#111827", background: "#FFFFFF", padding: "7px 16px", borderRadius: 999, textDecoration: "none" }}
            >{lpContent.headerPrimaryCtaLabel}</a>
            <button
              onClick={() => setMobileNavOpen(o => !o)}
              style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: "7px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              aria-label="Menu"
            >
              {mobileNavOpen
                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileNavOpen && (
          <div className="sm:hidden" style={{ background: BLUE_DARK, borderTop: "1px solid rgba(255,255,255,0.15)", padding: "12px 16px 16px" }}>
            <a
              href="/about"
              style={{ display: "flex", alignItems: "center", padding: "12px 0", fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
              onClick={() => setMobileNavOpen(false)}
            >About</a>
            <a
              href="/help"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0", fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)", textDecoration: "none" }}
              onClick={() => setMobileNavOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Help
            </a>
          </div>
        )}
      </header>

      {/* ── CONTENT ── */}
      <main style={{ padding: "80px 0 120px" }}>
        <div className="mx-auto max-w-2xl px-6">
          {/* Back link */}
          <a
            href="/"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#111827", textDecoration: "none", marginBottom: 40 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.75"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            ← Back to home
          </a>

          {/* Eyebrow */}
          <div style={{ display: "inline-flex", alignItems: "center", marginBottom: 20, background: "#F5F5F5", borderRadius: 999, padding: "4px 14px" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#111827", letterSpacing: "0.1em", textTransform: "uppercase" }}>Our Story</span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, color: TEXT, margin: "0 0 40px" }}>
            {about.aboutTitle}
          </h1>

          {/* Family photo — only rendered when an image has been uploaded */}
          {about.aboutImageUrl && (
            <div style={{ marginBottom: 48, borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 32px rgba(15,23,42,0.10)" }}>
              <img
                src={about.aboutImageUrl}
                alt="The Menna family serving in Ethiopia"
                fetchPriority="high"
                decoding="async"
                style={{ width: "100%", display: "block", objectFit: "cover", maxHeight: 420 }}
              />
            </div>
          )}

          {/* Body */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {paragraphs.length > 0 ? paragraphs.map((para, i) => (
              <p key={i} style={{ fontSize: 17, lineHeight: 1.85, color: TEXT2, margin: 0 }}>
                {para}
              </p>
            )) : (
              <p style={{ fontSize: 17, lineHeight: 1.85, color: TEXT2, margin: 0, opacity: 0.5 }}>Loading…</p>
            )}
          </div>

          {/* CTA */}
          <div style={{ marginTop: 64, paddingTop: 48, borderTop: "1px solid #E2E8F0" }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 20 }}>Ready to connect your church and field teams?</p>
            <a
              href={lpContent.primaryCtaHref}
              onClick={e => handleCtaClick(e, lpContent.primaryCtaHref)}
              style={{ display: "inline-flex", alignItems: "center", height: 52, padding: "0 30px", borderRadius: 14, background: BLUE, color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 20px rgba(0,89,214,0.32)", transition: "background .15s, transform .15s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = BLUE_DARK; el.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = BLUE; el.style.transform = "translateY(0)"; }}
            >{lpContent.primaryCtaLabel}</a>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: "linear-gradient(180deg, #263341 0%, #1F2937 100%)", padding: "72px 24px 0" }}>
        <div className="mx-auto max-w-6xl">
          <div className="lp-footer-brand-row">
            <div className="lp-footer-left">
              <img src={lpLogo} alt="SentConnect" style={{ maxHeight: 28, width: "auto", maxWidth: 160, display: "block", marginBottom: 14 }} />
              <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "#9CA3AF", maxWidth: 280, margin: 0 }}>
                Private updates for churches and mission teams, all in one secure feed.
              </p>
            </div>
            <div className="lp-footer-right">
              <p style={{ fontSize: 13.5, fontWeight: 600, color: "#D1D5DB", margin: "0 0 6px" }}>Holtek Solutions LLC</p>
              <p style={{ fontSize: 13, color: "#9CA3AF", margin: "0 0 6px", lineHeight: 1.6 }}>
                2108 N ST STE N, Sacramento, CA 95816
              </p>
              <a
                href="mailto:support@sentconnect.org"
                style={{ fontSize: 13, color: "#9CA3AF", textDecoration: "none", transition: "color .15s", display: "inline-block" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#111827")}
                onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
              >
                support@sentconnect.org
              </a>
            </div>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 24 }} />
          <div className="lp-footer-legal">
            <p style={{ fontSize: 12.5, color: "#6B7280", margin: 0 }}>{lpContent.footerOwnerText}</p>
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
        <a href="/" className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#111827] text-sm font-bold text-white hover:bg-[#000000]">
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "#111827" }}>
      <div className="w-full max-w-[440px] bg-white rounded-2xl px-8 py-10 text-center" style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-50 border-2 border-gray-100">
          <span className="text-gray-600 text-2xl font-bold">!</span>
        </div>
        <h1 className="text-[22px] font-bold text-gray-900 mb-2">Organization not found</h1>
        <p className="text-[14px] text-gray-500 mb-6">
          No SentConnect organization is registered for <span className="font-semibold text-gray-700">{orgSlug}</span>.
          {reason ? ` ${reason}` : ""}
        </p>
        <a href="/" className="inline-flex w-full h-11 items-center justify-center rounded-xl text-[15px] font-bold text-white bg-[#111827] hover:bg-[#000000] transition-colors">
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
    <Suspense fallback={<PageFallback />}>
    <Switch>
      {/* Platform-level public pages — available in all environments */}
      <Route path="/about" component={AboutPage} />
      {/* Org user login — always /{org}/login */}
      <Route path="/login" component={LoginRoute} />
      <Route path="/sentconnect-home" component={LandingPreviewRoute} />
      <Route path="/app-preview" component={AppPreview} />
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
            <Route path="/about" component={AboutPage} />
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
    </Suspense>
  );
}

/**
 * Sits inside WouterRouter so it can read the current location.
 * Detects either production hostname routing (org.sentconnect.org) or
 * development path routing (/org/...) and provides the org context.
 */
function OrgAwareApp() {
  const [location] = useLocation();

  // Share links (/post/:id) render directly — no org validation or auth check.
  // Removing those two serial API calls cuts 400–800 ms off the first paint.
  if (/^\/post\/\d+/.test(location)) {
    return (
      <Switch>
        <Route path="/post/:id" component={PublicPost} />
      </Switch>
    );
  }

  const { orgSlug, usesPathPrefix } = getOrgRoutingContext(location);

  return (
    <OrgProvider orgSlug={orgSlug} usesPathPrefix={usesPathPrefix}>
      <LogoProvider>
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
      </LogoProvider>
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
