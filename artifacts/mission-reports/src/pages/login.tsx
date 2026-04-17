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
      <div className="animate-pulse text-muted-foreground text-sm">Loading…</div>
    </div>
  );

  if (isAuthenticated && user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-blue-600 font-extrabold text-lg">{user.name.charAt(0).toUpperCase()}</span>
        </div>
        <h2 className="text-[17px] font-bold text-foreground mb-1">You're signed in</h2>
        <p className="text-[13px] text-muted-foreground mb-6">{user.name} · {user.email}</p>
        <Button
          className="w-full h-10 font-semibold mb-3"
          style={{ backgroundColor: "#00C4A7" }}
          onClick={() => navigate(from)}
        >
          Continue to app
        </Button>
        <Button
          variant="outline"
          className="w-full h-10 font-semibold text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200"
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
      {/* Left: Brand Panel — lighter blue, narrower */}
      <div
        className="hidden lg:flex lg:w-[38%] flex-col text-white px-10 py-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #2563eb 0%, #3b82f6 60%, #60a5fa 100%)" }}
      >
        {/* Subtle radial highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 25% 15%, rgba(255,255,255,0.12) 0%, transparent 55%)",
          }}
        />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10 mb-5">
          <div className="bg-white/15 p-2 rounded-xl border border-white/15">
            <Shuffle className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white">SentConnect</span>
        </div>

        <p className="relative z-10 text-white/50 text-[10px] font-medium tracking-widest uppercase mb-8">
          www.sentconnect.org
        </p>

        {/* Headline */}
        <div className="relative z-10 max-w-[260px]">
          <h2 className="text-[1.75rem] font-extrabold leading-snug mb-3 tracking-tight text-white">
            Stay connected with your{" "}
            <span className="text-white font-black">field teams.</span>
          </h2>
          <p className="text-white/65 text-[13px] leading-relaxed mb-7">
            A simple platform for organizations to receive updates from teams working across different locations.
          </p>

          <div className="space-y-3.5">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-3.5 w-3.5 text-white/80" />
                </div>
                <span className="text-white/70 text-[13px]">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bible verse */}
        <div className="relative z-10 mt-auto border-l-2 border-white/20 pl-4">
          <p className="text-white/50 text-[12px] italic leading-relaxed">
            "Declare his glory among the nations, his marvelous works among all the peoples!"
          </p>
          <p className="text-white/35 text-[11px] mt-1.5 font-medium">— Psalm 96:3</p>
        </div>

        <p className="relative z-10 mt-5 text-white/30 text-[11px]">© SentConnect</p>
      </div>

      {/* Right: Login Form — clean white */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12">

        {/* Mobile logo (shown only when left panel is hidden) */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="bg-blue-500 p-2 rounded-xl text-white">
            <Shuffle className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold text-gray-800">SentConnect</span>
        </div>

        <div className="w-full max-w-[360px]">
          <div className="mb-7">
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Welcome back</h1>
            <p className="text-gray-500 mt-1 text-[14px]">Sign in to your account to continue.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6">
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
                      <FormLabel className="text-[13px] font-medium text-gray-700">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@mission.org"
                          autoComplete="email"
                          className="h-10 text-sm border-gray-200 focus:border-blue-400 rounded-lg"
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
                        <FormLabel className="text-[13px] font-medium text-gray-700">Password</FormLabel>
                        <Link href="/forgot-password" className="text-[12px] text-blue-500 hover:text-blue-600 transition-colors">
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className="h-10 text-sm border-gray-200 focus:border-blue-400 rounded-lg"
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
                  className="w-full h-10 text-sm font-semibold mt-1 rounded-lg"
                  style={{ backgroundColor: "#00C4A7", color: "#fff" }}
                  disabled={login.isPending}
                  data-testid="btn-login-submit"
                >
                  {login.isPending ? "Signing in…" : "Sign In"}
                </Button>
              </form>
            </Form>
          </div>

          <p className="text-center text-[13px] text-gray-500 mt-5">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-500 font-semibold hover:text-blue-600 hover:underline transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
