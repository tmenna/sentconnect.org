import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth-provider";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Timeline from "./pages/timeline";
import ReportDetail from "./pages/report-detail";
import Profile from "./pages/profile";
import MissionaryProfile from "./pages/missionary-profile";
import SubmitReport from "./pages/submit-report";
import Login from "./pages/login";
import AdminDashboard from "./pages/admin";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Timeline} />
        <Route path="/reports/:id" component={ReportDetail} />
        <Route path="/missionaries/:id" component={MissionaryProfile} />
        <Route path="/submit" component={SubmitReport} />
        <Route path="/login" component={Login} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
