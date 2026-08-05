import { useEffect, useState, lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
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
const RequestAccess = lazy(() => import("./pages/request-access"));
const SignupSuccess = lazy(() => import("./pages/signup-success"));
const SuperAdminPanel = lazy(() => import("./pages/super-admin"));
const RootSignIn = lazy(() => import("./pages/root-sign-in"));

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
  headerPrimaryCtaLabel: "Sign Up",
  headerPrimaryCtaHref: "/signup",
  heroEyebrow: "Private missionary updates",
  heroTitle: "Connecting churches with the missionaries they send.",
  heroDescription: "A private space where your missionaries share updates, photos, and prayer needs — and your church stays close to the work it supports.",
  primaryCtaLabel: "Sign Up",
  primaryCtaHref: "/signup",
  previewCardTitle: "Mission Moments",
  previewLabel: "Latest field updates",
  previewTitle1: "Prayer gathering in Kigali",
  previewTitle2: "New family visits this week",
  previewTitle3: "Youth outreach photos shared",
  howItWorksLabel: "How it works",
  howItWorksHeading: "Connecting churches and field teams",
  step1Title: "1. Request access",
  step1Description: "Tell us about your church and we'll set up your organization with its own subdomain.",
  step2Title: "2. Use your portal",
  step2Description: "Your team signs in at your dedicated address, such as rvc.sentconnect.org/login.",
  step3Title: "3. Share updates",
  step3Description: "Invite field users, collect reports, and keep your church connected to ministry work.",
  ctaBandHeading: "Bring your church and field teams closer together.",
  ctaBandSubtext: "",
  footerBrandName: "SentConnect",
  footerOwnerText: "Holtek Solutions LLC, 2108 N ST STE N, Sacramento, CA 95816 USA",
};

