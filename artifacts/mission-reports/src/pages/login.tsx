import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLoginUser, useLogoutUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useSearch, useLocation } from "wouter";
import { ExternalLink, LogOut, Loader2, Globe } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { buildOrgLoginHref } from "@/lib/org";
import logoWhite from "@/assets/logo-white.png";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const BLUE = "#8705FA";
const BLUE_DARK = "#6B04C8";

export default function Login({ platformMode }: { platformMode?: boolean } = {}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const search = useSearch();
  const [, navigate] = useLocation();
  const [orgPortalError, setOrgPortalError] = useState<{ subdomain: string | null } | null>(null);
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
        navigate(from);
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
    <div className="min-h-dvh flex items-center justify-center bg-white">
      <Loader2 className="h-6 w-6 animate-spin" style={{ color: BLUE }} />
    </div>
  );

  if (isAuthenticated && user) return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-10 bg-white">
      <div className="w-full max-w-sm bg-white rounded-2xl p-7 sm:p-8 text-center" style={{ border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(15,23,42,0.08)" }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "#F3E8FF", border: "1.5px solid #D8B4FE" }}>
          <span className="font-bold text-lg" style={{ color: BLUE }}>{user.name.charAt(0).toUpperCase()}</span>
        </div>
        <h2 className="text-[17px] font-semibold mb-1" style={{ color: "#0F172A" }}>You're signed in</h2>
        <p className="text-[13px] mb-6" style={{ color: "#64748B" }}>{user.name} · {user.email}</p>
        <button
          className="w-full h-12 rounded-xl text-[15px] font-semibold text-white mb-3 transition-all"
          style={{ backgroundColor: BLUE }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = BLUE_DARK)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = BLUE)}
          onClick={() => navigate(from)}
        >
          Continue to app
        </button>
        <Button
          variant="outline"
          className="w-full h-12 font-semibold text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200 rounded-xl"
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
    <div className="min-h-dvh flex bg-white">

      {/* ── Left brand panel — desktop only ── */}
      <div
        className="hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col justify-between p-10 xl:p-12"
        style={{ borderRight: "1px solid #E2E8F0" }}
      >
        {/* Wordmark */}
        <img src={logoWhite} alt="SentConnect" style={{ height: 28, filter: "brightness(0)", display: "block" }} />

        {/* Center message */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ background: "#F3E8FF" }}>
            <Globe className="h-4 w-4" style={{ color: BLUE }} />
            <span className="text-[15px] font-semibold tracking-widest uppercase" style={{ color: BLUE }}>Private Mission Platform</span>
          </div>
          <h2 style={{ fontSize: 52, fontWeight: 800, color: BLUE, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 22 }}>
            Stay connected<br />with your field teams.
          </h2>
          <p style={{ fontSize: 18, color: "#475569", lineHeight: 1.65 }}>
            Share updates, celebrate Mission Moments, and keep your church engaged with what God is doing across the world.
          </p>
        </div>

        {/* Bible verse */}
        <p style={{ fontSize: 12, color: "#94A3B8", fontStyle: "italic", lineHeight: 1.6 }}>
          "Declare his glory among the nations, his marvelous works among all the peoples." — Psalm 96:3
        </p>
      </div>

      {/* ── Right / full form panel ── */}
      <div className="flex-1 flex flex-col min-h-dvh">

        {/* Mobile brand header */}
        <div className="lg:hidden flex flex-col items-center px-6 pt-10 pb-8 text-center" style={{ borderBottom: "1px solid #F1F5F9" }}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-5" style={{ background: "#F3E8FF" }}>
            <Globe className="h-3.5 w-3.5" style={{ color: BLUE }} />
            <span className="text-[13px] font-semibold tracking-widest uppercase" style={{ color: BLUE }}>Private Mission Platform</span>
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: BLUE, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 12 }}>
            Stay connected<br />with your field teams.
          </h2>
          <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.6, maxWidth: 320 }}>
            Share updates, celebrate Mission Moments, and keep your church engaged with what God is doing across the world.
          </p>
        </div>

        {/* Form area */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-8 sm:py-10">
          <div className="w-full" style={{ maxWidth: 400 }}>

            {/* Heading */}
            <div className="mb-7">
              <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight mb-1.5" style={{ color: "#0F172A", letterSpacing: "-0.03em" }}>
                Welcome back
              </h1>
              <p className="text-sm sm:text-[14px]" style={{ color: "#64748B" }}>Sign in to your SentConnect account.</p>
            </div>

            {/* Org portal error */}
            {orgPortalError && (
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-[13px] font-semibold text-amber-800 mb-1">Wrong login portal</p>
                <p className="text-[13px] text-amber-700 leading-relaxed">
                  This account belongs to an organization. Please sign in through your organization's portal.
                </p>
                {orgPortalError.subdomain && (
                  <a
                    href={buildOrgLoginHref(orgPortalError.subdomain)}
                    className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Go to {orgPortalError.subdomain}.sentconnect.org/login
                  </a>
                )}
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-semibold" style={{ color: "#374151" }}>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@mission.org"
                          autoComplete="email"
                          inputMode="email"
                          className="h-12 text-base rounded-xl bg-white"
                          style={{ borderColor: "#E2E8F0", fontSize: 16 }}
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
                      <div className="flex items-center justify-between mb-1">
                        <FormLabel className="text-[13px] font-semibold" style={{ color: "#374151" }}>Password</FormLabel>
                        <Link
                          href="/forgot-password"
                          className="text-[12px] font-semibold transition-colors"
                          style={{ color: BLUE }}
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className="h-12 text-base rounded-xl bg-white"
                          style={{ borderColor: "#E2E8F0", fontSize: 16 }}
                          {...field}
                          data-testid="input-login-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <button
                  type="submit"
                  disabled={login.isPending}
                  className="w-full rounded-xl text-[15px] font-semibold text-white transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
                  style={{ height: 48, backgroundColor: BLUE, boxShadow: "0 4px 14px rgba(138,5,255,0.28)" }}
                  onMouseEnter={e => { if (!login.isPending) { e.currentTarget.style.backgroundColor = BLUE_DARK; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = BLUE; e.currentTarget.style.transform = ""; }}
                  data-testid="btn-login-submit"
                >
                  {login.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {login.isPending ? "Signing in…" : "Sign In"}
                </button>
              </form>
            </Form>

            <p className="mt-6 text-center text-[14px]" style={{ color: "#64748B" }}>
              Don't have an account?{" "}
              <Link href="/signup" className="font-semibold transition-colors" style={{ color: BLUE }}>
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Mobile verse footer */}
        <div className="lg:hidden text-center px-6 pb-8">
          <p className="text-[11px] italic" style={{ color: "#CBD5E1" }}>
            "Declare his glory among the nations." — Psalm 96:3
          </p>
        </div>

      </div>
    </div>
  );
}
