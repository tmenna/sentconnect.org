import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  previewLabel: string;
  previewTitle1: string;
  previewTitle2: string;
  previewTitle3: string;
  step1Title: string;
  step1Description: string;
  step2Title: string;
  step2Description: string;
  step3Title: string;
  step3Description: string;
};

const DEFAULT_LANDING_PAGE_CONTENT: LandingPageContent = {
  heroEyebrow: "Private missionary updates",
  heroTitle: "Stay connected with your field teams from one private mission feed.",
  heroDescription: "SentConnect gives churches and mission organizations a dedicated space where missionaries can share updates, photos, prayer needs, and impact reports with the people who support them.",
  primaryCtaLabel: "Create your organization",
  primaryCtaHref: "/signup",
  secondaryCtaLabel: "Learn how sign-in works",
  secondaryCtaHref: "#signin",
  previewLabel: "Latest field updates",
  previewTitle1: "Prayer gathering in Kigali",
  previewTitle2: "New family visits this week",
  previewTitle3: "Youth outreach photos shared",
  step1Title: "1. Sign up",
  step1Description: "Create your organization and choose a short subdomain, like rvc.",
  step2Title: "2. Use your portal",
  step2Description: "Your team signs in at your dedicated address, such as rvc.sentconnect.org/login.",
  step3Title: "3. Share updates",
  step3Description: "Invite field users, collect reports, and keep your church connected to ministry work.",
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
    return () => {
      cancelled = true;
    };
  }, []);

  const steps = [
    {
      title: content.step1Title,
      description: content.step1Description,
      accent: "from-[#0268CE] to-[#23A6F0]",
    },
    {
      title: content.step2Title,
      description: content.step2Description,
      accent: "from-[#6D5DFB] to-[#0268CE]",
    },
    {
      title: content.step3Title,
      description: content.step3Description,
      accent: "from-[#08A88A] to-[#0268CE]",
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(2,104,206,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(8,168,138,0.16),transparent_30%),linear-gradient(180deg,#F7FBFF_0%,#FFFFFF_42%,#F3F8FF_100%)] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0268CE] to-[#23A6F0] font-black text-white shadow-lg shadow-blue-200/70">S</div>
            <span className="text-lg font-extrabold tracking-tight text-slate-950">SentConnect</span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/signup" className="rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0268CE] hover:text-[#0268CE] hover:shadow-md">Sign up</a>
            <a href="#signin" className="rounded-full bg-gradient-to-r from-[#0268CE] to-[#23A6F0] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-200/80 transition hover:-translate-y-0.5 hover:shadow-xl">How to sign in</a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-24">
          <div className="absolute left-1/2 top-8 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-200/30 blur-3xl" />
          <div>
            <p className="mb-5 inline-flex rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm font-bold uppercase tracking-[0.22em] text-[#0268CE] shadow-sm">{content.heroEyebrow}</p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
              {content.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              {content.heroDescription}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={content.primaryCtaHref} className="inline-flex h-13 items-center justify-center rounded-2xl bg-gradient-to-r from-[#0268CE] to-[#23A6F0] px-7 text-sm font-bold text-white shadow-xl shadow-blue-200/80 transition hover:-translate-y-0.5 hover:shadow-2xl">
                {content.primaryCtaLabel}
              </a>
              <a href={content.secondaryCtaHref} className="inline-flex h-13 items-center justify-center rounded-2xl border border-blue-100 bg-white/90 px-7 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0268CE] hover:text-[#0268CE] hover:shadow-md">
                {content.secondaryCtaLabel}
              </a>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-white bg-white/65 p-4 shadow-[0_30px_90px_rgba(2,104,206,0.16)] backdrop-blur">
            <div className="rounded-[2rem] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">Mission Moments</p>
                  <p className="text-xs text-slate-500">{content.previewLabel}</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0268CE] ring-1 ring-blue-100">Private</span>
              </div>
              {[content.previewTitle1, content.previewTitle2, content.previewTitle3].map((title, index) => (
                <div key={title} className="mb-3 rounded-3xl border border-blue-50 bg-gradient-to-br from-white to-blue-50/40 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md last:mb-0">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#0268CE] to-[#23A6F0] shadow-md shadow-blue-100" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{title}</p>
                      <p className="text-xs text-slate-400">{index + 2} hours ago</p>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-blue-100/70" />
                  <div className="mt-2 h-2 w-3/4 rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="signin" className="relative scroll-mt-24 border-y border-blue-100/70 bg-gradient-to-br from-[#EAF5FF] via-white to-[#EDFDF8]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0268CE]/30 to-transparent" />
          <div className="mx-auto max-w-6xl px-6 py-18 md:py-24">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <p className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-extrabold uppercase tracking-[0.22em] text-[#0268CE] shadow-sm ring-1 ring-blue-100">
                Learn how sign-in works
              </p>
              <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                A simple path from signup to your private portal
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Each organization gets its own secure SentConnect space, so members know exactly where to sign in and see the updates meant for them.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="group relative overflow-hidden rounded-[2rem] border border-white bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.09)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(2,104,206,0.18)]">
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.accent} text-lg font-black text-white shadow-lg shadow-blue-200/70`}>
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-black text-slate-950">{step.title.replace(/^\d+\.\s*/, "")}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{step.description}</p>
                  <div className={`absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br ${step.accent} opacity-10 transition group-hover:scale-125 group-hover:opacity-15`} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
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
