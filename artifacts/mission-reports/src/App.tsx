import { useEffect, useState, lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "framer-motion";
import logoWhite from "@/assets/logo-white.png";
import aboutFamilyPhoto from "@/assets/about-family.jpg";
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
import { ArrowRight, Play, Heart, MessageCircle, MapPin, Check, Shield, Bell, ArrowUpRight } from "lucide-react";

// Critical path — eagerly bundled (small or needed immediately)
import Login from "./pages/login";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import PublicPost from "./pages/public-post";
import Demo from "./pages/demo";
import DemoUser from "./pages/demo-user";

// Heavy pages — code-split so share links and first loads stay fast
import heroPostImg from "@assets/generated_images/hero-missionary-phone.jpg";
import clinicImg from "@assets/generated_images/brazil-clinic.jpg";
import bibleStudyImg from "@assets/generated_images/kenya-bible-study.jpg";
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
  heroTitle: "Connecting Churches with the missionaries they send and support.",
  heroDescription: "A private space where your missionaries share updates, photos, and prayer needs, and your Church can see what's happening across the field — all in one dashboard.",
  primaryCtaLabel: "Sign Up",
  primaryCtaHref: "/signup",
  previewCardTitle: "Mission Moments",
  previewLabel: "Latest field updates",
  previewTitle1: "Prayer gathering in Kigali",
  previewTitle2: "New family visits this week",
  previewTitle3: "Youth outreach photos shared",
  howItWorksLabel: "How it works",
  howItWorksHeading: "Connecting Churches and field teams",
  step1Title: "1. Request access",
  step1Description: "Tell us about your Church and we'll set up your organization with its own subdomain.",
  step2Title: "2. Use your portal",
  step2Description: "Your team signs in at your dedicated address, such as rvc.sentconnect.org/login.",
  step3Title: "3. Share updates",
  step3Description: "Invite field users, collect reports, and keep your Church connected to ministry work.",
  ctaBandHeading: "Bring your Church and field teams closer together.",
  ctaBandSubtext: "",
  footerBrandName: "SentConnect",
  footerOwnerText: "Holtek Solutions LLC, 2108 N ST STE N, Sacramento, CA 95816 USA",
};

// ── Support contact (shown in top bar + footer) ──────────────────────────────
const SUPPORT_PHONE_DISPLAY = "+1-951-551-4528";
const SUPPORT_PHONE_TEL = "+19515514528";
const SUPPORT_EMAIL = "holly@holteksolutions.com";

