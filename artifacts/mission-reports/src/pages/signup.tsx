import { useState } from "react";
import { Link, Redirect } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Shuffle, Loader2, Eye, EyeOff, ShieldCheck, RefreshCw, Globe, Lock } from "lucide-react";
import { usePlatformLogo } from "@/hooks/use-platform-logo";

const BLUE    = "#0268CE";
const BLUE_DK = "#0055B3";

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

  const inputCls =
    "w-full px-4 text-[14px] border border-gray-200 rounded-xl bg-white outline-none " +
    "focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all placeholder:text-gray-400 " +
    "text-gray-900";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFBFD" }}>

      {/* Nav bar */}
      <div className="w-full flex items-center justify-between px-6 pt-5 pb-2">
        {/* Logo */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: logoUrl ? "6px 14px" : "6px 10px",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
          }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="SentConnect"
              style={{ height: 28, maxHeight: 28, width: "auto", maxWidth: 160, objectFit: "contain" }}
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: BLUE }}>
                <Shuffle className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-[13px] font-extrabold tracking-tight text-gray-900">SentConnect</span>
            </div>
          )}
        </div>

        {/* Back link */}
        <Link href="/" className="text-[13px] font-medium text-gray-400 hover:text-gray-600 transition-colors">
          ← Back to sentconnect.org
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center px-4 py-8 overflow-y-auto">
        <div className="w-full max-w-[580px]">

          {/* Page heading */}
          <div className="text-center mb-8">
            <h1 className="text-[2rem] font-bold text-gray-900 tracking-tight mb-2">
              Set Up Your Organization
            </h1>
            <p className="text-[15px] text-gray-400 font-normal">
              You'll be the admin. Invite your team after setup.
            </p>
          </div>

          {/* Pricing card */}
          <div
            className="rounded-2xl px-7 py-6 mb-5"
            style={{
              background: "linear-gradient(135deg, #0047A8 0%, #0268CE 55%, #2B8DE8 100%)",
              boxShadow: "0 8px 32px rgba(2,104,206,0.22)",
            }}
          >
            <p className="text-[10.5px] font-bold uppercase tracking-widest text-blue-200 mb-3">
              Simple, transparent pricing
            </p>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-[3rem] font-black text-white leading-none">$30</span>
              <span className="text-[16px] font-medium text-blue-100">/ month per organization</span>
            </div>
            <p className="text-[13px] text-blue-100 mb-1">
              Unlimited users · Media sharing · Secure access
            </p>
            <p className="text-[12px] text-blue-200 font-medium">No contracts. Cancel anytime.</p>
          </div>

          {/* Form card */}
          <div
            className="bg-white rounded-2xl px-7 py-7 mb-5"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
          >
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded-xl mb-5">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Organization details */}
              <div className="mb-6">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                  Organization Details
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Organization name
                    </label>
                    <input
                      value={orgName}
                      onChange={e => {
                        setOrgName(e.target.value);
                        if (!subdomain) setSubdomain(generateSubdomain(e.target.value));
                      }}
                      placeholder="Calvary Community Church"
                      required
                      className={inputCls}
                      style={{ height: 50 }}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Subdomain
                    </label>
                    <div
                      className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white transition-all focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400"
                      style={{ height: 50 }}
                    >
                      <input
                        value={subdomain}
                        onChange={e =>
                          setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                        }
                        placeholder="calvary"
                        required
                        className="flex-1 px-4 text-[14px] outline-none bg-transparent placeholder:text-gray-400 text-gray-900"
                      />
                      <span className="px-4 text-[13px] text-gray-400 bg-gray-50 h-full flex items-center border-l border-gray-200 font-medium whitespace-nowrap">
                        .sentconnect.org
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Your account */}
              <div className="border-t border-gray-100 pt-6 mb-6">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                  Your Account
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Full name</label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Sarah Mitchell"
                      required
                      className={inputCls}
                      style={{ height: 50 }}
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
                      style={{ height: 50 }}
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
                        className={inputCls + " pr-12"}
                        style={{ height: 50 }}
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
                  </div>
                </div>
              </div>

              {/* CTA button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full text-white font-semibold rounded-xl text-[15px] flex items-center justify-center gap-2 transition-all"
                style={{
                  height: 52,
                  background: submitting
                    ? "#7BB8EC"
                    : `linear-gradient(135deg, ${BLUE_DK} 0%, ${BLUE} 100%)`,
                  boxShadow: submitting ? "none" : "0 4px 16px rgba(2,104,206,0.25)",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={e => {
                  if (!submitting) {
                    e.currentTarget.style.background = `linear-gradient(135deg, #00449A 0%, ${BLUE_DK} 100%)`;
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(2,104,206,0.35)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={e => {
                  if (!submitting) {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${BLUE_DK} 0%, ${BLUE} 100%)`;
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(2,104,206,0.25)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting to payment…</>
                ) : (
                  "Set Up Your Organization →"
                )}
              </button>

              {/* Stripe note */}
              <p className="text-center text-[12px] text-gray-400 flex items-center justify-center gap-1.5 mt-3">
                <Lock className="h-3 w-3 flex-shrink-0" />
                You'll be redirected to Stripe to complete your payment securely.
              </p>
            </form>
          </div>

          {/* Trust badges */}
          <div className="flex items-start justify-center gap-6 px-2 mb-6">
            {[
              {
                icon: <ShieldCheck className="h-4 w-4" style={{ color: BLUE }} />,
                bg: "#EFF6FF",
                title: "Secure payments",
                sub: "Powered by Stripe",
              },
              {
                icon: <RefreshCw className="h-4 w-4" style={{ color: "#16A34A" }} />,
                bg: "#F0FDF4",
                title: "Cancel anytime",
                sub: "No contracts",
              },
              {
                icon: <Globe className="h-4 w-4" style={{ color: "#7C3AED" }} />,
                bg: "#F5F3FF",
                title: "Built for mission teams",
                sub: "Connect and share confidently",
              },
            ].map(({ icon, bg, title, sub }) => (
              <div key={title} className="flex items-start gap-2.5 flex-1 min-w-0">
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
                  style={{ background: bg }}
                >
                  {icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-gray-800 leading-tight">{title}</p>
                  <p className="text-[11px] text-gray-400 leading-snug mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
