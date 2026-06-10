import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Eye, EyeOff, ShieldCheck, RefreshCw, Globe, Lock,
  CheckCircle2, Users,
} from "lucide-react";
import { useLogo } from "@/providers/logo-provider";
import { extractHostnameOrgSlug, getOrgRoutingContext } from "@/lib/org";

const BLUE      = "#1085FD";
const BLUE_DEEP = "#0059D6";
const BLUE_DARK = "#003FA8";

const FEATURES = [
  "Unlimited users",
  "Media & prayer sharing",
  "Secure communication",
  "Cancel anytime",
];

export default function Signup() {
  const { isLoading } = useAuth();
  const { signupLogo, isCustomSignupLogo } = useLogo();
  const { toast } = useToast();
  const [orgName, setOrgName]           = useState("");
  const [subdomain, setSubdomain]       = useState("");
  const [name, setName]                 = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState("");
  const [subdomainError, setSubdomainError] = useState("");
  const [emailError, setEmailError]       = useState("");

  useEffect(() => {
    const hostname = window.location.hostname;
    const orgSlug = extractHostnameOrgSlug(hostname);

    if (orgSlug) {
      const rootDomain = hostname.slice(orgSlug.length + 1);
      window.location.replace(`${window.location.protocol}//www.${rootDomain}/signup`);
      return;
    }

    const { orgSlug: pathSlug, usesPathPrefix } = getOrgRoutingContext(window.location.pathname);
    if (usesPathPrefix && pathSlug) {
      window.location.replace("/signup");
    }
  }, []);

  if (isLoading) return null;

  function generateSubdomain(org: string) {
    return org.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
  }

  async function checkSubdomainAvailability(value: string) {
    if (!value || !/^[a-z0-9-]{2,30}$/.test(value)) return;
    try {
      const res = await fetch(`/api/billing/check-availability?subdomain=${encodeURIComponent(value)}`);
      const data = await res.json();
      if (data.subdomainTaken) setSubdomainError("That subdomain is already taken — choose a different one.");
      else setSubdomainError("");
    } catch { /* silent */ }
  }

  async function checkEmailAvailability(value: string) {
    if (!value || !value.includes("@")) return;
    try {
      const res = await fetch(`/api/billing/check-availability?email=${encodeURIComponent(value)}`);
      const data = await res.json();
      if (data.emailTaken) setEmailError("An account with that email already exists — try logging in instead.");
      else setEmailError("");
    } catch { /* silent */ }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!orgName.trim() || orgName.trim().length < 2) { setError("Organization name must be at least 2 characters"); return; }
    if (!subdomain || !/^[a-z0-9-]{2,30}$/.test(subdomain)) { setError("Subdomain: 2–30 lowercase letters, numbers, or hyphens"); return; }
    if (subdomainError || emailError) return;
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
    <div className="su-page">
      <style>{`
        .su-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(160deg, #EEF4FF 0%, #F4F8FF 40%, #F8FAFC 100%);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        /* ── Nav ── */
        .su-nav {
          width: 100%;
          padding: 18px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          background: linear-gradient(90deg, #1085FD 0%, #0970E8 55%, #0560D4 100%);
          box-shadow: 0 2px 20px rgba(0,89,214,0.40);
        }
        .su-back-link {
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.75);
          text-decoration: none;
          transition: color .2s;
          white-space: nowrap;
        }
        .su-back-link:hover { color: #fff; }

        /* ── Main area ── */
        .su-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px 24px 32px;
        }
        .su-card-row {
          display: flex;
          align-items: stretch;
          gap: 24px;
          max-width: 990px;
          width: 100%;
        }

        /* ── Left plan card ── */
        .su-plan {
          width: 288px;
          flex-shrink: 0;
          background: #fff;
          border-radius: 28px;
          padding: 34px;
          box-shadow: 0 12px 40px rgba(15,23,42,0.09), 0 2px 8px rgba(15,23,42,0.05);
          border: 1px solid #E4EEFF;
          border-top: 3px solid #1085FD;
          display: flex;
          flex-direction: column;
        }

        /* ── Right form panel ── */
        .su-form-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 40px;
          border-radius: 28px;
          background: #ffffff;
          box-shadow: 0 12px 48px rgba(15,23,42,0.11), 0 2px 8px rgba(15,23,42,0.06);
          border: 1px solid #E4EEFF;
          position: relative;
          overflow: hidden;
        }

        /* ── Submit button ── */
        .su-submit-btn {
          width: 100%;
          height: 52px;
          background: linear-gradient(135deg, #1085FD 0%, #0560D4 100%);
          color: #ffffff;
          font-weight: 700;
          font-size: 15px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.01em;
          box-shadow: 0 4px 20px rgba(16,133,253,0.42), 0 1px 4px rgba(16,133,253,0.2);
          transition: background .2s, transform .15s, box-shadow .2s;
        }
        .su-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #0C78F0 0%, #0452C2 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(16,133,253,0.48), 0 2px 8px rgba(16,133,253,0.22);
        }
        .su-submit-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 4px 16px rgba(16,133,253,0.38);
        }
        .su-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ── Email + Password row ── */
        .su-field-row {
          display: flex;
          gap: 14px;
        }
        .su-field-row > * { flex: 1; min-width: 0; }

        /* ── Bottom stripe note ── */
        .su-stripe-note {
          text-align: center;
          padding-bottom: 28px;
          font-size: 12px;
          color: #94A3B8;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        /* ── Inline plan summary (shown when sidebar is hidden) ── */
        .su-plan-inline { display: none; }

        /* ── Input base + focus ── */
        .su-input {
          border: 1.5px solid #E2E8F0 !important;
          transition: border-color .18s, box-shadow .18s;
        }
        .su-input:focus {
          outline: none !important;
          border-color: #1085FD !important;
          box-shadow: 0 0 0 3.5px rgba(16,133,253,0.13), 0 1px 3px rgba(16,133,253,0.08);
        }

        /* ── Trust chips row (below submit button) ── */
        .su-trust-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 14px;
          flex-wrap: wrap;
          row-gap: 6px;
        }
        .su-trust-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          color: #64748B;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 999px;
          padding: 4px 10px;
          letter-spacing: 0.01em;
        }

        /* ── TABLET (≤ 900px): hide sidebar, show inline summary ── */
        @media (max-width: 900px) {
          .su-plan        { display: none; }
          .su-plan-inline { display: flex; }
          .su-nav         { padding: 16px 24px; }
        }

        /* ── MOBILE (≤ 640px): single-column, full-width form ── */
        @media (max-width: 640px) {
          .su-nav { padding: 14px 16px; }
          .su-main { padding: 8px 12px 20px; }
          .su-card-row { gap: 0; }
          .su-form-panel {
            padding: 28px 20px 32px;
            border-radius: 22px;
          }
          .su-field-row { flex-direction: column; gap: 12px; }
          .su-stripe-note { padding-bottom: 20px; }
        }

        /* ── Very small (≤ 380px) ── */
        @media (max-width: 380px) {
          .su-form-panel { padding: 22px 16px 28px; border-radius: 18px; }
          .su-nav { padding: 12px 14px; }
        }

        /* ── Subdomain suffix ── */
        .su-subdomain-suffix {
          padding: 0 13px;
          font-size: 12.5px;
          font-weight: 500;
          color: #4B73A8;
          background: #DBEAFE;
          height: 100%;
          display: flex;
          align-items: center;
          border-left: 1px solid #BFDBFE;
          white-space: nowrap;
          flex-shrink: 0;
        }
        @media (max-width: 480px) {
          .su-subdomain-suffix {
            font-size: 11px;
            padding: 0 8px;
            letter-spacing: -0.02em;
          }
        }
      `}</style>

      {/* Nav */}
      <div className="su-nav">
        <img src={signupLogo} alt="SentConnect" style={{ maxHeight: 40, width: "auto", maxWidth: 200, display: "block", filter: isCustomSignupLogo ? undefined : "brightness(0) invert(1)" }} />
        <Link href="/" className="su-back-link">← Back to sentconnect.org</Link>
      </div>

      {/* Main */}
      <div className="su-main">
        <div className="su-card-row">

          {/* LEFT — Plan card (hidden on mobile/tablet) */}
          <div className="su-plan">
            {/* Icon + popular badge row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_DEEP} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(16,133,253,0.3)" }}>
                <Users style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: BLUE, background: "#EEF6FF", border: "1px solid #BFDBFE", borderRadius: 999, padding: "3px 10px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Most Popular
              </span>
            </div>

            <p style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 4, letterSpacing: "0.02em", textTransform: "uppercase" }}>Organization Plan</p>

            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 2 }}>
              <span style={{ fontSize: "2.6rem", fontWeight: 900, lineHeight: 1, color: BLUE, letterSpacing: "-0.03em" }}>$30</span>
              <span style={{ fontSize: 14, color: "#9CA3AF", fontWeight: 500 }}>/mo</span>
            </div>

            <p style={{ fontSize: 12, color: "#94A3B8", margin: "0 0 20px" }}>Billed monthly · cancel anytime</p>

            <div style={{ height: 1, background: "linear-gradient(90deg, #EBF3FF, transparent)", marginBottom: 20 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {FEATURES.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_DEEP} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(16,133,253,0.25)" }}>
                    <CheckCircle2 style={{ width: 13, height: 13, color: "#fff" }} />
                  </div>
                  <span style={{ fontSize: 13.5, color: "#1F2937", fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>

          </div>

          {/* RIGHT — Form panel */}
          <div className="su-form-panel">

            {/* Heading */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <h1 style={{ fontSize: "clamp(1.4rem, 4vw, 1.85rem)", fontWeight: 800, color: "#0B1628", letterSpacing: "-0.04em", lineHeight: 1.18, marginBottom: 8 }}>
                Set Up Your Organization
              </h1>
              <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 400, lineHeight: 1.5 }}>
                You'll be the admin. Invite your team after setup.
              </p>
            </div>

            {/* Inline plan summary — visible only when sidebar is hidden (≤ 900px) */}
            <div
              className="su-plan-inline"
              style={{
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                marginBottom: 20,
                background: "#F0F7FF",
                borderRadius: 14,
                padding: "12px 20px",
                flexWrap: "wrap",
                rowGap: 8,
                border: "1px solid #BFDBFE",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: "1.65rem", fontWeight: 900, color: BLUE, lineHeight: 1 }}>$30</span>
                <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>/month</span>
              </div>
              <div style={{ width: 1, height: 28, background: "#CBD5E1", flexShrink: 0 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>Organization Plan</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
                  {FEATURES.map(f => (
                    <span key={f} style={{ fontSize: 11.5, color: "#475569", display: "flex", alignItems: "center", gap: 4 }}>
                      <CheckCircle2 style={{ width: 11, height: 11, flexShrink: 0, color: BLUE }} />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 20, flexWrap: "wrap", rowGap: 6 }}>
              {[
                { icon: <ShieldCheck style={{ width: 12, height: 12 }} />, label: "Secure by Stripe" },
                { icon: <RefreshCw style={{ width: 12, height: 12 }} />, label: "Cancel anytime" },
                { icon: <Globe style={{ width: 12, height: 12 }} />, label: "Built for mission teams" },
              ].map(({ icon, label }) => (
                <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: "#475569", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 999, padding: "4px 10px" }}>
                  {icon}
                  {label}
                </span>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "#EEF2F8", marginBottom: 22 }} />

            {/* Error */}
            {error && (
              <div style={{ background: "#FEF2F2", color: "#DC2626", fontSize: 13, padding: "10px 16px", borderRadius: 12, marginBottom: 16, border: "1px solid #FECACA" }}>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>

              {/* Org details section */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "#94A3B8", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "inline-block", width: 14, height: 2, borderRadius: 2, background: "#1085FD" }} />
                  Organization Details
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Field label="Organization Name">
                    <input
                      className="su-input"
                      value={orgName}
                      onChange={e => { setOrgName(e.target.value); if (!subdomain) setSubdomain(generateSubdomain(e.target.value)); }}
                      placeholder="e.g. Calvary Community Church"
                      required
                      style={{ width: "100%", height: 48, padding: "0 16px", fontSize: 14, background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, color: "#111827", outline: "none", boxSizing: "border-box" }}
                    />
                  </Field>
                  <Field label="Subdomain">
                    <div style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: 12, overflow: "hidden", height: 48, border: subdomainError ? "1.5px solid #F87171" : "1.5px solid #E2E8F0" }}>
                      <input
                        className="su-input"
                        value={subdomain}
                        onChange={e => { setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); setSubdomainError(""); }}
                        onBlur={e => checkSubdomainAvailability(e.target.value)}
                        placeholder="e.g. calvary"
                        required
                        style={{ flex: 1, height: "100%", padding: "0 14px", fontSize: 14, background: "transparent", border: "none", borderRadius: 0, color: "#111827", outline: "none", minWidth: 0, boxShadow: "none" }}
                      />
                      <span className="su-subdomain-suffix">
                        .sentconnect.org
                      </span>
                    </div>
                    {subdomainError && (
                      <p style={{ margin: "5px 0 0", fontSize: 12, color: "#DC2626", fontWeight: 500 }}>{subdomainError}</p>
                    )}
                  </Field>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "#EEF2F8" }} />

              {/* Account section */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "#94A3B8", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "inline-block", width: 14, height: 2, borderRadius: 2, background: "#1085FD" }} />
                  Your Account
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Field label="Full Name">
                    <input
                      className="su-input"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Sarah Mitchell"
                      required
                      style={{ width: "100%", height: 48, padding: "0 16px", fontSize: 14, background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, color: "#111827", outline: "none", boxSizing: "border-box" }}
                    />
                  </Field>
                  <div className="su-field-row">
                    <Field label="Email">
                      <input
                        className="su-input"
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setEmailError(""); }}
                        onBlur={e => checkEmailAvailability(e.target.value)}
                        placeholder="you@example.org"
                        required
                        style={{ width: "100%", height: 48, padding: "0 16px", fontSize: 14, background: "#fff", border: emailError ? "1.5px solid #F87171" : "1.5px solid #E2E8F0", borderRadius: 12, color: "#111827", outline: "none", boxSizing: "border-box" }}
                      />
                      {emailError && (
                        <p style={{ margin: "5px 0 0", fontSize: 12, color: "#DC2626", fontWeight: 500 }}>{emailError}</p>
                      )}
                    </Field>
                    <Field label="Password">
                      <div style={{ position: "relative" }}>
                        <input
                          className="su-input"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Min. 8 characters"
                          required
                          style={{ width: "100%", height: 48, padding: "0 44px 0 16px", fontSize: 14, background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, color: "#111827", outline: "none", boxSizing: "border-box" }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex", alignItems: "center", padding: 0 }}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                        </button>
                      </div>
                    </Field>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="su-submit-btn"
                >
                  {submitting
                    ? <><Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> Redirecting to payment…</>
                    : "Set Up Your Organization →"
                  }
                </button>
                <div className="su-trust-row">
                  <span className="su-trust-chip"><ShieldCheck style={{ width: 11, height: 11, color: "#1085FD" }} />Secure by Stripe</span>
                  <span className="su-trust-chip"><Lock style={{ width: 11, height: 11, color: "#1085FD" }} />Data Encrypted</span>
                  <span className="su-trust-chip"><RefreshCw style={{ width: 11, height: 11, color: "#1085FD" }} />Cancel Anytime</span>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* Bottom stripe note */}
      <div className="su-stripe-note">
        <Lock style={{ width: 12, height: 12 }} />
        Secure checkout powered by <span style={{ fontWeight: 600, color: BLUE }}>Stripe</span>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, letterSpacing: "0.005em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
