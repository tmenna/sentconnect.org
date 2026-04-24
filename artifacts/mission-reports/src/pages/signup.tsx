import { useState } from "react";
import { Link, Redirect } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Shuffle, Loader2, Eye, EyeOff, ShieldCheck, RefreshCw, Globe, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePlatformLogo } from "@/hooks/use-platform-logo";

const BLUE    = "#005BBC";
const BLUE_DK = "#0047A8";

export default function Signup() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const logoUrl = usePlatformLogo();

  const [orgName, setOrgName]       = useState("");
  const [subdomain, setSubdomain]   = useState("");
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  if (isLoading) return null;
  if (isAuthenticated) return <Redirect href="/" />;

  function generateSubdomain(org: string) {
    return org.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (!orgName.trim() || orgName.trim().length < 2) {
      setErrors({ general: "Organization name must be at least 2 characters" }); return;
    }
    if (!subdomain || !/^[a-z0-9-]{2,30}$/.test(subdomain)) {
      setErrors({ general: "Subdomain must be 2–30 lowercase letters, numbers, or hyphens" }); return;
    }
    if (!name.trim() || name.trim().length < 2) {
      setErrors({ general: "Full name must be at least 2 characters" }); return;
    }
    if (!email.includes("@")) {
      setErrors({ general: "Valid email is required" }); return;
    }
    if (password.length < 8) {
      setErrors({ general: "Password must be at least 8 characters" }); return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationName: orgName.trim(),
          subdomain,
          fullName: name.trim(),
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.error ?? "Something went wrong. Please try again." });
        return;
      }

      window.location.assign(data.checkoutUrl);
    } catch {
      toast({ title: "Network error", description: "Please check your connection and try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = "w-full h-11 px-3 text-[14px] border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all placeholder:text-gray-400";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F1F5F9" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-5 pb-2 max-w-2xl mx-auto w-full">
        {/* Logo */}
        <div style={{ background: "#fff", borderRadius: 12, padding: logoUrl ? "8px 14px" : "8px 12px", display: "flex", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          {logoUrl ? (
            <img src={logoUrl} alt="SentConnect" style={{ height: 30, maxHeight: 30, width: "auto", maxWidth: 160, objectFit: "contain" }} />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: BLUE }}>
                <Shuffle className="h-4 w-4 text-white" />
              </div>
              <span className="text-[15px] font-extrabold tracking-tight" style={{ color: "#111" }}>SentConnect</span>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center px-4 py-6 overflow-y-auto">
        <div className="w-full max-w-[520px]">
          {/* Back link */}
          <div className="text-center mb-5">
            <Link href="/" className="text-[13px] font-semibold" style={{ color: BLUE }}>← Back to sentconnect.org</Link>
          </div>

          {/* Page heading */}
          <h1 className="text-[2rem] font-extrabold text-gray-900 text-center mb-1 tracking-tight">Create your organization</h1>
          <p className="text-gray-500 text-[14px] text-center mb-6">You'll be the admin. Invite your team after setup.</p>

          {/* Pricing card */}
          <div
            className="rounded-2xl px-6 py-5 mb-6"
            style={{ background: "linear-gradient(135deg, #004EA8 0%, #0268CE 60%, #1A80E0 100%)" }}
          >
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1 text-white">Simple, transparent pricing</p>
            <p className="text-[32px] font-black leading-none mb-1 text-white">
              $30 <span className="text-[17px] font-semibold text-white">/ month per organization</span>
            </p>
            <p className="text-[13px] text-white font-medium mb-2">
              Unlimited users • Media sharing • Secure access
            </p>
            <p className="text-[12px] text-white">No contracts. Cancel anytime.</p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl px-6 py-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-3 py-2 rounded-lg mb-4">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Organization details section */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Organization details</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Organization name</label>
                    <input
                      value={orgName}
                      onChange={e => {
                        setOrgName(e.target.value);
                        if (!subdomain) setSubdomain(generateSubdomain(e.target.value));
                      }}
                      placeholder="Calvary Community Church"
                      required
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Subdomain</label>
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-11 focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-400 transition-all bg-white">
                      <input
                        value={subdomain}
                        onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="calvary"
                        required
                        className="flex-1 px-3 text-[14px] outline-none bg-transparent placeholder:text-gray-400"
                      />
                      <span className="px-3 text-[13px] text-gray-500 bg-gray-50 h-full flex items-center border-l border-gray-200 font-medium">
                        .sentconnect.org
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account section */}
              <div className="border-t border-gray-100 pt-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Your account</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Full name</label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Sarah Mitchell"
                      required
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.org"
                      required
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        required
                        className={inputCls + " pr-10"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 text-white font-bold rounded-xl text-[15px] flex items-center justify-center gap-2 transition-all mt-2"
                style={{ background: submitting ? "#7BB8EC" : BLUE }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = BLUE_DK; }}
                onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = BLUE; }}
              >
                {submitting
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Redirecting to payment…</>
                  : "Create your organization →"}
              </button>

              {/* Security note */}
              <p className="text-center text-[12px] text-gray-400 flex items-center justify-center gap-1.5 mt-1">
                <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                You'll be redirected to Stripe to complete your payment securely.
              </p>
            </form>
          </div>

          {/* Trust badges */}
          <div className="flex items-start justify-center gap-6 mt-6 mb-8">
            {[
              { icon: <ShieldCheck className="h-5 w-5" style={{ color: BLUE }} />, bg: "#EFF6FF", title: "Secure payments", sub: "Powered by Stripe" },
              { icon: <RefreshCw className="h-5 w-5" style={{ color: "#16A34A" }} />, bg: "#F0FDF4", title: "Cancel anytime", sub: "No contracts" },
              { icon: <Globe className="h-5 w-5" style={{ color: "#7C3AED" }} />, bg: "#F5F3FF", title: "Built for mission teams", sub: "Connect and share confidently" },
            ].map(({ icon, bg, title, sub }) => (
              <div key={title} className="flex items-start gap-2.5 flex-1 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5" style={{ background: bg }}>
                  {icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold text-gray-800 leading-tight">{title}</p>
                  <p className="text-[11.5px] text-gray-400 leading-tight mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
