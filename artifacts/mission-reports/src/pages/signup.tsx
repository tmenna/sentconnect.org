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
    "w-full px-3.5 text-[13.5px] border border-gray-200 rounded-lg bg-white outline-none " +
    "focus:ring-2 focus:ring-blue-100 focus:border-[#1898F3] transition-all placeholder:text-gray-400 text-gray-900";

  const features = [
    "Unlimited users",
    "Media & prayer sharing",
    "Secure communication",
    "Cancel anytime",
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F5F7FA" }}>

      {/* Nav */}
      <div className="w-full flex items-center justify-between px-6 py-4">
        {logoUrl ? (
          <img src={logoUrl} alt="SentConnect" style={{ height: 26, width: "auto", maxWidth: 160, objectFit: "contain" }} />
        ) : (
          <span className="text-[15px] font-black tracking-tight" style={{ color: BLUE }}>SentConnect</span>
        )}
        <Link href="/" className="text-[13px] font-medium text-gray-400 hover:text-gray-600 transition-colors">
          ← Back to sentconnect.org
        </Link>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">

        {/* Heading */}
        <div className="text-center mb-4">
          <h1 className="text-[2rem] font-bold text-gray-900 tracking-tight mb-1.5">
            Set Up Your Organization
          </h1>
          <p className="text-[14.5px] text-gray-500">
            You'll be the admin. Invite your team after setup.
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex items-center gap-2 mb-5 flex-wrap justify-center">
          {[
            { icon: <ShieldCheck className="h-3.5 w-3.5" />, label: "Secure by Stripe" },
            { icon: <RefreshCw className="h-3.5 w-3.5" />, label: "Cancel anytime" },
            { icon: <Globe className="h-3.5 w-3.5" />, label: "Built for mission teams" },
          ].map(({ icon, label }, i) => (
            <span key={label} className="flex items-center gap-1.5 text-[12.5px] text-gray-500 font-medium">
              {i > 0 && <span className="text-gray-300 mr-1">•</span>}
              <span style={{ color: BLUE }}>{icon}</span>
              {label}
            </span>
          ))}
        </div>

        {/* Two-column card */}
        <div
          className="w-full bg-white rounded-2xl overflow-hidden"
          style={{ maxWidth: 860, boxShadow: "0 4px 32px rgba(0,0,0,0.10)", display: "flex" }}
        >
          {/* LEFT — Plan summary */}
          <div className="flex flex-col p-8" style={{ width: 280, flexShrink: 0, borderRight: "1px solid #F0F2F5" }}>
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center mb-5"
              style={{ background: "#EEF6FE" }}
            >
              <Users className="h-5 w-5" style={{ color: BLUE }} />
            </div>

            <p className="text-[16px] font-bold text-gray-900 mb-3">Mission Team Plan</p>

            <div className="mb-1 flex items-baseline gap-1">
              <span className="text-[2.6rem] font-black leading-none" style={{ color: BLUE }}>$30</span>
              <span className="text-[14px] text-gray-400 font-medium">/ month</span>
            </div>
            <p className="text-[12.5px] text-gray-400 mb-5">per organization</p>

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

          {/* RIGHT — Form */}
          <div className="flex-1 p-8">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-2.5 rounded-lg mb-4">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Organization Details */}
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Organization Details
                </p>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Organization Name</label>
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
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Subdomain</label>
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-[#1898F3]" style={{ height: 42 }}>
                      <input
                        value={subdomain}
                        onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="e.g. calvary"
                        required
                        className="flex-1 px-3.5 text-[13.5px] outline-none bg-transparent placeholder:text-gray-400 text-gray-900"
                      />
                      <span className="px-3.5 text-[12.5px] text-gray-400 bg-gray-50 h-full flex items-center border-l border-gray-200 font-medium whitespace-nowrap">
                        .sentconnect.org
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Account */}
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Your Account
                </p>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Full Name</label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Sarah Mitchell"
                      required
                      className={inputCls}
                      style={{ height: 42 }}
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Email</label>
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
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Password</label>
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
                  className="w-full text-white font-semibold rounded-lg text-[14.5px] flex items-center justify-center gap-2 transition-all"
                  style={{
                    height: 46,
                    background: submitting ? "#7BB8EC" : BLUE,
                    boxShadow: submitting ? "none" : `0 4px 14px rgba(24,152,243,0.35)`,
                  }}
                  onMouseEnter={e => { if (!submitting) { e.currentTarget.style.background = BLUE_DK; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                  onMouseLeave={e => { if (!submitting) { e.currentTarget.style.background = BLUE; e.currentTarget.style.transform = "translateY(0)"; } }}
                >
                  {submitting
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting to payment…</>
                    : "Set Up Your Organization →"
                  }
                </button>
                <p className="text-center text-[11.5px] text-gray-400 flex items-center justify-center gap-1.5 mt-2.5">
                  <Lock className="h-3 w-3 flex-shrink-0" />
                  You'll be redirected to Stripe to complete your payment securely.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Stripe note */}
        <p className="text-[12px] text-gray-400 flex items-center gap-1.5 mt-4">
          <Lock className="h-3 w-3" />
          Secure checkout powered by <span className="font-semibold" style={{ color: BLUE }}>Stripe</span>
        </p>

      </div>
    </div>
  );
}
