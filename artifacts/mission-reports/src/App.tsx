import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth-provider";
import { useAuth } from "@/components/auth-provider";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import { OrgProvider } from "@/providers/org-provider";
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

function HomeRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/login" />;
  if (user?.role === "admin") return <Redirect href="/admin" />;
  if (user?.role === "super_admin") return <Redirect href="/super-admin" />;
  return <MissionaryDashboard />;
}

function AdminFeedRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/login" />;
  if (user?.role !== "admin" && user?.role !== "super_admin") return <Redirect href="/" />;
  return <Timeline />;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={HomeRoute} />
            <Route path="/feed" component={AdminFeedRoute} />
            <Route path="/reports/:id" component={ReportDetail} />
            <Route path="/missionaries/:id" component={MissionaryProfile} />
            <Route path="/submit" component={SubmitReport} />
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/super-admin" component={SuperAdminPanel} />
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
