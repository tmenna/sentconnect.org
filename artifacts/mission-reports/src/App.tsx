import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Shuffle } from "lucide-react";
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

const queryClient = new QueryClient();

type LandingPageContent = {
  logoUrl: string;
  headerBrandName: string;
  headerPrimaryCtaLabel: string;
  headerPrimaryCtaHref: string;
  headerSecondaryCtaLabel: string;
  headerSecondaryCtaHref: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
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
  headerBrandName: "SentConnect",
  headerPrimaryCtaLabel: "Sign up",
  headerPrimaryCtaHref: "/signup",
  headerSecondaryCtaLabel: "How to sign in",
  headerSecondaryCtaHref: "#signin",
  heroEyebrow: "Private missionary updates",
  heroTitle: "Stay connected with your field teams from one private mission feed.",
  heroDescription: "SentConnect gives churches and mission organizations a dedicated space where missionaries can share updates, photos, prayer needs, and impact reports with the people who support them.",
  primaryCtaLabel: "Create your organization",
  primaryCtaHref: "/signup",
  secondaryCtaLabel: "Learn how sign-in works",
  secondaryCtaHref: "#signin",
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
  ctaBandHeading: "Ready to connect your team?",
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

  const BLUE = "#0268CE";
  const BLUE_DARK = "#0155A5";

  return (
    <div className="min-h-screen text-slate-900" style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#ffffff" }}>
      <style>{`
        @keyframes lp-fade-up {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-animate { animation: lp-fade-up 0.55s cubic-bezier(.22,1,.36,1) both; }
        .lp-delay-1 { animation-delay: 0.08s; }
        .lp-delay-2 { animation-delay: 0.16s; }
        .lp-delay-3 { animation-delay: 0.24s; }
        .lp-delay-4 { animation-delay: 0.32s; }
        .lp-delay-5 { animation-delay: 0.40s; }

        /* ── Responsive layout ── */
        .lp-hero-section { padding: 96px 0 80px; }
        .lp-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: center;
          position: relative;
        }
        .lp-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          position: relative;
        }
        .lp-connector { display: block; }
        .lp-nav-secondary { display: inline-flex; }
        .lp-cta-btns { display: flex; gap: 12px; flex-wrap: wrap; }
        .lp-footer-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        @media (max-width: 900px) {
          .lp-steps-grid {
            grid-template-columns: 1fr;
          }
          .lp-connector { display: none; }
        }

        @media (max-width: 767px) {
          .lp-hero-section { padding: 56px 0 40px; }
          .lp-hero-grid {
            grid-template-columns: 1fr;
            gap: 36px;
          }
          .lp-nav-secondary { display: none; }
          .lp-cta-btns { flex-direction: column; }
          .lp-cta-btns a { width: 100%; justify-content: center; box-sizing: border-box; }
          .lp-footer-inner { flex-direction: column; align-items: flex-start; }
          .lp-howitworks-section { padding: 56px 0 !important; }
          .lp-cta-band { padding: 52px 20px !important; }
        }

        @media (max-width: 480px) {
          .lp-hero-section { padding: 44px 0 32px; }
          .lp-howitworks-section { padding: 44px 0 !important; }
          .lp-cta-band { padding: 44px 20px !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(2,104,206,0.08)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6" style={{ height: 64 }}>
          <a href="/" className="flex items-center gap-3" style={{ textDecoration: "none" }}>
            {content.logoUrl ? (
              <img src={content.logoUrl} alt={content.headerBrandName} style={{ height: 36, width: "auto", objectFit: "contain" }} />
            ) : (
              <>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: `linear-gradient(135deg, ${BLUE} 0%, #0A8AEB 100%)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 3px 10px rgba(2,104,206,0.32)` }}>
                  <Shuffle style={{ width: 18, height: 18, color: "#fff" }} />
                </div>
                <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.04em", background: `linear-gradient(135deg, ${BLUE} 0%, #0A8AEB 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{content.headerBrandName}</span>
              </>
            )}
          </a>
          <nav className="flex items-center gap-2">
            <a
              href={content.headerPrimaryCtaHref}
              style={{ fontSize: 14, fontWeight: 600, color: "#374151", padding: "9px 18px", borderRadius: 999, border: "1px solid #E5E7EB", textDecoration: "none", transition: "border-color .15s, color .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = BLUE; (e.currentTarget as HTMLElement).style.color = BLUE; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLElement).style.color = "#374151"; }}
            >{content.headerPrimaryCtaLabel}</a>
            <a
              href={content.headerSecondaryCtaHref}
              className="lp-nav-secondary"
              style={{ fontSize: 14, fontWeight: 600, color: "#fff", padding: "9px 18px", borderRadius: 999, background: BLUE, textDecoration: "none", transition: "background .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = BLUE_DARK; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = BLUE; }}
            >{content.headerSecondaryCtaLabel}</a>
          </nav>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="lp-hero-section" style={{ background: "#ffffff", position: "relative", overflow: "hidden" }}>
          {/* decorative orbs */}
          <div style={{ position: "absolute", top: -120, right: -80, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(2,104,206,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, left: -100, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(10,138,235,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div className="lp-hero-grid mx-auto max-w-6xl px-6">
            <div>
              <div className="lp-animate lp-delay-1" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 24, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 999, padding: "5px 14px" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: BLUE }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: BLUE, letterSpacing: "0.12em", textTransform: "uppercase" }}>{content.heroEyebrow}</span>
              </div>

              <h1 className="lp-animate lp-delay-2" style={{ fontSize: "clamp(40px, 5.5vw, 68px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.035em", color: "#0A0F1E", margin: "0 0 24px" }}>
                {content.heroTitle}
              </h1>

              <p className="lp-animate lp-delay-3" style={{ fontSize: 18, lineHeight: 1.75, color: "#4B5563", maxWidth: 480, margin: "0 0 40px" }}>
                {content.heroDescription}
              </p>

              <div className="lp-animate lp-delay-4 lp-cta-btns">
                <a
                  href={content.primaryCtaHref}
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: 50, padding: "0 28px", borderRadius: 14, background: BLUE, color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 18px rgba(2,104,206,0.28)", transition: "background .15s, transform .15s, box-shadow .15s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = BLUE_DARK; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 8px 24px rgba(2,104,206,0.36)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = BLUE; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 4px 18px rgba(2,104,206,0.28)"; }}
                >{content.primaryCtaLabel}</a>
                <a
                  href={content.secondaryCtaHref}
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: 50, padding: "0 28px", borderRadius: 14, background: "#fff", color: "#374151", fontSize: 15, fontWeight: 700, textDecoration: "none", border: "1.5px solid #E5E7EB", transition: "border-color .15s, color .15s, transform .15s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = BLUE; el.style.color = BLUE; el.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#E5E7EB"; el.style.color = "#374151"; el.style.transform = "translateY(0)"; }}
                >{content.secondaryCtaLabel}</a>
              </div>
            </div>

            {/* App preview card */}
            <div className="lp-animate lp-delay-5" style={{ background: "#fff", borderRadius: 28, border: "1px solid rgba(2,104,206,0.1)", boxShadow: "0 32px 80px rgba(2,104,206,0.12), 0 4px 16px rgba(0,0,0,0.05)", padding: 24, position: "relative" }}>
              {/* card header bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(2,104,206,0.07)" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${BLUE} 0%, #0A8AEB 100%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Shuffle style={{ width: 16, height: 16, color: "#fff" }} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "#0A0F1E", margin: 0, letterSpacing: "-0.01em" }}>{content.previewCardTitle}</p>
                  <p style={{ fontSize: 11, color: "#9CA3AF", margin: "2px 0 0" }}>{content.previewLabel}</p>
                </div>
              </div>

              {/* mock posts */}
              {[
                { title: content.previewTitle1, ago: "2h ago", w: "82%", avatarOpacity: 0.18 },
                { title: content.previewTitle2, ago: "3h ago", w: "68%", avatarOpacity: 0.13 },
                { title: content.previewTitle3, ago: "5h ago", w: "55%", avatarOpacity: 0.09 },
              ].map(({ title, ago, w, avatarOpacity }, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: i < 2 ? "1px solid rgba(2,104,206,0.06)" : "none" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: `rgba(2,104,206,${avatarOpacity})`, flexShrink: 0, marginTop: 1 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</p>
                    <p style={{ fontSize: 11, color: "#9CA3AF", margin: "0 0 8px" }}>{ago}</p>
                    <div style={{ height: 6, background: "rgba(2,104,206,0.08)", borderRadius: 999, width: "100%" }} />
                    <div style={{ height: 6, background: "rgba(2,104,206,0.06)", borderRadius: 999, width: w, marginTop: 5 }} />
                  </div>
                </div>
              ))}

              {/* decorative dot */}
              <div style={{ position: "absolute", top: -14, right: 28, width: 28, height: 28, borderRadius: "50%", background: BLUE, boxShadow: "0 4px 12px rgba(2,104,206,0.4)" }} />
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="signin" className="lp-howitworks-section" style={{ background: "#fff", padding: "88px 0" }}>
          <div className="mx-auto max-w-6xl px-6">
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: BLUE, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>{content.howItWorksLabel}</p>
              <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 900, letterSpacing: "-0.03em", color: "#0A0F1E", margin: 0 }}>{content.howItWorksHeading}</h2>
            </div>

            <div className="lp-steps-grid">
              {/* connector line */}
              <div className="lp-connector" style={{ position: "absolute", top: 34, left: "calc(16.66% + 14px)", right: "calc(16.66% + 14px)", height: 1, background: `linear-gradient(90deg, transparent, rgba(2,104,206,0.2), transparent)`, pointerEvents: "none" }} />

              {[
                { title: content.step1Title, desc: content.step1Description, n: "01" },
                { title: content.step2Title, desc: content.step2Description, n: "02" },
                { title: content.step3Title, desc: content.step3Description, n: "03" },
              ].map(({ title, desc, n }) => (
                <div key={n} style={{ background: "#fff", border: "1px solid #EAECF0", borderRadius: 20, padding: "28px 24px 28px", position: "relative", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  {/* step number circle */}
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${BLUE} 0%, #0A8AEB 100%)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: "0 4px 12px rgba(2,104,206,0.25)" }}>
                    <span style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{n}</span>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0A0F1E", margin: "0 0 10px", letterSpacing: "-0.02em" }}>{title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: "#6B7280", margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA band ── */}
        <section className="lp-cta-band" style={{ background: `linear-gradient(130deg, ${BLUE} 0%, #0A8AEB 100%)`, padding: "72px 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 580, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", margin: "0 0 16px" }}>
              {content.ctaBandHeading}
            </h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.78)", margin: "0 0 36px", lineHeight: 1.65 }}>
              {content.ctaBandSubtext}
            </p>
            <a
              href={content.primaryCtaHref}
              style={{ display: "inline-flex", alignItems: "center", height: 52, padding: "0 32px", borderRadius: 14, background: "#fff", color: BLUE, fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", transition: "transform .15s, box-shadow .15s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 28px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)"; }}
            >{content.primaryCtaLabel}</a>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: "#fff", borderTop: "1px solid rgba(2,104,206,0.08)", padding: "32px 24px" }}>
        <div className="lp-footer-inner mx-auto max-w-6xl">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {content.logoUrl ? (
              <img src={content.logoUrl} alt={content.footerBrandName} style={{ height: 28, width: "auto", objectFit: "contain" }} />
            ) : (
              <>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${BLUE} 0%, #0A8AEB 100%)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(2,104,206,0.28)" }}>
                  <Shuffle style={{ width: 13, height: 13, color: "#fff" }} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: "-0.03em", background: `linear-gradient(135deg, ${BLUE} 0%, #0A8AEB 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{content.footerBrandName}</span>
              </>
            )}
          </div>
          <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>{content.footerOwnerText}</p>
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
        <a href="/" className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#0268CE] text-sm font-bold text-white hover:bg-[#0155a5]">
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "linear-gradient(150deg, #004EA8 0%, #0066CC 55%, #1A80E0 100%)" }}>
      <div className="w-full max-w-[440px] bg-white rounded-2xl px-8 py-10 text-center" style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-50 border-2 border-red-100">
          <span className="text-red-600 text-2xl font-bold">!</span>
        </div>
        <h1 className="text-[22px] font-bold text-gray-900 mb-2">Organization not found</h1>
        <p className="text-[14px] text-gray-500 mb-6">
          No SentConnect organization is registered for <span className="font-semibold text-gray-700">{orgSlug}</span>.
          {reason ? ` ${reason}` : ""}
        </p>
        <a href="/" className="inline-flex w-full h-11 items-center justify-center rounded-xl text-[15px] font-bold text-white bg-[#0268CE] hover:bg-[#0155a5] transition-colors">
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
