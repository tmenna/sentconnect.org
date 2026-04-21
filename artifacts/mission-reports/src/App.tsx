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

function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0268CE] font-black">S</div>
            <span className="text-lg font-extrabold tracking-tight">SentConnect</span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/signup" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#0268CE] hover:text-[#0268CE]">Sign up</a>
            <a href="#signin" className="rounded-full bg-[#0268CE] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0155a5]">How to sign in</a>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-24">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-[#0268CE]">Private missionary updates</p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
              Stay connected with your field teams from one private mission feed.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              SentConnect gives churches and mission organizations a dedicated space where missionaries can share updates, photos, prayer needs, and impact reports with the people who support them.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="/signup" className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0268CE] px-6 text-sm font-bold text-white shadow-sm hover:bg-[#0155a5]">
                Create your organization
              </a>
              <a href="#signin" className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 px-6 text-sm font-bold text-slate-700 hover:border-[#0268CE] hover:text-[#0268CE]">
                Learn how sign-in works
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">Mission Moments</p>
                  <p className="text-xs text-slate-500">Latest field updates</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0268CE]">Private</span>
              </div>
              {["Prayer gathering in Kigali", "New family visits this week", "Youth outreach photos shared"].map((title, index) => (
                <div key={title} className="mb-3 rounded-2xl border border-slate-100 bg-white p-4 last:mb-0">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-blue-100" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{title}</p>
                      <p className="text-xs text-slate-400">{index + 2} hours ago</p>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100" />
                  <div className="mt-2 h-2 w-3/4 rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="signin" className="border-t border-slate-100 bg-slate-50">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-14 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">1. Sign up</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Create your organization and choose a short subdomain, like <strong>rvc</strong>.</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">2. Use your portal</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Your team signs in at your dedicated address, such as <strong>rvc.sentconnect.org/login</strong>.</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">3. Share updates</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Invite field users, collect reports, and keep your church connected to ministry work.</p>
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
