import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth-provider";
import { useAuth } from "@/components/auth-provider";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import { OrgProvider, useOrg } from "@/providers/org-provider";
import { extractOrgSlug } from "@/lib/org";

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

const queryClient = new QueryClient();

/**
 * Builds a login redirect URL that encodes where the user was trying to go.
 * After login they'll be sent directly there — no double-hop via /.
 */
function loginRedirect(from: string): string {
  const safe = from.startsWith("/") ? from : "/";
  return `/login?from=${encodeURIComponent(safe)}`;
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
  if (!isAuthenticated) return <Redirect href={loginRedirect(location)} />;
  if (user?.role !== "admin" && !isPlatformRole(user?.role)) return <Redirect href="/" />;
  return <Timeline />;
}

/**
 * Context-aware /admin route.
 *
 * Platform context  (no org slug in URL, e.g. sentconnect.org/admin):
 *   super_admin → SuperAdminPanel   (full platform view)
 *   admin       → AdminDashboard    (org-scoped via session.organizationId)
 *
 * Org context (org slug in URL, e.g. /allerweg/admin, or allerweg.sentconnect.org/admin):
 *   admin or super_admin → AdminDashboard for that org
 *
 * SWAP POINT: org slug will come from req.hostname instead of the URL path
 * once USE_HOSTNAME_ROUTING=true is set in production.
 */
function AdminRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { orgSlug } = useOrg();
  const [location] = useLocation();

  if (isLoading) return <AuthLoading />;
  if (!isAuthenticated) return <Redirect href={loginRedirect(location)} />;

  // Org context — org admin roles can manage this org
  if (orgSlug) {
    if (user?.role !== "admin" && user?.role !== "super_admin") return <Redirect href="/" />;
    return <AdminDashboard />;
  }

  // Platform context — route by role
  if (isPlatformRole(user?.role)) return <SuperAdminPanel />;
  if (user?.role === "admin") return <AdminDashboard />; // org scoped via session.organizationId
  return <Redirect href="/" />;
}

function PlatformAdminRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  if (isLoading) return <AuthLoading />;
  if (!isAuthenticated) return <Redirect href={loginRedirect(location)} />;
  if (!isPlatformRole(user?.role)) return <Redirect href="/platform/login" />;
  return <SuperAdminPanel />;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      {/* Platform super-admin routes — no org prefix */}
      <Route path="/platform/login" component={Login} />
      <Route path="/platform/admin" component={PlatformAdminRoute} />
      <Route path="/platform"><Redirect href="/platform/admin" /></Route>
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={HomeRoute} />
            <Route path="/feed" component={AdminFeedRoute} />
            <Route path="/reports/:id" component={ReportDetail} />
            <Route path="/missionaries/:id" component={MissionaryProfile} />
            <Route path="/submit" component={SubmitReport} />
            <Route path="/admin" component={AdminRoute} />
            <Route path="/super-admin"><Redirect href="/admin" /></Route>
            <Route path="/profile" component={Profile} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

/**
 * Sits inside WouterRouter so it can read the current location.
 * Extracts the org slug from the path and sets up the OrgProvider +
 * a nested router with the org prefix so all routes work under
 * /:orgSlug/... paths.
 *
 * SWAP POINT — when real subdomain routing is enabled:
 * 1. Remove the `extractOrgSlug` call and the nested router
 * 2. Keep OrgProvider but derive orgSlug from window.location.hostname
 * 3. The rest of the app (routes, API calls) needs zero changes
 */
function OrgAwareApp() {
  const [location] = useLocation();
  const orgSlug = extractOrgSlug(location);

  return (
    <OrgProvider orgSlug={orgSlug}>
      <AuthProvider>
        <TooltipProvider>
          {orgSlug ? (
            // Nested router strips the org prefix — all routes inside are identical
            // to the non-org-prefixed versions, making the swap trivial.
            <WouterRouter base={`/${orgSlug}`}>
              <AppRoutes />
            </WouterRouter>
          ) : (
            <AppRoutes />
          )}
        </TooltipProvider>
      </AuthProvider>
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
