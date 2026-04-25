import { useState } from "react";
import { Link, Redirect } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Eye, EyeOff, ShieldCheck, RefreshCw, Globe, Lock,
  CheckCircle2, Users,
} from "lucide-react";
import { usePlatformLogo } from "@/hooks/use-platform-logo";

const NAVY = "#0F172A";

const FEATURES = [
  "Unlimited users",
  "Media & prayer sharing",
  "Secure communication",
  "Cancel anytime",
];

export default function Signup() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { blue: logoUrl } = usePlatformLogo();

  const [orgName, setOrgName]           = useState("");
  const [subdomain, setSubdomain]       = useState("");
  const [name, setName]                 = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState("");

  if (isLoading) return null;
  if (isAuthenticated) return <Redirect href="/" />;

  function generateSubdomain(org: string) {
    return org.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!orgName.trim() || orgName.trim().length < 2) { setError("Organization name must be at least 2 characters"); return; }
    if (!subdomain || !/^[a-z0-9-]{2,30}$/.test(subdomain)) { setError("Subdomain: 2–30 lowercase letters, numbers, or hyphens"); return; }
    if (!name.trim() || name.trim().length < 2) { setError("Full name must be at least 2 characters"); return; }
    if (!email.includes("@")) { setError("A valid email is required"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationName: orgName.trim(), subdomain, fullName: name.trim(), email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong. Please try again."); return; }
      window.location.assign(data.checkoutUrl);
    } catch {
      toast({ title: "Network error", description: "Please check your connection and try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(160deg,#F5F8FC 0%,#EDF2F9 100%)" }}
    >
      {/* ── Nav ── */}
      <div className="w-full px-10 py-5 flex items-center justify-between">
        {logoUrl ? (
          <img src={logoUrl} alt="SentConnect" style={{ height: 27, width: "auto", maxWidth: 170, objectFit: "contain" }} />
        ) : (
          <span className="text-[15px] font-black tracking-tight text-blue-500">SentConnect</span>
        )}
        <Link
          href="/"
          className="text-[13px] font-medium transition-colors"
          style={{ color: "#94A3B8" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#64748B")}
          onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}
        >
          ← Back to sentconnect.org
        </Link>
      </div>

      {/* ── Card row ── */}
      <div className="flex-1 flex items-center justify-center px-6 pb-8">
        <div className="flex items-stretch gap-6" style={{ maxWidth: 980, width: "100%" }}>

          {/* ── LEFT: Pricing card ── */}
          <div
            className="flex flex-col bg-white rounded-3xl p-8"
            style={{ width: 290, flexShrink: 0, boxShadow: "0 4px 32px rgba(0,0,0,0.08)", borderRadius: 24 }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: "#EEF6FE" }}
            >
              <Users className="h-5 w-5" style={{ color: "#1E88FF" }} />
            </div>

            <p className="text-[15.5px] font-bold text-gray-900 mb-4">Organization Plan</p>

            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-[2.6rem] font-black leading-none" style={{ color: "#1E88FF" }}>$30</span>
              <span className="text-[13px] text-gray-400 font-medium ml-1">/ month</span>
            </div>
            <p className="text-[12.5px] text-gray-400 mb-6">per organization</p>

            <div className="w-full h-px bg-gray-100 mb-6" />

            <div className="flex flex-col gap-3.5 mb-auto">
              {FEATURES.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <CheckCircle2 className="h-[17px] w-[17px] flex-shrink-0" style={{ color: "#1E88FF" }} />
                  <span className="text-[13.5px] text-gray-600">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Blue gradient panel ── */}
          <div
            className="flex-1 flex flex-col p-9"
            style={{
              borderRadius: 28,
              background: "linear-gradient(135deg,#1E88FF 0%,#0A6CFF 100%)",
              boxShadow: "0 8px 48px rgba(10,108,255,0.35)",
            }}
          >
            {/* Hero */}
            <div className="text-center mb-6">
              <h1
                className="font-extrabold text-white tracking-tight leading-tight mb-2"
                style={{ fontSize: "clamp(1.7rem, 3vw, 2.25rem)" }}
              >
                Set Up Your Organization
              </h1>
              <p className="text-[14.5px]" style={{ color: "rgba(255,255,255,0.78)" }}>
                You'll be the admin. Invite your team after setup.
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-2 mb-7 flex-wrap">
              {[
                { icon: <ShieldCheck className="h-3.5 w-3.5" />, label: "Secure by Stripe" },
                { icon: <RefreshCw className="h-3.5 w-3.5" />, label: "Cancel anytime" },
                { icon: <Globe className="h-3.5 w-3.5" />, label: "Built for mission teams" },
              ].map(({ icon, label }, i) => (
                <span key={label} className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.82)" }}>
                  {i > 0 && <span className="mx-1" style={{ color: "rgba(255,255,255,0.35)" }}>•</span>}
                  {icon}
                  {label}
                </span>
              ))}
            </div>

            {/* White divider */}
            <div className="w-full h-px mb-6" style={{ background: "rgba(255,255,255,0.18)" }} />

            {/* Error */}
            {error && (
              <div className="bg-white/20 text-white text-[13px] px-4 py-2.5 rounded-xl mb-5 border border-white/30">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* ── Organization Details ── */}
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Organization Details
                </p>
                <div className="flex flex-col gap-3">
                  <Field label="Organization Name">
                    <input
                      value={orgName}
                      onChange={e => { setOrgName(e.target.value); if (!subdomain) setSubdomain(generateSubdomain(e.target.value)); }}
                      placeholder="e.g. Calvary Community Church"
                      required
                      className="w-full bg-white text-gray-900 placeholder:text-gray-400 text-[14.5px] px-4 outline-none rounded-xl focus:ring-2 focus:ring-white/50 transition"
                      style={{ height: 52, border: "none" }}
                    />
                  </Field>
                  <Field label="Subdomain">
                    <div className="flex items-center bg-white rounded-xl overflow-hidden" style={{ height: 52 }}>
                      <input
                        value={subdomain}
                        onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="e.g. calvary"
                        required
                        className="flex-1 px-4 text-[14.5px] text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
                        style={{ border: "none" }}
                      />
                      <span
                        className="px-3 text-[13px] font-medium whitespace-nowrap h-full flex items-center"
                        style={{ color: "#6B7280", background: "#F9FAFB", borderLeft: "1px solid #E5E7EB" }}
                      >
                        .sentconnect.org
                      </span>
                    </div>
                  </Field>
                </div>
              </div>

              {/* ── White divider ── */}
              <div className="w-full h-px" style={{ background: "rgba(255,255,255,0.18)" }} />

              {/* ── Your Account ── */}
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Your Account
                </p>
                <div className="flex flex-col gap-3">
                  <Field label="Full Name">
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Sarah Mitchell"
                      required
                      className="w-full bg-white text-gray-900 placeholder:text-gray-400 text-[14.5px] px-4 outline-none rounded-xl focus:ring-2 focus:ring-white/50 transition"
                      style={{ height: 52, border: "none" }}
                    />
                  </Field>
                  <div className="flex gap-3">
                    <Field label="Email" className="flex-1">
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.org"
                        required
                        className="w-full bg-white text-gray-900 placeholder:text-gray-400 text-[14.5px] px-4 outline-none rounded-xl focus:ring-2 focus:ring-white/50 transition"
                        style={{ height: 52, border: "none" }}
                      />
                    </Field>
                    <Field label="Password" className="flex-1">
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Min. 8 characters"
                          required
                          className="w-full bg-white text-gray-900 placeholder:text-gray-400 text-[14.5px] px-4 pr-11 outline-none rounded-xl focus:ring-2 focus:ring-white/50 transition"
                          style={{ height: 52, border: "none" }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </Field>
                  </div>
                </div>
              </div>

              {/* ── CTA ── */}
              <div className="mt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full font-semibold text-white rounded-xl text-[15px] flex items-center justify-center gap-2 transition-all"
                  style={{
                    height: 52,
                    background: submitting ? "#1E293B" : NAVY,
                    opacity: submitting ? 0.75 : 1,
                    boxShadow: "0 4px 18px rgba(0,0,0,0.3)",
                    letterSpacing: "0.01em",
                  }}
                  onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#1E293B"; }}
                  onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = NAVY; }}
                >
                  {submitting
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Redirecting to payment…</>
                    : "Set Up Your Organization →"
                  }
                </button>
                <p
                  className="text-center text-[11.5px] flex items-center justify-center gap-1.5 mt-2.5"
                  style={{ color: "rgba(255,255,255,0.58)" }}
                >
                  <Lock className="h-3 w-3 flex-shrink-0" />
                  You'll be redirected to Stripe to complete your payment securely.
                </p>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* ── Bottom note ── */}
      <div className="text-center pb-6">
        <p className="text-[12px] text-gray-400 flex items-center justify-center gap-1.5">
          <Lock className="h-3 w-3" />
          Secure checkout powered by{" "}
          <span className="font-semibold" style={{ color: "#1E88FF" }}>Stripe</span>
        </p>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.88)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
