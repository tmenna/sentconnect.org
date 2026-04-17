import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLoginUser, useLogoutUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useSearch, useLocation } from "wouter";
import { Shuffle, MapPin, BookOpen, Building, ExternalLink, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const FEATURES = [
  { icon: BookOpen, text: "Share updates from the field" },
  { icon: MapPin, text: "See where work is happening" },
  { icon: Building, text: "Stay informed across teams and activities" },
];

export default function Login({ platformMode }: { platformMode?: boolean } = {}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const search = useSearch();
  const [, navigate] = useLocation();
  const [orgPortalError, setOrgPortalError] = useState<{ subdomain: string | null } | null>(null);

  // Where to send the user after they authenticate.
  const from = (() => {
    if (platformMode) return "/admin";
    const raw = new URLSearchParams(search).get("from") ?? null;
    if (raw && raw.startsWith("/")) return raw;
    return "/";
  })();

  const login = useLoginUser({
    mutation: {
      onSuccess: () => {
        setOrgPortalError(null);
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        toast({ title: "Welcome back!" });
      },
      onError: (error: any) => {
        if (error?.status === 403 && error?.data?.error?.includes("organization")) {
          setOrgPortalError({ subdomain: error?.data?.subdomain ?? null });
        } else {
          setOrgPortalError(null);
          toast({ title: "Sign in failed", description: "Check your email and password.", variant: "destructive" });
        }
      }
    }
  });

  const logout = useLogoutUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        toast({ title: "Signed out" });
      }
    }
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
      <div className="animate-pulse text-muted-foreground text-sm">Loading…</div>
    </div>
  );

  // Already signed in — show a friendly screen instead of an invisible redirect
  if (isAuthenticated && user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-border shadow-sm p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-[#172A7D]/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-[#172A7D] font-extrabold text-lg">{user.name.charAt(0).toUpperCase()}</span>
        </div>
        <h2 className="text-[17px] font-bold text-foreground mb-1">You're signed in</h2>
        <p className="text-[13px] text-muted-foreground mb-6">{user.name} · {user.email}</p>
        <Button
          className="w-full h-10 font-semibold mb-3"
          style={{ backgroundColor: "#172A7D" }}
          onClick={() => navigate(from)}
        >
          Continue to app
        </Button>
        <Button
          variant="outline"
          className="w-full h-10 font-semibold text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          onClick={() => logout.mutate({ data: undefined })}
          disabled={logout.isPending}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {logout.isPending ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </div>
  );

  function onSubmit(data: LoginFormValues) {
    login.mutate({ data });
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Brand Panel */}
      <div
        className="hidden lg:flex lg:w-[44%] flex-col text-white p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(155deg, #0d1b5e 0%, #172A7D 45%, #1a3a9a 100%)" }}
      >
        {/* Radial glow — matches signup page */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.06) 0%, transparent 60%)",
          }}
        />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10 mb-6">
          <div className="bg-white/10 p-2 rounded-xl border border-white/10">
            <Shuffle className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white">SentConnect</span>
        </div>

        {/* Domain — matches signup */}
        <p className="relative z-10 text-white/40 text-[11px] font-medium tracking-widest uppercase mb-8">
          www.sentconnect.org
        </p>

        {/* Headline + description */}
        <div className="relative z-10 max-w-xs">
          <h2 className="text-[2rem] font-extrabold leading-snug mb-3 tracking-tight text-white">
            Stay connected with your{" "}
            <span style={{ color: "#00C4A7" }}>field teams.</span>
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-8">
            A simple platform for organizations to receive updates from teams working across different locations.
          </p>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-3.5 w-3.5 text-blue-300" />
                </div>
                <span className="text-white/60 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bible verse */}
        <div className="relative z-10 mt-auto border-l-2 border-white/15 pl-4">
          <p className="text-white/40 text-sm italic leading-relaxed">
            "Declare his glory among the nations, his marvelous works among all the peoples!"
          </p>
          <p className="text-white/25 text-xs mt-1.5 font-medium">— Psalm 96:3</p>
        </div>

        {/* Footer — matches signup */}
        <p className="relative z-10 mt-6 text-white/30 text-xs">© SentConnect</p>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F5F7FA] px-6 py-12">
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="bg-primary p-2 rounded-xl text-white">
            <Shuffle className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">SentConnect</span>
        </div>

        <div className="w-full max-w-[380px]">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to your account to continue.</p>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-sm p-7">
            {orgPortalError && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-[13px] font-semibold text-amber-800 mb-1">Wrong login portal</p>
                <p className="text-[12px] text-amber-700 leading-relaxed">
                  This account belongs to an organization. Please sign in through your organization's portal.
                </p>
                {orgPortalError.subdomain && (
                  <a
                    href={`/${orgPortalError.subdomain}/login`}
                    className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Go to /{orgPortalError.subdomain}/login
                  </a>
                )}
              </div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@mission.org"
                          autoComplete="email"
                          className="h-10 text-sm"
                          {...field}
                          data-testid="input-login-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className="h-10 text-sm"
                          {...field}
                          data-testid="input-login-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-10 text-sm font-semibold mt-1"
                  disabled={login.isPending}
                  data-testid="btn-login-submit"
                >
                  {login.isPending ? "Signing in…" : "Sign In"}
                </Button>
              </form>
            </Form>
            <p className="text-center mt-4">
              <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Forgot password?
              </Link>
            </p>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">Sign Up</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
