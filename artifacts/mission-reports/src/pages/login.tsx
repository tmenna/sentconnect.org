import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLoginUser, useLogoutUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useSearch, useLocation } from "wouter";
import { LogOut, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { buildOrgLoginHref } from "@/lib/org";
import { useLogo } from "@/providers/logo-provider";
import { useOrg } from "@/providers/org-provider";
import { ExternalLink } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const PURPLE = "#8705FA";
const DARK   = "#0f0f13";

export default function Login({ platformMode }: { platformMode?: boolean } = {}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { logo, isCustomLogo, isLogoReady } = useLogo();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const search = useSearch();
  const [, navigate] = useLocation();
  const [orgPortalError, setOrgPortalError] = useState<{ subdomain: string | null } | null>(null);
  const { orgSlug } = useOrg();
  const [orgName, setOrgName] = useState<string | null>(null);

  useEffect(() => {
    if (!orgSlug) { setOrgName(null); return; }
    fetch(`/api/orgs/resolve?subdomain=${encodeURIComponent(orgSlug)}`)
      .then(r => r.ok ? r.json() : null)
      .then((d: any) => { if (d?.name) setOrgName(d.name); })
      .catch(() => {});
  }, [orgSlug]);

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
      <Loader2 className="h-5 w-5 animate-spin" style={{ color: PURPLE }} />
    </div>
  );

  if (isAuthenticated && user) return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 bg-white">
      <div className="w-full max-w-[400px] text-center">
        <div className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#F4EEFF", border: `1.5px solid #D8B4FE` }}>
          <span className="font-bold text-[15px]" style={{ color: PURPLE }}>{user.name.charAt(0).toUpperCase()}</span>
        </div>
        <h2 className="text-[17px] font-semibold mb-1" style={{ color: DARK }}>You're signed in</h2>
        <p className="text-[13px] mb-6" style={{ color: "#64748B" }}>{user.name} · {user.email}</p>
        <button
          className="w-full h-11 rounded-lg text-[14px] font-semibold text-white mb-3 transition-all"
          style={{ backgroundColor: DARK }}
          onClick={() => navigate(from)}
        >
          Continue to app
        </button>
        <Button
          variant="outline"
          className="w-full h-11 font-medium text-[14px] rounded-lg"
          onClick={() => logout.mutate({ data: undefined })}
          disabled={logout.isPending}
        >
          <LogOut className="h-3.5 w-3.5 mr-2" />
          {logout.isPending ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </div>
  );

  function onSubmit(data: LoginFormValues) {
    login.mutate({ data });
  }

  return (
    <div className="min-h-dvh flex flex-col bg-white">

      {/* ── Top bar — logo only, Render style ── */}
      <header className="flex items-center px-8 py-5">
        {isCustomLogo ? (
          <img
            src={logo}
            alt="SentConnect"
            style={{
              maxHeight: 28,
              width: "auto",
              maxWidth: 180,
              display: "block",
              opacity: isLogoReady ? 1 : 0,
              transition: "opacity 0.25s ease",
            }}
          />
        ) : (
          <span style={{
            fontWeight: 900,
            fontSize: 17,
            letterSpacing: "0.07em",
            color: "#8705FA",
            textTransform: "uppercase",
          }}>
            SentConnect
          </span>
        )}
      </header>

      {/* ── Centered form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10">
        <div className="w-full" style={{ maxWidth: 420 }}>

          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: DARK, letterSpacing: "-0.02em", marginBottom: 6 }}>
              Sign in to SentConnect
            </h1>
            {orgName && (
              <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full" style={{ background: "#F4EEFF", border: "1px solid #D8B4FE" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: PURPLE, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: PURPLE, letterSpacing: "0.06em", textTransform: "uppercase" }}>{orgName}</span>
              </div>
            )}
          </div>

          {/* Org portal error */}
          {orgPortalError && (
            <div className="mb-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p style={{ fontSize: 13, fontWeight: 600, color: DARK, marginBottom: 4 }}>Wrong login portal</p>
              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.55 }}>
                This account belongs to an organization. Please sign in through your organization's portal.
              </p>
              {orgPortalError.subdomain && (
                <a
                  href={buildOrgLoginHref(orgPortalError.subdomain)}
                  className="mt-2 inline-flex items-center gap-1.5 underline underline-offset-2"
                  style={{ fontSize: 13, fontWeight: 600, color: PURPLE }}
                >
                  <ExternalLink className="h-3 w-3" />
                  Go to {orgPortalError.subdomain}.sentconnect.org/login
                </a>
              )}
            </div>
          )}

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@mission.org"
                        autoComplete="email"
                        inputMode="email"
                        className="h-10 rounded-lg bg-white text-[14px]"
                        style={{ borderColor: "#E2E8F0" }}
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
                    <div className="flex items-center justify-between">
                      <FormLabel style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Password</FormLabel>
                      <Link
                        href="/forgot-password"
                        style={{ fontSize: 13, fontWeight: 500, color: PURPLE, textDecoration: "none" }}
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="h-10 rounded-lg bg-white text-[14px]"
                        style={{ borderColor: "#E2E8F0" }}
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
                className="w-full rounded-lg text-[14px] font-semibold text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ height: 40, backgroundColor: DARK, marginTop: 8 }}
                onMouseEnter={e => { if (!login.isPending) e.currentTarget.style.backgroundColor = "#1a1a24"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = DARK; }}
                data-testid="btn-login-submit"
              >
                {login.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {login.isPending ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </Form>

          {/* Footer links — Render style */}
          <div style={{ marginTop: 20 }} className="space-y-1.5">
            <p style={{ fontSize: 13, color: "#64748B" }}>
              Don't have an account?{" "}
              <Link href="/signup" style={{ color: PURPLE, fontWeight: 500, textDecoration: "none" }}>
                Sign up
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* ── Footer verse ── */}
      <footer className="text-center px-6 py-5">
        <p style={{ fontSize: 11, color: "#CBD5E1", fontStyle: "italic" }}>
          "Declare his glory among the nations." — Psalm 96:3
        </p>
      </footer>

    </div>
  );
}
