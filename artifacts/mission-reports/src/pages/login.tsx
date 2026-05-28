import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useLoginUser, useLogoutUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useSearch, useLocation } from "wouter";
import { LogOut, Loader2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { buildOrgLoginHref } from "@/lib/org";
import { useLogo } from "@/providers/logo-provider";
import { useOrg } from "@/providers/org-provider";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const BLUE      = "#006AFF";
const BLUE_DARK = "#0053CC";
const BG        = "#F5F7FA";
const CARD_BDR  = "#DCE3EC";

const INPUT_BASE: React.CSSProperties = {
  width: "100%",
  height: 46,
  borderRadius: 10,
  border: `1px solid ${CARD_BDR}`,
  background: "#F8FAFC",
  padding: "0 14px",
  fontSize: 15,
  color: "#111827",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "Inter, system-ui, sans-serif",
  transition: "border-color .15s, background .15s",
};

export default function Login({ platformMode }: { platformMode?: boolean } = {}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const search = useSearch();
  const [, navigate] = useLocation();
  const [orgPortalError, setOrgPortalError] = useState<{ subdomain: string | null } | null>(null);
  const { orgSlug } = useOrg();
  const [orgName, setOrgName] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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

  function onSubmit(data: LoginFormValues) {
    login.mutate({ data });
  }

  if (isLoading) return (
    <div style={{ minHeight: "100dvh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: 22, height: 22, color: BLUE }} className="animate-spin" />
    </div>
  );

  if (isAuthenticated && user) return (
    <div style={{ minHeight: "100dvh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ background: "#fff", border: `1px solid ${CARD_BDR}`, borderRadius: 18, padding: "36px 32px", width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#EEF4FF", border: `1.5px solid #C7D9FF`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: BLUE }}>{user.name.charAt(0).toUpperCase()}</span>
        </div>
        <p style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{user.name}</p>
        <p style={{ fontSize: 13, color: "#607089", marginBottom: 28 }}>{user.email}</p>
        <button
          style={{ width: "100%", height: 46, borderRadius: 999, background: BLUE, color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", marginBottom: 10, fontFamily: "inherit", transition: "background .15s" }}
          onClick={() => navigate(from)}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = BLUE_DARK; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = BLUE; }}
        >
          Continue to app
        </button>
        <button
          style={{ width: "100%", height: 46, borderRadius: 999, background: BG, color: "#111827", fontSize: 14, fontWeight: 600, border: `1px solid ${CARD_BDR}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit", transition: "background .15s" }}
          onClick={() => logout.mutate({ data: undefined })}
          disabled={logout.isPending}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#EEF1F6"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = BG; }}
        >
          <LogOut style={{ width: 14, height: 14 }} />
          {logout.isPending ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );

  const headlineText = platformMode ? "Admin\nsign in." : "Sign in.";
  const subtitleText = platformMode
    ? "SentConnect platform administration."
    : "Your private mission feed awaits.";

  return (
    <div style={{ minHeight: "100dvh", background: BG, fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: 920 }}>

          {/* ── Mobile heading ── */}
          <div className="md:hidden" style={{ textAlign: "center", marginBottom: 28 }}>
            <h1 style={{ fontSize: 46, fontWeight: 700, color: BLUE, letterSpacing: "-0.03em", lineHeight: 0.95, margin: "0 0 10px" }}>
              Sign in.
            </h1>
            {orgName && (
              <OrgBadge orgName={orgName} />
            )}
          </div>

          {/* ── Two-column (desktop) ── */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-[80px]">

            {/* Left: Branding */}
            <div className="hidden md:flex flex-col flex-1" style={{ gap: 24, paddingBottom: 8 }}>
              <div>
                <h1 style={{ fontSize: 72, fontWeight: 700, color: BLUE, letterSpacing: "-0.03em", lineHeight: 0.95, margin: "0 0 16px", whiteSpace: "pre-line" }}>
                  {headlineText}
                </h1>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#4B5C7A", margin: 0 }}>
                  {subtitleText}
                </p>
              </div>

              {orgName && <OrgBadge orgName={orgName} />}

              <p style={{ fontSize: 12, color: "#B8C4D0", fontStyle: "italic", marginTop: 32 }}>
                "Declare his glory among the nations." — Psalm 96:3
              </p>
            </div>

            {/* Right: Login card */}
            <div
              style={{
                background: "#fff",
                border: `1px solid ${CARD_BDR}`,
                borderRadius: 18,
                padding: "36px 32px",
              }}
              className="w-full md:w-[380px] md:flex-shrink-0"
            >

              {/* Card header — mobile only */}
              <div className="md:hidden" style={{ marginBottom: 22 }}>
                <p style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: 0 }}>Welcome back</p>
              </div>

              {/* Org portal error */}
              {orgPortalError && (
                <div style={{ marginBottom: 20, background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 12, padding: "14px 16px" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#92400E", marginBottom: 4 }}>Wrong login portal</p>
                  <p style={{ fontSize: 13, color: "#78350F", lineHeight: 1.55, marginBottom: 0 }}>
                    This account belongs to an organization. Sign in through your organization's portal.
                  </p>
                  {orgPortalError.subdomain && (
                    <a
                      href={buildOrgLoginHref(orgPortalError.subdomain)}
                      style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: BLUE, textDecoration: "none" }}
                    >
                      <ExternalLink style={{ width: 12, height: 12 }} />
                      Go to {orgPortalError.subdomain}.sentconnect.org/login
                    </a>
                  )}
                </div>
              )}

              {/* Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 13 }}>

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <input
                            type="email"
                            placeholder="Email address"
                            autoComplete="email"
                            inputMode="email"
                            style={INPUT_BASE}
                            onFocus={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.background = "#fff"; }}
                            onBlur={e => { e.currentTarget.style.borderColor = CARD_BDR; e.currentTarget.style.background = "#F8FAFC"; }}
                            data-testid="input-login-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs mt-1" />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div style={{ position: "relative" }}>
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Password"
                              autoComplete="current-password"
                              style={{ ...INPUT_BASE, paddingRight: 44 }}
                              onFocus={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.background = "#fff"; }}
                              onBlur={e => { e.currentTarget.style.borderColor = CARD_BDR; e.currentTarget.style.background = "#F8FAFC"; }}
                              data-testid="input-login-password"
                              {...field}
                            />
                            <button
                              type="button"
                              tabIndex={-1}
                              onClick={() => setShowPassword(s => !s)}
                              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#8FA3BE", padding: 0, display: "flex", alignItems: "center" }}
                            >
                              {showPassword
                                ? <EyeOff style={{ width: 16, height: 16 }} />
                                : <Eye style={{ width: 16, height: 16 }} />
                              }
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs mt-1" />
                      </FormItem>
                    )}
                  />

                  {/* Forgot password */}
                  <div style={{ textAlign: "right", marginTop: -4 }}>
                    <Link
                      href="/forgot-password"
                      style={{ fontSize: 13, fontWeight: 500, color: BLUE, textDecoration: "none" }}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={login.isPending}
                    data-testid="btn-login-submit"
                    style={{
                      width: "100%",
                      height: 46,
                      borderRadius: 999,
                      background: login.isPending ? "#4D8EFF" : BLUE,
                      color: "#fff",
                      fontSize: 15,
                      fontWeight: 700,
                      border: "none",
                      cursor: login.isPending ? "not-allowed" : "pointer",
                      marginTop: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      fontFamily: "inherit",
                      transition: "background .15s",
                      letterSpacing: "-0.01em",
                    }}
                    onMouseEnter={e => { if (!login.isPending) (e.currentTarget as HTMLElement).style.background = BLUE_DARK; }}
                    onMouseLeave={e => { if (!login.isPending) (e.currentTarget as HTMLElement).style.background = BLUE; }}
                  >
                    {login.isPending && <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" />}
                    {login.isPending ? "Signing in…" : "Sign in"}
                  </button>

                </form>
              </Form>

              {/* Sign up link */}
              {!platformMode && (
                <div style={{ marginTop: 22, paddingTop: 20, borderTop: `1px solid #F0F4F8`, textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: "#607089", margin: 0 }}>
                    New to SentConnect?{" "}
                    <Link href="/signup" style={{ color: BLUE, fontWeight: 600, textDecoration: "none" }}>
                      Create an account
                    </Link>
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── Footer (mobile) ── */}
      <footer className="md:hidden text-center px-6 py-4">
        <p style={{ fontSize: 11, color: "#C8D3DF", fontStyle: "italic", margin: 0 }}>
          "Declare his glory among the nations." — Psalm 96:3
        </p>
      </footer>

    </div>
  );
}

function OrgBadge({ orgName }: { orgName: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#EEF4FF", border: "1px solid #C7D9FF", borderRadius: 999, padding: "5px 14px" }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#006AFF", flexShrink: 0 }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: "#006AFF", letterSpacing: "0.07em", textTransform: "uppercase" }}>
        {orgName}
      </span>
    </div>
  );
}