function LandingPage() {
  const [content, setContent] = useState<LandingPageContent>(DEFAULT_LANDING_PAGE_CONTENT);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { logo: lpLogo, footerLogo: lpFooterLogo, isLogoReady } = useLogo();
  const [, navigate] = useLocation();

  function handleCtaClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) return;
    e.preventDefault();
    navigate(href);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/landing-page", { cache: "no-store" })
      .then((res) => res.ok ? res.json() : DEFAULT_LANDING_PAGE_CONTENT)
      .then((data) => { if (!cancelled) setContent({ ...DEFAULT_LANDING_PAGE_CONTENT, ...data }); })
      .catch(() => { if (!cancelled) setContent(DEFAULT_LANDING_PAGE_CONTENT); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const BLUE = "#1085FD";

  const features = [
    {
      title: "A live feed from the field",
      desc: "Missionaries share ministry moments as they happen — through short stories, prayer requests, and ministry updates — so your church stays connected to what God is doing throughout the year, not just through occasional newsletters.",
      icon: <path d="M4 5h16v14H4zM4 10h16M9 5v5" />,
    },
    {
      title: "Pray and encourage from anywhere",
      desc: "Church missions teams and authorized members can like, love, and comment on every update — turning one-way newsletters into meaningful conversations and reminding missionaries they are supported.",
      icon: <path d="M12 21s-7-4.6-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12C19 16.4 12 21 12 21z" />,
    },
    {
      title: "Private and secure by design",
      desc: "Your church receives its own dedicated address, such as yourchurch.sentconnect.org. Your mission feed is accessible only to invited members, and updates are shared outside your church only when you choose.",
      icon: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-[#1085FD]/20 selection:text-[#1085FD]" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

      {/* ── NAV ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "py-2 shadow-md" : "py-3"}`} style={{ background: BLUE }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <img src={lpLogo} alt="SentConnect" fetchPriority="high" className="h-14 md:h-16" style={{ width: "auto", maxWidth: 220, display: "block", opacity: isLogoReady ? 1 : 0, transition: "opacity .25s ease" }} />
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-2">
            <a href="/about" className="text-sm font-semibold text-white/90 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/10" style={{ textDecoration: "none" }}>About</a>
            <a
              href="/login"
              onClick={e => handleCtaClick(e, "/login")}
              className="text-sm font-semibold text-white/90 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/10"
              style={{ textDecoration: "none" }}
            >Sign In</a>
            <a
              href="https://demo.sentconnect.org/"
              className="text-sm font-semibold text-white/90 hover:text-white transition-colors flex items-center gap-1.5 px-4 py-2 rounded-full hover:bg-white/10"
              style={{ textDecoration: "none" }}
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/25">
                <Play className="w-2.5 h-2.5 fill-white text-white" />
              </span>
              Try Demo
            </a>
            <a
              href={content.headerPrimaryCtaHref}
              onClick={e => handleCtaClick(e, content.headerPrimaryCtaHref)}
              className="text-sm font-bold px-5 py-2.5 rounded-full transition-all ml-1"
              style={{ background: "#FFFFFF", color: "#0B67C2", textDecoration: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.16)" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#F0F7FF"; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 4px 14px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#FFFFFF"; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.16)"; }}
            >{content.headerPrimaryCtaLabel}</a>
          </div>

          {/* Mobile: demo + signup + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <a href="https://demo.sentconnect.org/" className="text-xs font-bold text-white border border-white/50 bg-white/10 px-3 py-1.5 rounded-full" style={{ textDecoration: "none" }}>Demo</a>
            <a href={content.headerPrimaryCtaHref} onClick={e => handleCtaClick(e, content.headerPrimaryCtaHref)} className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "#FFFFFF", color: "#111827", textDecoration: "none" }}>{content.headerPrimaryCtaLabel}</a>
            <button onClick={() => setMobileNavOpen(o => !o)} className="p-2 rounded-lg bg-white/15 text-white" aria-label="Menu">
              {mobileNavOpen
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
              }
            </button>
          </div>
        </div>
        {mobileNavOpen && (
          <div className="md:hidden border-t border-white/15 px-6 py-4 space-y-4" style={{ background: "#0070E0" }}>
            <a href="/about" className="block text-sm font-semibold text-white" style={{ textDecoration: "none" }} onClick={() => setMobileNavOpen(false)}>About</a>
            <a href="/login" className="block text-sm font-semibold text-white" style={{ textDecoration: "none" }} onClick={e => { setMobileNavOpen(false); handleCtaClick(e, "/login"); }}>Sign In</a>
            <a href="https://demo.sentconnect.org/" className="block text-sm font-semibold text-white/90" style={{ textDecoration: "none" }} onClick={() => setMobileNavOpen(false)}>Try Demo</a>
          </div>
        )}
      </nav>

      <main>
        {/* ── HERO ── */}
        <section className="relative pt-36 pb-20 lg:pt-52 lg:pb-32 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[700px] bg-gradient-to-b from-[#1085FD]/8 to-transparent -z-10" />
          <div className="absolute top-1/4 right-0 w-1/2 h-1/2 bg-[#1085FD]/5 blur-[120px] rounded-full -z-10" />

          <div className="max-w-3xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-[#1085FD] text-sm font-semibold mb-6 border border-blue-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1085FD] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1085FD]" />
                </span>
                {content.heroEyebrow}
              </div>

              <h1 className="text-5xl lg:text-6xl leading-[1.08] font-extrabold text-slate-900 tracking-tight mb-6">
                {content.heroTitle}
              </h1>

              <p className="text-xl lg:text-2xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                {content.heroDescription.includes(" — ") ? (
                  <>
                    <span className="block">{content.heroDescription.split(" — ")[0]}</span>
                    <span className="block mt-2">{content.heroDescription.split(" — ").slice(1).join(" — ")}</span>
                  </>
                ) : (
                  content.heroDescription
                )}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={content.primaryCtaHref}
                  onClick={e => handleCtaClick(e, content.primaryCtaHref)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white group transition-all"
                  style={{ background: BLUE, textDecoration: "none", boxShadow: "0 4px 20px rgba(16,133,253,0.32)" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#0e74e0"; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 10px 30px rgba(16,133,253,0.45)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = BLUE; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 4px 20px rgba(16,133,253,0.32)"; }}
                >
                  {content.primaryCtaLabel}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
                <a
                  href="https://demo.sentconnect.org/"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold text-slate-700 bg-white border border-slate-200 transition-all hover:shadow-md hover:bg-slate-50"
                  style={{ textDecoration: "none" }}
                >
                  <Play className="w-4 h-4 fill-slate-700 text-slate-700" />
                  Try Demo
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-28 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="bg-white p-10 rounded-3xl border border-slate-100 transition-all duration-200"
                  style={{ boxShadow: "0 4px 20px rgba(15,23,42,0.05)" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-4px)"; el.style.boxShadow = "0 16px 40px rgba(16,133,253,0.14)"; el.style.borderColor = "#bfdbfe"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 4px 20px rgba(15,23,42,0.05)"; el.style.borderColor = "rgb(241 245 249)"; }}
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-7" style={{ background: "linear-gradient(135deg, #1085FD 0%, #0059D6 100%)", boxShadow: "0 8px 20px rgba(16,133,253,0.30)" }}>
                    <svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">{f.title}</h3>
                  <p className="text-base text-slate-600 leading-[1.8]">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">{content.ctaBandHeading}</h2>
            <p className="text-xl lg:text-2xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Set up your church's private network in minutes.
              <span className="block mt-2">Invite your missionaries. Start connecting.</span>
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href={content.primaryCtaHref}
                onClick={e => handleCtaClick(e, content.primaryCtaHref)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white transition-all"
                style={{ background: BLUE, textDecoration: "none", boxShadow: "0 4px 20px rgba(16,133,253,0.35)" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#0e74e0"; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 10px 30px rgba(16,133,253,0.45)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = BLUE; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 4px 20px rgba(16,133,253,0.35)"; }}
              >
                {content.primaryCtaLabel}
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://demo.sentconnect.org/"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold text-slate-700 bg-white border border-slate-200 transition-all hover:shadow-md hover:bg-slate-50"
                style={{ textDecoration: "none" }}
              >
                <Play className="w-4 h-4 fill-slate-700 text-slate-700" />
                Try Demo
              </a>
            </div>
            {content.ctaBandSubtext && (
              <p className="mt-6 text-sm text-slate-400">{content.ctaBandSubtext}</p>
            )}
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0B1F3A", padding: "72px 24px 0" }}>
        <div className="mx-auto max-w-7xl">
          <div className="lp-footer-brand-row">
            <div className="lp-footer-left">
              <img src={lpFooterLogo} alt="SentConnect" loading="lazy" className="h-16 md:h-20" style={{ width: "auto", maxWidth: 240, display: "block", marginBottom: 16, opacity: isLogoReady ? 1 : 0, transition: "opacity .25s ease" }} />
              <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "#9CA3AF", maxWidth: 280, margin: 0 }}>
                Private updates for churches and mission teams, all in one secure feed.
              </p>
            </div>
            <div className="lp-footer-right" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: "#E5E7EB", margin: 0 }}>Holtek Solutions LLC</p>
              <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0, lineHeight: 1.6, textAlign: "right" }}>2108 N ST STE N, Sacramento, CA 95816</p>
              <a href="tel:+19515514528" style={{ fontSize: 13, color: "#9CA3AF", textDecoration: "none", transition: "color .15s" }} onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}>
                Contact Support at +1-951-551-4528 (Call/WhatsApp)
              </a>
            </div>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 24 }} />
          <div className="lp-footer-legal">
            <p style={{ fontSize: 12.5, color: "#6B7280", margin: 0 }}>{content.footerOwnerText}</p>
            <p style={{ fontSize: 12.5, color: "#6B7280", margin: 0, flexShrink: 0 }}>© {new Date().getFullYear()} Holtek Solutions. All rights reserved.</p>
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
    fetch("/api/landing-page", { cache: "no-store" })
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
      <footer style={{ background: "#0B1F3A", padding: "72px 24px 0" }}>
        <div className="mx-auto max-w-6xl">
          <div className="lp-footer-brand-row">
            <div className="lp-footer-left">
              <img src={lpLogo} alt="SentConnect" loading="lazy" style={{ height: 64, width: "auto", maxWidth: 220, display: "block", marginBottom: 14, opacity: isLogoReady ? 1 : 0, transition: "opacity .25s ease" }} />
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
  if (!orgSlug && isTenantRootHost() && !isPlatformAdminHost()) return <RootSignIn />;
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
      <Route path="/request-access" component={RequestAccess} />
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
