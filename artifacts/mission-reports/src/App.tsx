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

// Critical path — eagerly bundled (small or needed immediately)
import Login from "./pages/login";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import PublicPost from "./pages/public-post";
import SignupSuccess from "./pages/signup-success";
import Demo from "./pages/demo";
import DemoUser from "./pages/demo-user";

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
  previewCardTitle: "Latest Updates",
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
  const { logo: lpLogo, footerLogo: lpFooterLogo, isLogoReady } = useLogo();
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
  const BLUE_DARK = "#0070E0";
  const TEAL      = "#1085FD";
  const TEAL_DARK = "#0070E0";
  const CHARCOAL  = "#1F2937";
  const TEXT      = "#0F172A";
  const TEXT2     = "#64748B";
  const BG        = "#FFFFFF";

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: BG, color: TEXT }}>
      {/* ── HEADER ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: BLUE }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6" style={{ height: 80 }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <img src={lpLogo} alt="SentConnect" fetchPriority="high" style={{ height: 64, width: "auto", maxWidth: 220, display: "block", opacity: isLogoReady ? 1 : 0, transition: "opacity .25s ease" }} />
          </a>

          {/* Desktop nav */}
          <nav className="hidden sm:flex" style={{ alignItems: "center", gap: 4, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 999, padding: 4, backdropFilter: "blur(8px)" }}>
            <a
              href="/about"
              style={{ fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", height: 36, minWidth: 96, padding: "0 18px", borderRadius: 999, transition: "background .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >About</a>
            <a
              href="https://demo.sentconnect.org/"
              style={{ fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, height: 36, minWidth: 96, padding: "0 18px", borderRadius: 999, transition: "background .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.25)" }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 1 }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </span>
              Try Demo
            </a>
            <a
              href={content.headerPrimaryCtaHref}
              onClick={e => handleCtaClick(e, content.headerPrimaryCtaHref)}
              style={{ fontSize: 14, fontWeight: 700, color: "#0B67C2", background: "#FFFFFF", display: "inline-flex", alignItems: "center", justifyContent: "center", height: 36, minWidth: 96, padding: "0 20px", borderRadius: 999, textDecoration: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.16)", transition: "background .15s, transform .15s, box-shadow .15s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#F0F7FF"; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 4px 14px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#FFFFFF"; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.16)"; }}
            >{content.headerPrimaryCtaLabel}</a>
          </nav>

          {/* Mobile: Try Demo + Sign up + hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <a
              href="https://demo.sentconnect.org/"
              style={{ fontSize: 12, fontWeight: 700, color: "#fff", border: "1.5px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 999, textDecoration: "none" }}
            >Demo</a>
            <a
              href={content.headerPrimaryCtaHref}
              onClick={e => handleCtaClick(e, content.headerPrimaryCtaHref)}
              style={{ fontSize: 12, fontWeight: 700, color: "#111827", background: "#FFFFFF", padding: "6px 14px", borderRadius: 999, textDecoration: "none" }}
            >{content.headerPrimaryCtaLabel}</a>
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
              style={{ display: "flex", alignItems: "center", padding: "12px 0", fontSize: 15, fontWeight: 700, color: "#fff", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
              onClick={() => setMobileNavOpen(false)}
            >About</a>
            <a
              href="https://demo.sentconnect.org/"
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0", fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)", textDecoration: "none" }}
              onClick={() => setMobileNavOpen(false)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Try Demo
            </a>
          </div>
        )}
      </header>

      <main>
        {/* ── HERO ── */}
        <section className="lp-hero-section" style={{ background: "#FFFFFF", borderBottom: "1px solid #DDE9FF", position: "relative", overflow: "hidden" }}>


          <div className="lp-hero-split mx-auto max-w-6xl px-6">

            {/* ── LEFT: text content ── */}
            <div style={{ paddingRight: 48 }}>
              <div className="lp-animate lp-delay-1" style={{ display: "inline-flex", alignItems: "center", marginBottom: 28, background: BLUE, borderRadius: 999, padding: "6px 16px", gap: 7 }}>
                <svg width="7" height="7" viewBox="0 0 8 8" style={{ flexShrink: 0 }}><circle cx="4" cy="4" r="4" fill="rgba(255,255,255,0.7)" /></svg>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#fff", letterSpacing: "0.11em", textTransform: "uppercase" }}>{content.heroEyebrow}</span>
              </div>

              <h1 className="lp-animate lp-delay-2" style={{ fontSize: "clamp(38px, 4.8vw, 60px)", fontWeight: 900, lineHeight: 1.07, letterSpacing: "-0.04em", color: BLUE, margin: "0 0 24px" }}>
                {content.heroTitle}
              </h1>

              {/* Accent rule */}
              <div className="lp-animate lp-delay-3" style={{ width: 48, height: 4, borderRadius: 999, background: `linear-gradient(90deg, ${BLUE} 0%, #60A5FA 100%)`, margin: "0 0 24px" }} />

              <p className="lp-animate lp-delay-3" style={{ fontSize: 17, lineHeight: 1.85, color: TEXT2, maxWidth: 500, margin: "0 0 44px" }}>
                {content.heroDescription}
              </p>

              <div className="lp-animate lp-delay-4" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <a
                  href={content.primaryCtaHref}
                  onClick={e => handleCtaClick(e, content.primaryCtaHref)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 52, padding: "0 28px", borderRadius: 999, background: `linear-gradient(135deg, ${BLUE} 0%, #0059D6 100%)`, color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 20px rgba(16,133,253,0.38)", transition: "opacity .15s, transform .15s, box-shadow .15s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.opacity = "0.92"; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 8px 28px rgba(16,133,253,0.5)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.opacity = "1"; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 4px 20px rgba(16,133,253,0.38)"; }}
                >
                  Set Up Your Organization
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
                <a
                  href="https://demo.sentconnect.org/"
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 52, padding: "0 24px", borderRadius: 999, background: "#fff", color: "#1085FD", fontSize: 15, fontWeight: 600, textDecoration: "none", border: "1.5px solid #1085FD", boxShadow: "0 2px 8px rgba(16,133,253,0.12)", transition: "border-color .15s, color .15s, box-shadow .15s, background .15s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#EEF6FF"; el.style.boxShadow = "0 4px 16px rgba(16,133,253,0.20)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#fff"; el.style.boxShadow = "0 2px 8px rgba(16,133,253,0.12)"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Try Demo
                </a>
              </div>

            </div>

            {/* ── RIGHT: floating feed UI mockup ── */}
            <div className="lp-hero-split-deco lp-animate lp-delay-5" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 0" }}>
              <div style={{ position: "relative", width: "100%", maxWidth: 380 }}>

                {/* Ghost card — peeking behind with slight rotation */}
                <div style={{ position: "absolute", top: -14, right: -16, left: 24, background: "#fff", borderRadius: 18, padding: "16px 18px", boxShadow: "0 4px 20px rgba(15,23,42,0.07)", border: "1px solid #E8F0FE", transform: "rotate(2.5deg)", opacity: 0.65, zIndex: 0 }}>
                  <div style={{ height: 9, borderRadius: 5, background: "#EEF4FF", width: "65%", marginBottom: 8 }} />
                  <div style={{ height: 7, borderRadius: 4, background: "#F5F7FA", width: "88%", marginBottom: 5 }} />
                  <div style={{ height: 7, borderRadius: 4, background: "#F5F7FA", width: "52%" }} />
                </div>

                {/* Main feed card */}
                <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 16px 56px rgba(15,23,42,0.13), 0 2px 8px rgba(15,23,42,0.05)", border: "1px solid #E0EBFF", overflow: "hidden", position: "relative", zIndex: 1 }}>

                  {/* Card header */}
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${BLUE} 0%, #60A5FA 100%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A" }}>Missions Feed</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
                        <span style={{ fontSize: 11, color: "#64748B" }}>Field updates</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: "#94A3B8", background: "#F8FAFC", border: "1px solid #E2E8F0", padding: "3px 8px", borderRadius: 999 }}>calvary.sentconnect.org</span>
                  </div>

                  {/* Feed items */}
                  {[
                    { title: content.previewTitle1 || "Prayer gathering in Kigali", color: "#DBEAFE", time: "2h ago" },
                    { title: content.previewTitle2 || "New family visits this week", color: "#FCE7F3", time: "3h ago" },
                    { title: content.previewTitle3 || "Youth outreach photos shared", color: "#D1FAE5", time: "5h ago" },
                  ].map(({ title, color, time }, i) => (
                    <div key={i} style={{ padding: "13px 20px", borderBottom: i < 2 ? "1px solid #F8FAFC" : "none", display: "flex", alignItems: "flex-start", gap: 11 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0F172A", marginBottom: 5, lineHeight: 1.35, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <div style={{ height: 7, borderRadius: 3, background: "#F1F5F9", width: "52%" }} />
                          <div style={{ height: 7, borderRadius: 3, background: "#F1F5F9", width: "22%" }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 10.5, color: "#94A3B8", flexShrink: 0, marginTop: 1 }}>{time}</span>
                    </div>
                  ))}

                  {/* Compose bar */}
                  <div style={{ padding: "11px 20px", background: "#FAFBFF", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#E0EBFF", flexShrink: 0 }} />
                    <div style={{ flex: 1, height: 28, borderRadius: 8, background: "#F1F5F9", display: "flex", alignItems: "center", padding: "0 12px" }}>
                      <span style={{ fontSize: 11.5, color: "#94A3B8" }}>Share an update…</span>
                    </div>
                  </div>
                </div>

                {/* Decorative dot cluster */}
                <div style={{ position: "absolute", bottom: -20, right: -24, display: "flex", flexWrap: "wrap", gap: 6, width: 72, opacity: 0.35, pointerEvents: "none" }}>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: BLUE }} />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── STATEMENT BAND ── */}
        <section style={{ background: BLUE, padding: "88px 24px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 600, color: "#fff", lineHeight: 1.6, margin: 0, letterSpacing: "-0.02em" }}>
              Ministry updates shouldn't live in email threads and WhatsApp groups.{" "}
              <em style={{ fontStyle: "italic", color: "#fff" }}>
                SentConnect gives your field teams one private, secure home.
              </em>
            </p>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ background: "#F8FAFF", padding: "104px 0" }}>
          <div className="mx-auto max-w-6xl px-6">
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#EEF6FF", color: BLUE, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 999, marginBottom: 16 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                How SentConnect Works
              </span>
              <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 900, letterSpacing: "-0.035em", color: TEXT, margin: 0 }}>{content.howItWorksHeading}</h2>
            </div>

            <div className="lp-steps-grid">
              {/* connector line */}
              <div className="lp-connector" style={{ position: "absolute", top: 40, left: "calc(16.66% + 16px)", right: "calc(16.66% + 16px)", height: 1, background: "linear-gradient(90deg, transparent, rgba(16,133,253,0.2), transparent)", pointerEvents: "none" }} />

              {[
                {
                  title: content.step1Title, desc: content.step1Description,
                  accent: BLUE, bg: "#EEF5FF",
                  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 12h8M12 8v8"/></svg>
                },
                {
                  title: content.step2Title, desc: content.step2Description,
                  accent: "#7C3AED", bg: "#F3EEFF",
                  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                },
                {
                  title: content.step3Title, desc: content.step3Description,
                  accent: "#059669", bg: "#ECFDF5",
                  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>
                },
              ].map(({ title, desc, accent, bg, icon }, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 20, padding: "36px 28px", boxShadow: "0 4px 24px rgba(15,23,42,0.07), 0 1px 4px rgba(15,23,42,0.03)", border: "1px solid #EBF3FF", transition: "box-shadow .2s, transform .2s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 12px 40px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.05)"; el.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 4px 24px rgba(15,23,42,0.07), 0 1px 4px rgba(15,23,42,0.03)"; el.style.transform = "translateY(0)"; }}
                >
                  {/* Step number badge + icon */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 6px 20px ${accent}40` }}>
                      {icon}
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: bg, border: `2px solid ${accent}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: accent }}>0{i + 1}</span>
                    </div>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: TEXT, margin: "0 0 10px", letterSpacing: "-0.02em" }}>{title}</h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.8, color: TEXT2, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BAND ── */}
        <section style={{ background: `linear-gradient(135deg, #0059D6 0%, #003FA8 100%)`, padding: "100px 24px", position: "relative", overflow: "hidden" }}>
          {/* subtle shine overlay */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 0%, rgba(255,255,255,0.07) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto", position: "relative" }}>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 46px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.035em", lineHeight: 1.2, margin: "0 0 18px" }}>
              {content.ctaBandHeading}
            </h2>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.75)", margin: "0 0 40px", lineHeight: 1.7 }}>
              {content.ctaBandSubtext}
            </p>
            <a
              href={content.primaryCtaHref}
              onClick={e => handleCtaClick(e, content.primaryCtaHref)}
              style={{ display: "inline-flex", alignItems: "center", height: 56, padding: "0 36px", borderRadius: 999, background: "#fff", color: "#003FA8", fontSize: 16, fontWeight: 800, textDecoration: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.2)", transition: "transform .15s, box-shadow .15s, background .15s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#EBF3FF"; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 32px rgba(0,0,0,0.28)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#fff"; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 4px 24px rgba(0,0,0,0.2)"; }}
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
              <img src={lpFooterLogo} alt="SentConnect" loading="lazy" style={{ height: 64, width: "auto", maxWidth: 220, display: "block", marginBottom: 14, opacity: isLogoReady ? 1 : 0, transition: "opacity .25s ease" }} />
              <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "#9CA3AF", maxWidth: 280, margin: 0 }}>
                Private updates for churches and mission teams, all in one secure feed.
              </p>
            </div>

            {/* Right: links + contact info */}
            <div className="lp-footer-right" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
              {/* Quick links */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 6 }}>
                <a href="/about" style={{ fontSize: 13, fontWeight: 600, color: "#9CA3AF", textDecoration: "none", transition: "color .15s" }} onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}>About</a>
                <a href="/help" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: "#9CA3AF", textDecoration: "none", transition: "color .15s", display: "inline-flex", alignItems: "center", gap: 5 }} onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Help &amp; Support
                </a>
              </div>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: "#D1D5DB", margin: 0 }}>Holtek Solutions LLC</p>
              <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0, lineHeight: 1.6, textAlign: "right" }}>
                2108 N ST STE N, Sacramento, CA 95816
              </p>
              <a
                href="tel:+19515514528"
                style={{ fontSize: 13, color: "#9CA3AF", textDecoration: "none", transition: "color .15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
              >
                Contact Support at +1-951-551-4528 (Call/WhatsApp)
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
  const { logo: lpLogo, isLogoReady } = useLogo();
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
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: BLUE }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6" style={{ height: 80 }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <img src={lpLogo} alt="SentConnect" fetchPriority="high" style={{ height: 64, width: "auto", maxWidth: 220, display: "block", opacity: isLogoReady ? 1 : 0, transition: "opacity .25s ease" }} />
          </a>

          {/* Desktop nav */}
          <nav className="hidden sm:flex" style={{ alignItems: "center", gap: 4, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 999, padding: 4, backdropFilter: "blur(8px)" }}>
            <a
              href="/about"
              style={{ fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", height: 36, minWidth: 96, padding: "0 18px", borderRadius: 999, transition: "background .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >About</a>
            <a
              href="https://demo.sentconnect.org/"
              style={{ fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, height: 36, minWidth: 96, padding: "0 18px", borderRadius: 999, transition: "background .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.25)" }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 1 }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </span>
              Try Demo
            </a>
            <a
              href={lpContent.headerPrimaryCtaHref}
              onClick={e => handleCtaClick(e, lpContent.headerPrimaryCtaHref)}
              style={{ fontSize: 14, fontWeight: 700, color: "#0B67C2", background: "#FFFFFF", display: "inline-flex", alignItems: "center", justifyContent: "center", height: 36, minWidth: 96, padding: "0 20px", borderRadius: 999, textDecoration: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.16)", transition: "background .15s, transform .15s, box-shadow .15s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#F0F7FF"; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 4px 14px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#FFFFFF"; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.16)"; }}
            >{lpContent.headerPrimaryCtaLabel}</a>
          </nav>

          {/* Mobile: Try Demo + Sign up + hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <a
              href="https://demo.sentconnect.org/"
              style={{ fontSize: 12, fontWeight: 700, color: "#fff", border: "1.5px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 999, textDecoration: "none" }}
            >Demo</a>
            <a
              href={lpContent.headerPrimaryCtaHref}
              onClick={e => handleCtaClick(e, lpContent.headerPrimaryCtaHref)}
              style={{ fontSize: 12, fontWeight: 700, color: "#111827", background: "#FFFFFF", padding: "6px 14px", borderRadius: 999, textDecoration: "none" }}
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
              style={{ display: "flex", alignItems: "center", padding: "12px 0", fontSize: 15, fontWeight: 700, color: "#fff", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
              onClick={() => setMobileNavOpen(false)}
            >About</a>
            <a
              href="https://demo.sentconnect.org/"
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0", fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)", textDecoration: "none" }}
              onClick={() => setMobileNavOpen(false)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Try Demo
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
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#1085FD", textDecoration: "none", marginBottom: 40 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#0059D6"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#1085FD"; }}
          >
            ← Back to home
          </a>

          {/* Header — circular profile photo beside the title, blog-style */}
          <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap", marginBottom: 48 }}>
            {/* Profile photo — circular, medium; only rendered when an image has been uploaded */}
            {about.aboutImageUrl && (
              <img
                src={about.aboutImageUrl}
                alt="The Menna family serving in Ethiopia"
                fetchPriority="high"
                decoding="async"
                style={{ width: 132, height: 132, flexShrink: 0, borderRadius: "50%", objectFit: "cover", boxShadow: "0 8px 32px rgba(15,23,42,0.10)" }}
              />
            )}

            <div style={{ flex: "1 1 260px", minWidth: 0 }}>
              {/* Eyebrow */}
              <div style={{ display: "inline-flex", alignItems: "center", marginBottom: 16, background: "#F5F5F5", borderRadius: 999, padding: "4px 14px" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#111827", letterSpacing: "0.1em", textTransform: "uppercase" }}>Our Story</span>
              </div>

              {/* Title */}
              <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, color: TEXT, margin: 0 }}>
                {about.aboutTitle}
              </h1>
            </div>
          </div>

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
              <img src={lpLogo} alt="SentConnect" loading="lazy" style={{ maxHeight: 28, width: "auto", maxWidth: 160, display: "block", marginBottom: 14, opacity: isLogoReady ? 1 : 0, transition: "opacity .25s ease" }} />
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
                href="tel:+19515514528"
                style={{ fontSize: 13, color: "#9CA3AF", textDecoration: "none", transition: "color .15s", display: "inline-block" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
              >
                Contact Support at +1-951-551-4528 (Call/WhatsApp)
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
  if (user?.role !== "admin" && user?.role !== "field_user" && !isPlatformRole(user?.role)) return <Redirect href="/" />;
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
      <Route path="/signup" component={Signup} />
      <Route path="/signup/success" component={SignupSuccess} />
      <Route path="/try" component={Demo} />
      <Route path="/try-user" component={DemoUser} />
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
              <Route path="/user" component={DemoUser} />
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
