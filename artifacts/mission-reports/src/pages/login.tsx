import { useState, useEffect } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useAuth } from "@/components/auth-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useLoginUser, useLogoutUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useSearch, useLocation } from "wouter";
import { LogOut, Loader2, Eye, EyeOff, ExternalLink, AtSign, Lock, Globe } from "lucide-react";
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
const LEFT_BG   = "#EEF2F9";
const INPUT_BG  = "#EEF2F9";

const TURNSTILE_SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ?? "";

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
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [demoToken, setDemoToken] = useState<string | null>(TURNSTILE_SITE_KEY ? null : "skip");
  const [demoTurnstileError, setDemoTurnstileError] = useState(false);
  const [demoTurnstileKey, setDemoTurnstileKey] = useState(0);

  useEffect(() => {
    if (!orgSlug) { setOrgName(null); return; }
    fetch(`/api/orgs/resolve?subdomain=${encodeURIComponent(orgSlug)}`)
      .then(r => r.ok ? r.json() : null)
      .then((d: any) => { if (d?.name) setOrgName(d.name); })
      .catch(() => {});
  }, [orgSlug]);

  const signupHref = orgSlug === "demo" ? "https://www.sentconnect.org/signup" : "/signup";

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
    <div style={{ minHeight: "100dvh", background: LEFT_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: 22, height: 22, color: BLUE }} className="animate-spin" />
    </div>
  );

  if (isAuthenticated && user) return (
    <div style={{ minHeight: "100dvh", display: "flex", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Left panel */}
      <div className="hidden md:flex" style={{ flex: "0 0 36%", background: LEFT_BG, alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div>
          <p style={{ fontSize: 38, fontWeight: 700, color: BLUE, letterSpacing: "-0.02em", lineHeight: 1.1, margin: "0 0 8px" }}>
            {platformMode ? "Admin\nsign in." : "Sign in."}
          </p>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#3A4A5C", margin: 0 }}>You're already signed in.</p>
        </div>
      </div>
      {/* Right panel */}
      <div style={{ flex: 1, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 32px" }}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={{ width: 54, height: 54, borderRadius: "50%", background: LEFT_BG, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: BLUE }}>{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{user.name}</p>
          <p style={{ fontSize: 13, color: "#607089", marginBottom: 28 }}>{user.email}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              style={{ flex: 1, height: 42, borderRadius: 999, background: LEFT_BG, color: "#3A4A5C", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "background .15s" }}
              onClick={() => logout.mutate({ data: undefined })}
              disabled={logout.isPending}
            >
              <LogOut style={{ width: 13, height: 13 }} />
              {logout.isPending ? "Signing out…" : "Sign out"}
            </button>
            <button
              style={{ flex: 1, height: 42, borderRadius: 999, background: BLUE, color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit", transition: "background .15s" }}
              onClick={() => navigate(from)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = BLUE_DARK; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = BLUE; }}
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── Top bar ── */}
      {!platformMode && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, padding: "10px 24px", borderBottom: "1px solid #E5E7EB", background: "#fff", flexShrink: 0 }}>
          <a
            href="/help"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 34, padding: "0 14px", borderRadius: 8, background: BLUE, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            Help
          </a>
          <a
            href={signupHref}
            style={{ display: "inline-flex", alignItems: "center", height: 34, padding: "0 16px", borderRadius: 8, background: "#fff", color: BLUE, fontSize: 13, fontWeight: 600, textDecoration: "none", border: `1.5px solid ${BLUE}` }}
          >
            Sign Up
          </a>
        </div>
      )}

      {/* ── Two-panel body ── */}
      <div style={{ flex: 1, display: "flex" }}>

      {/* ── Left panel (hidden on mobile) ── */}
      <div className="hidden md:flex" style={{ flex: "0 0 34%", background: LEFT_BG, flexDirection: "column", alignItems: "flex-end", justifyContent: "center", padding: "48px 60px 48px 32px", position: "relative" }}>
        <div style={{ maxWidth: 280 }}>
          <p style={{ fontSize: 48, fontWeight: 800, color: BLUE, letterSpacing: "-0.03em", lineHeight: 1.05, margin: "0 0 16px", whiteSpace: "pre-line" }}>
            {platformMode ? "Admin\nsign in" : "Sign in"}
          </p>
          <p style={{ fontSize: 17, fontWeight: 600, color: "#3A4A5C", margin: 0, lineHeight: 1.5, whiteSpace: orgSlug === "demo" ? "normal" : "nowrap" }}>
            {platformMode
              ? "SentConnect platform administration."
              : orgSlug === "demo"
                ? "Pick a role below to explore the live demo."
                : "Enter your username and password"}
          </p>
        </div>
        <p style={{ position: "absolute", bottom: 32, left: 0, right: 0, textAlign: "center", fontSize: 11, color: "#A8B8CC", fontStyle: "italic", margin: 0 }}>
          "Declare his glory among the nations." — Psalm 96:3
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="px-5 py-10 sm:px-10 sm:py-12 md:px-14 items-center md:items-start" style={{ flex: 1, background: "#fff", display: "flex", flexDirection: "column", justifyContent: "center" }}>

        {/* Mobile-only heading */}
        <div className="md:hidden" style={{ textAlign: "center", marginBottom: 32, width: "100%", maxWidth: 460 }}>
          <p style={{ fontSize: 36, fontWeight: 800, color: BLUE, letterSpacing: "-0.03em", lineHeight: 1.05, margin: "0 0 8px" }}>
            Sign in
          </p>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#3A4A5C", margin: 0 }}>{orgSlug === "demo" ? "Pick a role below to explore the live demo." : "Enter your username and password."}</p>
        </div>

        <div style={{ width: "100%", maxWidth: orgSlug === "demo" ? 560 : 460 }}>

          {/* Org portal error */}
          {orgPortalError && (
            <div style={{ marginBottom: 20, background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 12, padding: "14px 16px" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#92400E", marginBottom: 4 }}>Wrong login portal</p>
              <p style={{ fontSize: 13, color: "#78350F", lineHeight: 1.55, margin: 0 }}>
                This account belongs to an organization. Sign in through your org's portal.
              </p>
              {orgPortalError.subdomain && (
                <a
                  href={buildOrgLoginHref(orgPortalError.subdomain)}
                  style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: BLUE, textDecoration: "none" }}
                >
                  <ExternalLink style={{ width: 12, height: 12 }} />
                  Go to {orgPortalError.subdomain}.sentconnect.org
                </a>
              )}
            </div>
          )}

          {/* Hosting provider row */}
          <p style={{ fontSize: 12, fontWeight: 600, color: "#8A9BB8", letterSpacing: "0.04em", textTransform: "uppercase", margin: "0 0 8px", paddingLeft: 2 }}>
            {orgName ? "Organization" : "Hosting provider"}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: INPUT_BG, borderRadius: 10, padding: "0 14px", height: 48, marginBottom: 16 }}>
            <Globe style={{ width: 15, height: 15, color: "#9BACC4", flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "#111827", fontFamily: "inherit" }}>
              {orgName ?? "SentConnect"}
            </span>
          </div>

          {/* Account login form — hidden on the demo org (one-click role access only) */}
          {orgSlug !== "demo" && (
          <>
          {/* Account label */}
          <p style={{ fontSize: 12, fontWeight: 600, color: "#8A9BB8", letterSpacing: "0.04em", textTransform: "uppercase", margin: "0 0 8px", paddingLeft: 2 }}>Account</p>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>

              {/* Email input */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem style={{ marginBottom: 2 }}>
                    <FormControl>
                      <div style={{ position: "relative", borderRadius: "10px 10px 0 0", overflow: "hidden" }}>
                        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: emailFocused ? BLUE : "#9BACC4", display: "flex", alignItems: "center", pointerEvents: "none", transition: "color .15s" }}>
                          <AtSign style={{ width: 15, height: 15 }} />
                        </span>
                        <input
                          type="email"
                          placeholder="Username or email address"
                          autoComplete="email"
                          inputMode="email"
                          style={{
                            width: "100%",
                            height: 48,
                            background: INPUT_BG,
                            border: "none",
                            borderBottom: "1.5px solid #DAE3F0",
                            borderRadius: "10px 10px 0 0",
                            padding: "0 14px 0 40px",
                            fontSize: 14,
                            color: "#111827",
                            outline: "none",
                            boxSizing: "border-box",
                            fontFamily: "inherit",
                          }}
                          onFocus={() => setEmailFocused(true)}
                          onBlur={() => setEmailFocused(false)}
                          data-testid="input-login-email"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs px-1 mt-1" />
                  </FormItem>
                )}
              />

              {/* Password input */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem style={{ marginBottom: 0 }}>
                    <FormControl>
                      <div style={{ position: "relative", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
                        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: passwordFocused ? BLUE : "#9BACC4", display: "flex", alignItems: "center", pointerEvents: "none", transition: "color .15s" }}>
                          <Lock style={{ width: 14, height: 14 }} />
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          autoComplete="current-password"
                          style={{
                            width: "100%",
                            height: 48,
                            background: INPUT_BG,
                            border: "none",
                            borderRadius: "0 0 10px 10px",
                            padding: "0 100px 0 40px",
                            fontSize: 14,
                            color: "#111827",
                            outline: "none",
                            boxSizing: "border-box",
                            fontFamily: "inherit",
                          }}
                          onFocus={() => setPasswordFocused(true)}
                          onBlur={() => setPasswordFocused(false)}
                          data-testid="input-login-password"
                          {...field}
                        />
                        {/* Forgot? link inside the input */}
                        <Link
                          href="/forgot-password"
                          style={{ position: "absolute", right: 36, top: "50%", transform: "translateY(-50%)", fontSize: 13, fontWeight: 500, color: "#8A9BB8", textDecoration: "none", whiteSpace: "nowrap" }}
                        >
                          Forgot?
                        </Link>
                        {/* Eye toggle */}
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowPassword(s => !s)}
                          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9BACC4", padding: 0, display: "flex", alignItems: "center" }}
                        >
                          {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs px-1 mt-1" />
                  </FormItem>
                )}
              />

              {/* Button row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 20 }}>
                {!platformMode ? (
                  <a
                    href={signupHref}
                    style={{
                      height: 42,
                      borderRadius: 999,
                      background: INPUT_BG,
                      color: "#3A4A5C",
                      fontSize: 14,
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 22px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Sign up
                  </a>
                ) : (
                  <Link
                    href="/"
                    style={{
                      height: 42,
                      borderRadius: 999,
                      background: INPUT_BG,
                      color: "#3A4A5C",
                      fontSize: 14,
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 22px",
                    }}
                  >
                    Back
                  </Link>
                )}

                <button
                  type="submit"
                  disabled={login.isPending}
                  data-testid="btn-login-submit"
                  style={{
                    height: 42,
                    borderRadius: 999,
                    background: login.isPending ? "#4D8EFF" : BLUE,
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    border: "none",
                    cursor: login.isPending ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    padding: "0 28px",
                    fontFamily: "inherit",
                    letterSpacing: "-0.01em",
                    transition: "background .15s",
                  }}
                  onMouseEnter={e => { if (!login.isPending) (e.currentTarget as HTMLElement).style.background = BLUE_DARK; }}
                  onMouseLeave={e => { if (!login.isPending) (e.currentTarget as HTMLElement).style.background = BLUE; }}
                >
                  {login.isPending && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
                  {login.isPending ? "Signing in…" : "Sign in"}
                </button>
              </div>

            </form>
          </Form>
          </>
          )}

          {/* Demo quick-access — only shown on the demo org */}
          {orgSlug === "demo" && (
            <div style={{ marginTop: 28 }}>
              <div style={{ marginBottom: 28 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#F0F6FF", borderRadius: 999, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: BLUE_DARK, marginBottom: 20 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: "#22C55E", display: "inline-block" }} />
                  Live demo · No signup required
                </span>

                <p style={{ fontSize: 26, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.02em", lineHeight: 1.2, margin: "0 0 10px" }}>
                  Explore SentConnect
                </p>
                <p style={{ fontSize: 16.5, color: "#4B5563", lineHeight: 1.65, margin: "0 0 32px", maxWidth: 500 }}>
                  Experience SentConnect from either perspective. Click a role below to instantly enter the demo.
                </p>

                <div style={{ display: "flex", gap: 18, marginBottom: 26 }}>
                  <span style={{ flexShrink: 0, width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #EAF2FF, #DBEAFE)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 23 }}>🌍</span>
                  <div>
                    <p style={{ fontSize: 17.5, fontWeight: 700, color: "#0F172A", margin: "0 0 5px" }}>Field User</p>
                    <p style={{ fontSize: 15.5, color: "#4B5563", lineHeight: 1.65, margin: 0 }}>
                      Share mission updates, photos, prayer requests, and stories directly from the field so your church stays informed and engaged.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 18 }}>
                  <span style={{ flexShrink: 0, width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #EAF2FF, #DBEAFE)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 23 }}>👨‍💼</span>
                  <div>
                    <p style={{ fontSize: 17.5, fontWeight: 700, color: "#0F172A", margin: "0 0 5px" }}>Admin</p>
                    <p style={{ fontSize: 15.5, color: "#4B5563", lineHeight: 1.65, margin: 0 }}>
                      Manage missionaries and teams, review field updates, publish church-wide posts, view reports, and keep your congregation connected.
                    </p>
                  </div>
                </div>

                <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #E2E8F0 20%, #E2E8F0 80%, transparent)", margin: "30px 0 0" }} />
              </div>

              {/* Invisible Turnstile — resolves automatically for real humans */}
              {TURNSTILE_SITE_KEY && !demoTurnstileError && (
                <Turnstile
                  key={demoTurnstileKey}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={(t) => { setDemoToken(t); setDemoTurnstileError(false); }}
                  onError={() => { setDemoToken(null); setDemoTurnstileError(true); }}
                  onExpire={() => setDemoToken(null)}
                  options={{ size: "invisible" }}
                />
              )}

              {demoTurnstileError && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
                  <p style={{ fontSize: 12, color: "#B91C1C", margin: 0, lineHeight: 1.4 }}>
                    Security check couldn't load. Disable tracking protection or
                  </p>
                  <button
                    type="button"
                    onClick={() => { setDemoTurnstileError(false); setDemoToken(null); setDemoTurnstileKey(k => k + 1); }}
                    style={{ flexShrink: 0, background: "#fff", border: "1px solid #FCA5A5", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, color: "#B91C1C", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Retry
                  </button>
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { label: "Field User", sublabel: "Post updates & photos", emoji: "🌍", endpoint: "/api/auth/demo-user-login", primary: true },
                  { label: "Admin", sublabel: "Manage team & reports", emoji: "👨‍💼", endpoint: "/api/auth/demo-login", primary: false },
                ].map(({ label, sublabel, emoji, endpoint, primary }) => {
                  const waiting = TURNSTILE_SITE_KEY && !demoToken && !demoTurnstileError;
                  return (
                    <button
                      key={endpoint}
                      type="button"
                      disabled={!!waiting}
                      onClick={async () => {
                        try {
                          const res = await fetch(endpoint, {
                            method: "POST",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(demoToken && demoToken !== "skip" ? { turnstileToken: demoToken } : {}),
                          });
                          if (!res.ok) {
                            const data = await res.json().catch(() => ({}));
                            throw new Error(data.error ?? "failed");
                          }
                          await queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
                          navigate(from);
                        } catch (err) {
                          toast({
                            title: "Demo unavailable",
                            description: err instanceof Error ? err.message : "Please try again in a moment.",
                            variant: "destructive",
                          });
                        }
                      }}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        background: waiting ? "#F5F8FC" : primary ? BLUE : "#fff",
                        border: primary ? `1.5px solid ${BLUE}` : "1.5px solid #C7D9F5",
                        borderRadius: 12,
                        padding: "13px 15px",
                        textAlign: "left",
                        cursor: waiting ? "default" : "pointer",
                        fontFamily: "inherit",
                        opacity: waiting ? 0.6 : 1,
                        boxShadow: primary && !waiting ? "0 2px 8px rgba(0,106,255,0.28)" : "0 1px 2px rgba(16,24,40,0.05)",
                        transition: "transform .15s, box-shadow .15s, background .15s, border-color .15s, opacity .15s",
                      }}
                      onMouseEnter={e => {
                        if (waiting) return;
                        const el = e.currentTarget as HTMLElement;
                        el.style.transform = "translateY(-2px)";
                        el.style.boxShadow = primary ? "0 6px 16px rgba(0,106,255,0.38)" : "0 4px 12px rgba(16,24,40,0.12)";
                        el.style.background = primary ? BLUE_DARK : "#F0F6FF";
                        if (!primary) el.style.borderColor = BLUE;
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.transform = "translateY(0)";
                        el.style.boxShadow = primary && !waiting ? "0 2px 8px rgba(0,106,255,0.28)" : "0 1px 2px rgba(16,24,40,0.05)";
                        el.style.background = waiting ? "#F5F8FC" : primary ? BLUE : "#fff";
                        el.style.borderColor = primary ? BLUE : "#C7D9F5";
                      }}
                    >
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: 16, fontWeight: 700, color: primary ? "#fff" : "#111827", marginBottom: 3 }}>{emoji} {label}</span>
                        <span style={{ display: "block", fontSize: 13, color: primary ? "rgba(255,255,255,0.85)" : "#8A9BB8" }}>{sublabel}</span>
                      </span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primary ? "#fff" : BLUE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                    </button>
                  );
                })}
              </div>

              <div style={{ textAlign: "center", marginTop: 16 }}>
                <a
                  href="https://www.sentconnect.org"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: BLUE, textDecoration: "none" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                  Back to sentconnect.org
                </a>
              </div>
            </div>
          )}

          {/* Footer verse — desktop hidden (in left panel); mobile shown here */}
          <p className="md:hidden" style={{ fontSize: 11, color: "#C0CDD8", fontStyle: "italic", textAlign: "center", marginTop: 40, margin: "40px 0 0" }}>
            "Declare his glory among the nations." — Psalm 96:3
          </p>

        </div>
      </div>
      </div>{/* end two-panel body */}
    </div>
  );
}
