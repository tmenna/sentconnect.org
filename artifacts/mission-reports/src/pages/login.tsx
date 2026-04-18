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
import { Shuffle, ExternalLink, LogOut, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const BG = "linear-gradient(150deg, #004EA8 0%, #0066CC 55%, #1A80E0 100%)";
const BTN_BASE = "#005BBC";
const BTN_HOVER = "#004699";

export default function Login({ platformMode }: { platformMode?: boolean } = {}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const search = useSearch();
  const [, navigate] = useLocation();
  const [orgPortalError, setOrgPortalError] = useState<{ subdomain: string | null } | null>(null);
  const [hoverBtn, setHoverBtn] = useState(false);

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

  /* ── Loading ── */
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
      <Loader2 className="h-6 w-6 text-white animate-spin" />
    </div>
  );

  /* ── Already signed in ── */
  if (isAuthenticated && user) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: BG }}>
      <div className="w-full max-w-sm bg-white rounded-2xl p-8 text-center" style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#EFF6FF", border: "2px solid #93C5FD" }}>
          <span className="font-bold text-lg" style={{ color: BTN_BASE }}>{user.name.charAt(0).toUpperCase()}</span>
        </div>
        <h2 className="text-[17px] font-semibold text-gray-800 mb-1">You're signed in</h2>
        <p className="text-[13px] text-gray-500 mb-6">{user.name} · {user.email}</p>
        <button
          className="w-full h-11 rounded-xl text-[15px] font-semibold text-white mb-3 transition-colors"
          style={{ backgroundColor: BTN_BASE }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = BTN_HOVER)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = BTN_BASE)}
          onClick={() => navigate(from)}
        >
          Continue to app
        </button>
        <Button
          variant="outline"
          className="w-full h-11 font-semibold text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200 rounded-xl"
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
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-14"
      style={{ background: BG, animation: "fadeIn 0.35s ease" }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Logo above card ── */}
      <div className="flex flex-col items-center mb-7 select-none">
        <div className="flex items-center gap-2.5 mb-2">
          <div
            className="p-2 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}
          >
            <Shuffle className="h-5 w-5 text-white" />
          </div>
          <span className="text-[20px] font-bold text-white tracking-tight">SentConnect</span>
        </div>
        <p className="text-white/70 text-[14px] tracking-wide">Stay connected with your field teams.</p>
      </div>

      {/* ── White card ── */}
      <div
        className="w-full bg-white rounded-2xl"
        style={{ maxWidth: 420, padding: "36px 36px 32px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
      >
        {/* Card heading */}
        <div className="text-center mb-7">
          <h1 className="text-[22px] font-semibold text-gray-800 tracking-tight">Sign in to your account</h1>
          <p className="text-[14px] text-gray-400 mt-1">Enter your credentials below to continue.</p>
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
                href={`/${orgPortalError.subdomain}/login`}
                className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-2"
              >
                <ExternalLink className="h-3 w-3" />
                Go to /{orgPortalError.subdomain}/login
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
                  <FormLabel className="text-[13px] font-medium text-gray-600">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="you@mission.org"
                      autoComplete="email"
                      className="h-11 text-[14px] border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400 transition-all"
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
                    <FormLabel className="text-[13px] font-medium text-gray-600">Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-[12px] font-medium transition-colors"
                      style={{ color: BTN_BASE }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="h-11 text-[14px] border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400 transition-all"
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
              className="w-full h-11 rounded-xl text-[15px] font-semibold text-white transition-colors duration-200 disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
              style={{ backgroundColor: hoverBtn && !login.isPending ? BTN_HOVER : BTN_BASE }}
              onMouseEnter={() => setHoverBtn(true)}
              onMouseLeave={() => setHoverBtn(false)}
              data-testid="btn-login-submit"
            >
              {login.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {login.isPending ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </Form>
      </div>

      {/* ── Below card ── */}
      <p className="mt-5 text-[14px] text-white/65">
        Don't have an account?{" "}
        <Link href="/signup" className="text-white font-semibold hover:underline underline-offset-2">
          Sign Up
        </Link>
      </p>

      <p className="mt-10 text-[11px] italic text-white/35 text-center">
        "Declare his glory among the nations, his marvelous works among all the peoples." — Psalm 96:3
      </p>
    </div>
  );
}
