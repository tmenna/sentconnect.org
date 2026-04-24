import { useState } from "react";
import { Link, Redirect } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Shuffle, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePlatformLogo } from "@/hooks/use-platform-logo";

const BLUE    = "#005BBC";
const BLUE_DK = "#0155a5";
const BLUE_LT = "#EFF6FF";
const BLUE_BD = "#BFDBFE";

export default function Signup() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const logoUrl = usePlatformLogo();

  const [orgName, setOrgName]       = useState("");
  const [subdomain, setSubdomain]   = useState("");
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
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

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      {/* Left panel */}
      <div
        className="hidden md:flex flex-col justify-between w-[420px] flex-shrink-0 relative overflow-hidden px-10 py-12 text-white"
        style={{ background: "linear-gradient(150deg, #004EA8 0%, #0066CC 55%, #1A80E0 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 25% 15%, rgba(255,255,255,0.15) 0%, transparent 55%)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-6">
            {logoUrl ? (
              <div style={{ background: "#fff", borderRadius: 12, padding: "8px 16px", display: "flex", alignItems: "center" }}>
                <img src={logoUrl} alt="SentConnect" style={{ height: 32, maxHeight: 32, width: "auto", maxWidth: 160, objectFit: "contain" }} />
              </div>
            ) : (
              <>
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shuffle className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-extrabold tracking-tight">SentConnect</span>
              </>
            )}
          </div>

          <p className="text-white/50 text-[11px] font-medium tracking-widest uppercase mb-8">
            www.sentconnect.org
          </p>

          <h2 className="text-[2.1rem] font-extrabold leading-[1.2] mb-5 tracking-tight text-white">
            Connect with your<br />Global Partners<br />
            from{" "}
            <span className="text-white font-black">anywhere.</span>
          </h2>

          <p className="text-white/70 text-[15px] leading-relaxed max-w-[340px]">
            Create your organization's private space and receive updates from your Global Partners across different locations.
          </p>

          {/* Trust bullets */}
          <div className="mt-8 space-y-2.5">
            {["Unlimited users & media sharing", "Secure, private access", "Cancel anytime — no contracts"].map(item => (
              <div key={item} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-white/70" />
                <span className="text-white/80 text-[14px]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 mt-6 text-white/30 text-xs">© SentConnect</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-start md:items-center justify-center px-6 py-10 overflow-y-auto min-h-screen">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              {logoUrl ? (
                <img src={logoUrl} alt="SentConnect" style={{ height: 28, maxHeight: 28, width: "auto", maxWidth: 140, objectFit: "contain" }} />
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: BLUE }}>
                    <Shuffle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-base font-extrabold" style={{ color: "#1F2937" }}>SentConnect</span>
                </>
              )}
            </div>
            <Link href="/" className="text-[13px] font-semibold" style={{ color: BLUE }}>← Home</Link>
          </div>

          <div className="hidden md:block mb-6">
            <Link href="/" className="text-[13px] font-semibold" style={{ color: BLUE }}>← Back to sentconnect.org</Link>
          </div>

          <h1 className="text-2xl font-extrabold text-foreground mb-1">Create your organization</h1>
          <p className="text-muted-foreground text-sm mb-5">You'll be the admin. Invite your team after setup.</p>

          {/* Pricing card */}
          <div
            className="rounded-xl px-5 py-4 mb-6"
            style={{ background: BLUE_LT, border: `1.5px solid ${BLUE_BD}` }}
          >
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: BLUE }}>Simple, transparent pricing</p>
            <p className="text-[28px] font-black leading-none mb-1" style={{ color: BLUE }}>
              $30<span className="text-[16px] font-semibold text-blue-400"> / month per organization</span>
            </p>
            <p className="text-[12.5px] text-blue-500 font-medium mb-2">
              Unlimited users · Media sharing · Secure access
            </p>
            <p className="text-[11.5px]" style={{ color: "#6B7280" }}>No contracts. Cancel anytime.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-3 py-2 rounded-lg">
                {errors.general}
              </div>
            )}

            <div>
              <label className="block text-[13px] font-semibold text-foreground mb-1">Organization name</label>
              <Input
                value={orgName}
                onChange={e => {
                  setOrgName(e.target.value);
                  if (!subdomain) setSubdomain(generateSubdomain(e.target.value));
                }}
                placeholder="Calvary Community Church"
                required
                className="h-10"
                style={{ "--tw-ring-color": BLUE_BD } as any}
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-foreground mb-1">Subdomain</label>
              <div
                className="flex items-center border border-input rounded-lg overflow-hidden h-10 focus-within:ring-2"
                style={{ "--tw-ring-color": BLUE_BD } as any}
              >
                <input
                  value={subdomain}
                  onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="calvary"
                  required
                  className="flex-1 px-3 text-[13px] outline-none bg-transparent"
                />
                <span className="px-3 text-[12px] text-muted-foreground bg-muted h-full flex items-center border-l border-input">
                  .sentconnect.org
                </span>
              </div>
            </div>

            <div className="border-t border-border/40 pt-4">
              <p className="text-[12px] text-muted-foreground font-semibold uppercase tracking-wide mb-3">Your account</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-[13px] font-semibold text-foreground mb-1">Full name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Sarah Mitchell" required className="h-10" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-foreground mb-1">Email</label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.org" required className="h-10" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-foreground mb-1">Password</label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required className="h-10" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 text-white font-bold rounded-xl text-[15px] flex items-center justify-center gap-2 transition-all"
              style={{ background: submitting ? "#93C5FD" : BLUE }}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = BLUE_DK; }}
              onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = BLUE; }}
            >
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin" />Redirecting to payment…</>
                : "Create your organization →"}
            </button>

            <p className="text-center text-[11.5px] text-muted-foreground">
              You'll be redirected to Stripe to complete your payment securely.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
