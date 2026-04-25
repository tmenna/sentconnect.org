import { useState } from "react";
import { Link, Redirect } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, ShieldCheck, RefreshCw, Globe, Lock, CheckCircle2, Users } from "lucide-react";
import { usePlatformLogo } from "@/hooks/use-platform-logo";

const BLUE    = "#1898F3";
const BLUE_DK = "#1280D0";

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
  const [errors, setErrors]             = useState<Record<string, string>>({});

  if (isLoading) return null;
  if (isAuthenticated) return <Redirect href="/" />;

  function generateSubdomain(org: string) {
    return org.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    if (!orgName.trim() || orgName.trim().length < 2) { setErrors({ general: "Organization name must be at least 2 characters" }); return; }
    if (!subdomain || !/^[a-z0-9-]{2,30}$/.test(subdomain)) { setErrors({ general: "Subdomain must be 2–30 lowercase letters, numbers, or hyphens" }); return; }
    if (!name.trim() || name.trim().length < 2) { setErrors({ general: "Full name must be at least 2 characters" }); return; }
    if (!email.includes("@")) { setErrors({ general: "Valid email is required" }); return; }
    if (password.length < 8) { setErrors({ general: "Password must be at least 8 characters" }); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationName: orgName.trim(), subdomain, fullName: name.trim(), email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ general: data.error ?? "Something went wrong. Please try again." }); return; }
      window.location.assign(data.checkoutUrl);
    } catch {
      toast({ title: "Network error", description: "Please check your connection and try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    "w-full px-3.5 text-[13.5px] border-0 rounded-lg bg-white outline-none " +
    "focus:ring-2 focus:ring-white/60 transition-all placeholder:text-gray-400 text-gray-900";

  const features = [
    "Unlimited users",
    "Media & prayer sharing",
    "Secure communication",
    "Cancel anytime",
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F0F4F8" }}>

      {/* Nav */}
      <div className="w-full px-8 py-4">
        {logoUrl ? (
          <img src={logoUrl} alt="SentConnect" style={{ height: 26, width: "auto", maxWidth: 160, objectFit: "contain" }} />
        ) : (
          <span className="text-[15px] font-black tracking-tight" style={{ color: BLUE }}>SentConnect</span>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-6">
        <div className="flex items-stretch gap-5" style={{ maxWidth: 960, width: "100%" }}>

          {/* LEFT — Plan card (white, floating) */}
          <div
            className="flex flex-col bg-white rounded-2xl p-7"
            style={{ width: 280, flexShrink: 0, boxShadow: "0 2px 20px rgba(0,0,0,0.08)" }}
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center mb-5"
              style={{ background: "#EEF6FE" }}
            >
              <Users className="h-5 w-5" style={{ color: BLUE }} />
            </div>

            <p className="text-[15px] font-bold text-gray-900 mb-3">Organization Plan</p>

            <div className="mb-0.5 flex items-baseline gap-1">
              <span className="text-[2.4rem] font-black leading-none" style={{ color: BLUE }}>$30</span>
              <span className="text-[13px] text-gray-400 font-medium">/ month</span>
            </div>
            <p className="text-[12px] text-gray-400 mb-5">per organization</p>

            <div className="w-full h-px bg-gray-100 mb-5" />

            <div className="flex flex-col gap-3">
              {features.map(f => (
                <div key={f} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: BLUE }} />
                  <span className="text-[13px] text-gray-600">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Blue form panel */}
          <div
            className="flex-1 rounded-2xl p-8 flex flex-col"
            style={{ background: BLUE, boxShadow: "0 2px 20px rgba(24,152,243,0.3)" }}
          >
            {/* Heading inside blue panel */}
            <div className="text-center mb-5">
              <h1 className="text-[1.75rem] font-bold text-white tracking-tight mb-1">
                Set Up Your Organization
              </h1>
              <p className="text-[13.5px]" style={{ color: "rgba(255,255,255,0.8)" }}>
                You'll be the admin. Invite your team after setup.
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
              {[
                { icon: <ShieldCheck className="h-3 w-3" />, label: "Secure by Stripe" },
                { icon: <RefreshCw className="h-3 w-3" />, label: "Cancel anytime" },
                { icon: <Globe className="h-3 w-3" />, label: "Built for mission teams" },
              ].map(({ icon, label }, i) => (
                <span key={label} className="flex items-center gap-1.5 text-[11.5px] font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {i > 0 && <span style={{ color: "rgba(255,255,255,0.4)" }} className="mr-1">•</span>}
                  {icon}
                  {label}
                </span>
              ))}
            </div>

            {/* Form */}
            {errors.general && (
              <div className="bg-white/20 text-white text-[13px] px-4 py-2.5 rounded-lg mb-4 border border-white/30">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Organization Details */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Organization Details
                </p>
                <div className="flex flex-col gap-2.5">
                  <div>
                    <label className="block text-[12.5px] font-semibold mb-1" style={{ color: "rgba(255,255,255,0.9)" }}>Organization Name</label>
                    <input
                      value={orgName}
                      onChange={e => { setOrgName(e.target.value); if (!subdomain) setSubdomain(generateSubdomain(e.target.value)); }}
                      placeholder="e.g. Calvary Community Church"
                      required
                      className={inputCls}
                      style={{ height: 42 }}
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold mb-1" style={{ color: "rgba(255,255,255,0.9)" }}>Subdomain</label>
                    <div className="flex items-center rounded-lg overflow-hidden bg-white" style={{ height: 42 }}>
                      <input
                        value={subdomain}
                        onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="e.g. calvary"
                        required
                        className="flex-1 px-3.5 text-[13.5px] outline-none bg-transparent placeholder:text-gray-400 text-gray-900 focus:ring-0"
                      />
                      <span className="px-3 text-[12px] text-gray-400 bg-gray-50 h-full flex items-center border-l border-gray-200 font-medium whitespace-nowrap">
                        .sentconnect.org
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Account */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Your Account
                </p>
                <div className="flex flex-col gap-2.5">
                  <div>
                    <label className="block text-[12.5px] font-semibold mb-1" style={{ color: "rgba(255,255,255,0.9)" }}>Full Name</label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Sarah Mitchell"
                      required
                      className={inputCls}
                      style={{ height: 42 }}
                    />
                  </div>
                  <div className="flex gap-2.5">
                    <div className="flex-1">
                      <label className="block text-[12.5px] font-semibold mb-1" style={{ color: "rgba(255,255,255,0.9)" }}>Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.org"
                        required
                        className={inputCls}
                        style={{ height: 42 }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[12.5px] font-semibold mb-1" style={{ color: "rgba(255,255,255,0.9)" }}>Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Min. 8 characters"
                          required
                          className={inputCls + " pr-10"}
                          style={{ height: 42 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full font-semibold rounded-lg text-[14.5px] flex items-center justify-center gap-2 transition-all"
                  style={{
                    height: 46,
                    background: submitting ? "rgba(255,255,255,0.7)" : "#fff",
                    color: submitting ? "rgba(24,152,243,0.6)" : BLUE,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                  onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#F0F8FF"; }}
                  onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = "#fff"; }}
                >
                  {submitting
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting to payment…</>
                    : "Set Up Your Organization →"
                  }
                </button>
                <p className="text-center text-[11px] flex items-center justify-center gap-1.5 mt-2" style={{ color: "rgba(255,255,255,0.65)" }}>
                  <Lock className="h-3 w-3 flex-shrink-0" />
                  You'll be redirected to Stripe to complete your payment securely.
                </p>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* Bottom Stripe note */}
      <div className="text-center pb-5">
        <p className="text-[12px] text-gray-400 flex items-center justify-center gap-1.5">
          <Lock className="h-3 w-3" />
          Secure checkout powered by <span className="font-semibold" style={{ color: BLUE }}>Stripe</span>
        </p>
      </div>

    </div>
  );
}