function ContactTopBar({ background = "#0A5FB5" }: { background?: string }) {
  const link: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6,
    color: "rgba(255,255,255,0.92)", textDecoration: "none",
    fontSize: 12.5, fontWeight: 600, lineHeight: 1,
    padding: "4px 6px", borderRadius: 6, transition: "color .15s, background .15s",
  };
  const hoverOn = (e: React.MouseEvent<HTMLElement>) => { const el = e.currentTarget as HTMLElement; el.style.color = "#fff"; el.style.background = "rgba(255,255,255,0.12)"; };
  const hoverOff = (e: React.MouseEvent<HTMLElement>) => { const el = e.currentTarget as HTMLElement; el.style.color = "rgba(255,255,255,0.92)"; el.style.background = "transparent"; };

  return (
    <div style={{ background }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center sm:justify-end gap-1 sm:gap-3 flex-wrap" style={{ minHeight: 34, paddingTop: 4, paddingBottom: 4 }}>
        <span className="hidden md:inline" style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Contact Support
        </span>
        <a href={`tel:${SUPPORT_PHONE_TEL}`} style={link} onMouseEnter={hoverOn} onMouseLeave={hoverOff} aria-label={`Call support at ${SUPPORT_PHONE_DISPLAY}`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          {SUPPORT_PHONE_DISPLAY}
        </a>
        <a href={`https://wa.me/${SUPPORT_PHONE_TEL.replace("+", "")}`} target="_blank" rel="noreferrer" style={link} onMouseEnter={hoverOn} onMouseLeave={hoverOff} aria-label="Chat with support on WhatsApp">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          WhatsApp
        </a>
        <a href={`mailto:${SUPPORT_EMAIL}`} style={link} onMouseEnter={hoverOn} onMouseLeave={hoverOff} aria-label={`Email support at ${SUPPORT_EMAIL}`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          <span className="hidden xs:inline sm:inline">{SUPPORT_EMAIL}</span>
          <span className="inline sm:hidden">Email</span>
        </a>
      </div>
    </div>
  );
}

function LandingPage() {
  // Content is static — bundled with the app, no fetch, no flash.
  const content = DEFAULT_LANDING_PAGE_CONTENT;
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
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ORANGE = "#FF4405";
  const ORANGE_DARK = "#E63D04";

  const features = [
    {
      title: "A live feed from the field",
      desc: "Missionaries share ministry moments as they happen — through short stories, prayer requests, and ministry updates — so your Church stays connected to what God is doing throughout the year, not just through occasional newsletters.",
      icon: <path d="M4 5h16v14H4zM4 10h16M9 5v5" />,
    },
    {
      title: "Pray and encourage from anywhere",
      desc: "Church missions teams and authorized members can like, love, and comment on every update — turning one-way newsletters into meaningful conversations and reminding missionaries they are supported.",
      icon: <path d="M12 21s-7-4.6-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12C19 16.4 12 21 12 21z" />,
    },
    {
      title: "Private and secure by design",
      desc: "Your Church receives its own dedicated address, such as yourchurch.sentconnect.org. Your mission feed is accessible only to invited members, and updates are shared outside your Church only when you choose.",
      icon: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
    },
    {
      title: "Stay informed, instantly",
      desc: "SentConnect keeps communication moving with automatic email notifications. When a missionary posts an update, Church administrators are notified right away — and when admins post or comment, missionaries hear about it immediately. Every Thursday, administrators also receive a Weekly Missionary Digest — a beautifully formatted email gathering the week's updates and photos, ready to forward to the congregation or include in the Sunday bulletin. Both sides stay connected without constantly checking the platform.",
      icon: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-orange-100 selection:text-orange-900" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

      {/* ── NAV ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-white/80 backdrop-blur-md border-b border-orange-50/50"}`}>
        <ContactTopBar background="#171717" />
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            {isLogoReady
              ? <img src={lpLogo} alt="SentConnect" fetchPriority="high" style={{ height: 48, width: "auto", maxWidth: 200 }} />
              : <span className="font-bold text-xl tracking-tight text-neutral-900">SentConnect</span>
            }
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/about" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors" style={{ textDecoration: "none" }}>About</a>
            <a href="/login" onClick={e => handleCtaClick(e, "/login")} className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors" style={{ textDecoration: "none" }}>Sign In</a>
            <a
              href="https://demo.sentconnect.org/"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-1.5"
              style={{ textDecoration: "none" }}
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-50">
                <Play className="w-2.5 h-2.5 fill-[#FF4405] text-[#FF4405]" />
              </span>
              Try Demo
            </a>
            <a
              href={content.headerPrimaryCtaHref}
              onClick={e => handleCtaClick(e, content.headerPrimaryCtaHref)}
              className="h-10 px-5 inline-flex items-center text-sm font-semibold text-white rounded-full shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-200"
              style={{ background: ORANGE, textDecoration: "none" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = ORANGE_DARK; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ORANGE; }}
            >{content.headerPrimaryCtaLabel}</a>
          </div>

          {/* Mobile: demo + signup + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <a href="https://demo.sentconnect.org/" className="text-xs font-bold text-neutral-600 border border-neutral-200 bg-white px-3 py-1.5 rounded-full" style={{ textDecoration: "none" }}>Demo</a>
            <a href={content.headerPrimaryCtaHref} onClick={e => handleCtaClick(e, content.headerPrimaryCtaHref)} className="text-xs font-bold text-white px-3 py-1.5 rounded-full" style={{ background: ORANGE, textDecoration: "none" }}>{content.headerPrimaryCtaLabel}</a>
            <button onClick={() => setMobileNavOpen(o => !o)} className="p-2 rounded-lg bg-orange-50 text-neutral-700" aria-label="Menu">
              {mobileNavOpen
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
              }
            </button>
          </div>
        </div>
        {mobileNavOpen && (
          <div className="md:hidden bg-white border-t border-neutral-100 px-6 py-4 space-y-4 shadow-md">
            <a href="/about" className="block text-sm font-semibold text-neutral-700" style={{ textDecoration: "none" }} onClick={() => setMobileNavOpen(false)}>About</a>
            <a href="/login" className="block text-sm font-semibold text-neutral-700" style={{ textDecoration: "none" }} onClick={e => { setMobileNavOpen(false); handleCtaClick(e, "/login"); }}>Sign In</a>
            <a href="https://demo.sentconnect.org/" className="block text-sm font-semibold text-neutral-700" style={{ textDecoration: "none" }} onClick={() => setMobileNavOpen(false)}>Try Demo</a>
          </div>
        )}
      </nav>

      <main>
        {/* ── HERO ── */}
        <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-50 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/3 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-8 items-center">

              {/* Left copy */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-2xl"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-[#FF4405] text-sm font-medium mb-8 border border-orange-100/50">
                  <span className="w-2 h-2 rounded-full bg-[#FF4405]" />
                  {content.heroEyebrow || "Built for sending churches"}
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-[4rem] font-bold text-neutral-900 leading-[1.05] tracking-tight mb-6">
                  {content.heroTitle}
                </h1>

                <p className="text-lg md:text-xl text-neutral-500 leading-relaxed mb-10 max-w-xl">
                  {content.heroDescription}
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <a
                    href={content.primaryCtaHref}
                    onClick={e => handleCtaClick(e, content.primaryCtaHref)}
                    className="w-full sm:w-auto h-14 px-8 text-white text-base font-semibold rounded-full shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
                    style={{ background: ORANGE, textDecoration: "none" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = ORANGE_DARK; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ORANGE; }}
                  >
                    {content.primaryCtaLabel}
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </a>
                  <a
                    href="https://demo.sentconnect.org/"
                    className="w-full sm:w-auto h-14 px-8 bg-white text-neutral-700 text-base font-semibold rounded-full border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
                    style={{ textDecoration: "none" }}
                  >
                    <Play className="w-4 h-4 fill-neutral-700 text-neutral-700" />
                    Try Demo
                  </a>
                </div>
              </motion.div>

              {/* Right — app window mockup */}
              <motion.div
                initial={{ opacity: 0, x: 20, rotate: 2 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative lg:-mr-12"
              >
                <div className="relative rounded-2xl bg-white border border-neutral-200 shadow-2xl shadow-neutral-900/10 overflow-hidden transform -rotate-1 hover:rotate-0 transition-transform duration-500 origin-bottom-right">
                  {/* Browser header */}
                  <div className="h-12 bg-neutral-50 border-b border-neutral-100 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="mx-auto bg-white rounded-md border border-neutral-200 text-[10px] text-neutral-400 font-medium px-4 py-1 flex items-center gap-2">
                      <Shield className="w-3 h-3" /> grace.sentconnect.org
                    </div>
                  </div>

                  {/* App content */}
                  <div className="p-6 bg-neutral-50/50">
                    <div className="bg-white rounded-xl border border-neutral-100 p-5 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">SJ</div>
                        <div>
                          <p className="font-semibold text-neutral-900 text-sm">Sarah Jenkins</p>
                          <p className="text-xs text-neutral-500 flex items-center gap-1"><MapPin size={10} /> Rural Kenya • 2h ago</p>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-700 leading-relaxed mb-4">
                        The youth outreach program launched today! Over 50 kids showed up for soccer and a short message. Please pray for the follow-up visits this week.
                      </p>
                      <div className="aspect-video rounded-lg overflow-hidden bg-neutral-100 mb-4 border border-neutral-100">
                        <img src={heroPostImg} alt="" aria-hidden="true" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center gap-6 pt-3 border-t border-neutral-100">
                        <div className="flex items-center gap-1.5 text-[#FF4405]">
                          <Heart className="w-5 h-5 fill-current" />
                          <span className="text-sm font-medium">24</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-neutral-400">
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating notification */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.6, type: "spring" }}
                  className="absolute -bottom-6 -left-4 lg:-left-12 bg-white rounded-xl shadow-xl shadow-neutral-900/10 border border-neutral-100 p-4 flex items-center gap-4 z-20 w-72"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#FF4405] shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">New update posted</p>
                    <p className="text-xs text-neutral-500">Email notification sent to members</p>
                  </div>
                </motion.div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── IMPACT BAND ── */}
        <section className="py-12 border-y border-neutral-100 bg-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-lg sm:text-xl font-medium text-neutral-700 leading-relaxed">
              <em className="not-italic font-semibold" style={{ color: ORANGE }}>Stronger relationships</em>,{" "}
              <em className="not-italic font-semibold" style={{ color: ORANGE }}>more informed prayer</em>,{" "}
              <em className="not-italic font-semibold" style={{ color: ORANGE }}>better communication</em> — and a deeper connection between your church and the missionaries you send.
            </p>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-28 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-6">Everything your church needs to stay connected.</h2>
              <p className="text-lg text-neutral-500">Simple enough for anyone in your congregation, and built specifically for churches and the missionaries they send.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="group rounded-3xl bg-neutral-50 p-8 border border-neutral-100 hover:bg-white hover:shadow-xl hover:shadow-neutral-900/5 hover:border-orange-100 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#FF4405] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">{f.title}</h3>
                  <p className="text-neutral-500 leading-relaxed text-sm">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Feature highlights */}
            <div className="mt-32 space-y-32">

              {/* Image left, text right — notifications */}
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-orange-500/10 translate-x-4 translate-y-4 rounded-2xl -z-10 transition-transform group-hover:translate-x-6 group-hover:translate-y-6" />
                  <div className="relative rounded-2xl overflow-hidden border border-neutral-200 shadow-lg">
                    <img src={clinicImg} alt="Medical clinic outreach" loading="lazy" className="w-full h-auto object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-neutral-900/10 rounded-2xl pointer-events-none" />
                  </div>
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-[#FF4405] text-sm font-medium mb-6">
                    <Bell className="w-4 h-4" /> Email Notifications
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6 tracking-tight">Never miss a critical prayer request again.</h3>
                  <p className="text-lg text-neutral-500 leading-relaxed mb-8">
                    Not everyone checks a portal every day. When a missionary posts an update or someone leaves a comment, SentConnect sends an email so your church never misses what's happening in the field.
                  </p>
                  <ul className="space-y-4">
                    {[
                      "Email alerts for new updates and comments",
                      "Formatting optimized for mobile",
                      "Direct links back to the full post to pray and respond",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-neutral-700 font-medium">
                        <div className="w-6 h-6 rounded-full bg-orange-100 text-[#FF4405] flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Text left, image right — Sunday slides */}
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="order-2 lg:order-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-[#FF4405] text-sm font-medium mb-6">
                    <ArrowUpRight className="w-4 h-4" /> Sunday Ready
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6 tracking-tight">From field update to Sunday slides in one click.</h3>
                  <p className="text-lg text-neutral-500 leading-relaxed mb-8">
                    No more copy-pasting from emails or digging through group chats on Saturday night. Mark the week's top field updates as highlights and export them as presentation-ready slides — in one click.
                  </p>
                  <ul className="space-y-4">
                    {[
                      "Mark any post as a highlight from the feed",
                      "Export directly to presentation slides",
                      "High-resolution photos preserved automatically",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-neutral-700 font-medium">
                        <div className="w-6 h-6 rounded-full bg-orange-100 text-[#FF4405] flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="order-1 lg:order-2 relative group">
                  <div className="absolute inset-0 bg-neutral-900/5 -translate-x-4 translate-y-4 rounded-2xl -z-10 transition-transform group-hover:-translate-x-6 group-hover:translate-y-6" />

                  {/* Slides mockup */}
                  <div className="relative bg-neutral-900 rounded-2xl p-2 shadow-2xl border border-neutral-800">
                    <div className="aspect-[16/9] bg-white rounded-xl overflow-hidden relative">
                      <img src={bibleStudyImg} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                      <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 to-neutral-900/40" />
                      <div className="absolute inset-0 p-8 flex flex-col justify-center">
                        <div className="w-12 h-1 mb-6" style={{ background: ORANGE }} />
                        <p className="text-xl md:text-2xl text-white mb-6 max-w-lg leading-snug" style={{ fontFamily: "Georgia, serif" }}>
                          "The new well is finally complete! The whole village came out to celebrate with us."
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white font-bold text-sm">JF</div>
                          <div>
                            <p className="font-bold text-white text-sm">The Jenkins Family</p>
                            <p className="text-xs text-white/70">Ethiopia</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── TESTIMONIAL ── */}
        <section className="py-24 bg-neutral-900 text-white relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <div className="mb-8 flex justify-center" style={{ color: ORANGE }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M10 11L8.5 17H5.5L7 11H5V7H10V11ZM19 11L17.5 17H14.5L16 11H14V7H19V11Z" />
              </svg>
            </div>
            <blockquote className="text-2xl md:text-4xl leading-tight mb-10 text-neutral-100" style={{ fontFamily: "Georgia, serif" }}>
              "Before SentConnect, our church felt disconnected from our sent ones. Now, our congregation prays specifically and immediately for needs on the field. It has transformed our missions culture."
            </blockquote>
            <div>
              <p className="font-bold text-lg">David R.</p>
              <p className="text-neutral-400">Missions Pastor</p>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-28 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="bg-orange-50 rounded-[3rem] p-12 md:p-20 text-center border border-orange-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-white rounded-full blur-3xl opacity-60" />
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: ORANGE }} />

              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 tracking-tight">{content.ctaBandHeading}</h2>
                <p className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto">
                  {content.ctaBandSubtext || "Set up your church's private network in minutes. Invite your missionaries. Start connecting."}
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <a
                    href={content.primaryCtaHref}
                    onClick={e => handleCtaClick(e, content.primaryCtaHref)}
                    className="h-14 px-8 w-full sm:w-auto text-white text-lg font-semibold rounded-full shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center justify-center gap-2"
                    style={{ background: ORANGE, textDecoration: "none" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = ORANGE_DARK; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ORANGE; }}
                  >
                    {content.primaryCtaLabel}
                    <ArrowRight className="w-5 h-5" />
                  </a>
                  <a
                    href="https://demo.sentconnect.org/"
                    className="h-14 px-8 w-full sm:w-auto bg-white text-neutral-700 text-lg font-semibold rounded-full border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors inline-flex items-center justify-center gap-2"
                    style={{ textDecoration: "none" }}
                  >
                    <Play className="w-4 h-4 fill-neutral-700 text-neutral-700" />
                    Try Demo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-neutral-900" style={{ padding: "72px 24px 0" }}>
        <div className="mx-auto max-w-7xl">
          <div className="lp-footer-brand-row">
            <div className="lp-footer-left">
              <img src={lpFooterLogo} alt="SentConnect" loading="lazy" style={{ height: 52, width: "auto", maxWidth: 200, display: "block", marginBottom: 14, opacity: isLogoReady ? 1 : 0, transition: "opacity .25s ease" }} />
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
              <a href="mailto:holly@holteksolutions.com" style={{ fontSize: 13, color: "#9CA3AF", textDecoration: "none", transition: "color .15s" }} onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}>
                holly@holteksolutions.com
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
  aboutImageUrl: aboutFamilyPhoto,
  aboutBody: `We are the Menna family. While serving in Ethiopia, we saw a common challenge: Churches often struggle to stay connected with the missionaries and ministry partners they send and support. Important updates, prayer requests, photos, and ministry reports are often scattered across emails, messaging apps, and social media.

Through years of serving as a bridge between Churches, mission organizations, and field teams, we saw the need for a simple, dedicated platform built specifically for missionary communication.

SentConnect was created to strengthen the connection between Churches and the mission field—helping ministries communicate clearly, stay engaged, and partner more effectively in God's mission.`,
};

function AboutPage() {
  // Content is static — bundled with the app, no fetch, no flash.
  const lpContent = DEFAULT_LANDING_PAGE_CONTENT;
  const about = DEFAULT_ABOUT_PAGE_CONTENT;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { logo: lpLogo, isLogoReady } = useLogo();
  const [, navigate] = useLocation();

  function handleCtaClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) return;
    e.preventDefault();
    navigate(href);
  }

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
        <ContactTopBar />
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6" style={{ height: 112 }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <img src={lpLogo} alt="SentConnect" fetchPriority="high" className="h-20 md:h-24" style={{ width: "auto", maxWidth: 300, display: "block", opacity: isLogoReady ? 1 : 0, transition: "opacity .25s ease" }} />
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
              style={{ fontSize: 14, fontWeight: 600, color: "#fff", background: "#E85D04", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, height: 36, minWidth: 96, padding: "0 18px", borderRadius: 999, boxShadow: "0 2px 8px rgba(0,0,0,0.16)", transition: "background .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#C74E03"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#E85D04"; }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.25)" }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 1 }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </span>
              Try Demo
            </a>
            <a
              href={lpContent.headerPrimaryCtaHref}
              onClick={e => handleCtaClick(e, lpContent.headerPrimaryCtaHref)}
              style={{ fontSize: 14, fontWeight: 600, color: "#0B67C2", background: "#FFFFFF", display: "inline-flex", alignItems: "center", justifyContent: "center", height: 36, minWidth: 96, padding: "0 20px", borderRadius: 999, textDecoration: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.16)", transition: "background .15s, transform .15s, box-shadow .15s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#F0F7FF"; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 4px 14px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#FFFFFF"; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.16)"; }}
            >{lpContent.headerPrimaryCtaLabel}</a>
          </nav>

          {/* Mobile: Try Demo + Sign up + hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <a
              href="https://demo.sentconnect.org/"
              style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "#E85D04", padding: "6px 12px", borderRadius: 999, textDecoration: "none", boxShadow: "0 1px 6px rgba(0,0,0,0.18)" }}
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
            <p style={{ fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 20 }}>Ready to connect your Church and field teams?</p>
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
              <img src={lpLogo} alt="SentConnect" loading="lazy" className="h-20 md:h-24" style={{ width: "auto", maxWidth: 300, display: "block", marginBottom: 14, opacity: isLogoReady ? 1 : 0, transition: "opacity .25s ease" }} />
              <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "#9CA3AF", maxWidth: 280, margin: 0 }}>
                Private updates for Churches and mission teams, all in one secure feed.
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
              <a
                href="mailto:holly@holteksolutions.com"
                style={{ fontSize: 13, color: "#9CA3AF", textDecoration: "none", transition: "color .15s", display: "inline-block", marginTop: 6 }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
              >
                holly@holteksolutions.com
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
