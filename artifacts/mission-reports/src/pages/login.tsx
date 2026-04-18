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
  { icon: MapPin,   text: "See where work is happening" },
  { icon: Building, text: "Stay informed across teams and activities" },
];

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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-gray-400 text-sm animate-pulse">Loading…</div>
    </div>
  );

  if (isAuthenticated && user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-[0_10px_25px_rgba(0,0,0,0.08)] p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-gray-700 font-bold text-lg">{user.name.charAt(0).toUpperCase()}</span>
        </div>
        <h2 className="text-[17px] font-semibold text-gray-900 mb-1">You're signed in</h2>
        <p className="text-[13px] text-gray-500 mb-6">{user.name} · {user.email}</p>
        <button
          className="w-full h-11 rounded-xl text-[15px] font-semibold text-white mb-3 transition-colors duration-200"
          style={{ backgroundColor: "#10B981" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#059669")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#10B981")}
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
    <div className="min-h-screen flex" style={{ animation: "fadeIn 0.3s ease" }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Left: Brand Panel ── */}
      <div
        className="hidden lg:flex lg:w-[40%] flex-col text-white px-12 py-14 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)" }}
      >
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(0,0,0,0.15)" }} />
        {/* Subtle radial highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 20% 10%, rgba(255,255,255,0.10) 0%, transparent 60%)" }}
        />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10 mb-4">
          <div className="bg-white/20 p-2.5 rounded-xl border border-white/20">
            <Shuffle className="h-5 w-5 text-white" />
          </div>
          <span className="text-[17px] font-bold tracking-tight text-white">SentConnect</span>
        </div>

        <p className="relative z-10 text-[#E5E7EB] text-[11px] font-medium tracking-widest uppercase mb-10" style={{ opacity: 0.7 }}>
          www.sentconnect.org
        </p>

        {/* Headline */}
        <div className="relative z-10 flex-1">
          <h2 className="text-[36px] font-bold leading-tight mb-4 tracking-tight text-white">
            Stay connected with your field teams.
          </h2>
          <p className="text-[17px] leading-relaxed mb-10" style={{ color: "#E5E7EB", lineHeight: 1.65 }}>
            A simple platform for organizations to receive updates from teams working across different locations.
          </p>

          <div className="space-y-5">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4.5 w-4.5 text-white" style={{ opacity: 0.87 }} />
                </div>
                <span className="text-[15px]" style={{ color: "#E5E7EB", lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bible verse */}
        <div className="relative z-10 border-l-2 border-white/25 pl-4 mt-10">
          <p className="text-[13px] italic leading-relaxed" style={{ color: "#E5E7EB", opacity: 0.75 }}>
            "Declare his glory among the nations, his marvelous works among all the peoples!"
          </p>
          <p className="text-[12px] mt-2 font-medium" style={{ color: "#E5E7EB", opacity: 0.5 }}>— Psalm 96:3</p>
        </div>

        <p className="relative z-10 mt-6 text-[12px]" style={{ color: "#E5E7EB", opacity: 0.4 }}>© SentConnect</p>
      </div>

      {/* ── Right: Login Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-14">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="bg-[#111827] p-2 rounded-xl text-white">
            <Shuffle className="h-5 w-5" />
          </div>
          <span className="text-[17px] font-semibold text-gray-800">SentConnect</span>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h1 className="text-[26px] font-semibold text-gray-900 tracking-tight" style={{ lineHeight: 1.3 }}>Welcome back</h1>
            <p className="text-gray-500 mt-1.5 text-[15px]" style={{ lineHeight: 1.6 }}>Sign in to your account to continue.</p>
          </div>

          <div
            className="bg-white rounded-2xl border border-gray-100 p-7"
            style={{ boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}
          >
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
                      <FormLabel className="text-[14px] font-medium text-gray-700">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@mission.org"
                          autoComplete="email"
                          className="h-12 text-[15px] border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-gray-900/10 focus-visible:border-gray-400 transition-all"
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
                        <FormLabel className="text-[14px] font-medium text-gray-700">Password</FormLabel>
                        <Link
                          href="/forgot-password"
                          className="text-[13px] text-gray-500 hover:text-gray-700 transition-colors font-medium"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className="h-12 text-[15px] border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-gray-900/10 focus-visible:border-gray-400 transition-all"
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
                  className="w-full h-12 rounded-xl text-[15px] font-semibold text-white transition-colors duration-200 disabled:opacity-60 mt-1"
                  style={{ backgroundColor: login.isPending ? "#10B981" : "#10B981" }}
                  onMouseEnter={e => { if (!login.isPending) e.currentTarget.style.backgroundColor = "#059669"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#10B981"; }}
                  data-testid="btn-login-submit"
                >
                  {login.isPending ? "Signing in…" : "Sign In"}
                </button>
              </form>
            </Form>
          </div>

          <p className="text-center text-[14px] text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-gray-700 font-semibold hover:text-gray-900 hover:underline transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
