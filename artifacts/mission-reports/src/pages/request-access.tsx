import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Loader2, CheckCircle2, Send, Mail, X, ArrowRight } from "lucide-react";
import { useLogo } from "@/providers/logo-provider";
import { buildOrgLoginHref } from "@/lib/org";

const BLUE = "#1085FD";

function SignInModal({ onClose }: { onClose: () => void }) {
  const [subdomain, setSubdomain] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const cleaned = subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!cleaned || cleaned.length < 2) {
      setError("Please enter your church's subdomain.");
      return;
    }
    setChecking(true);
    try {
      const res = await fetch(`/api/orgs/resolve?subdomain=${encodeURIComponent(cleaned)}`);
      if (!res.ok) {
        setError("We couldn't find a church with that subdomain. Double-check the spelling or contact your administrator.");
        return;
      }
      window.location.href = buildOrgLoginHref(cleaned);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 100 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-modal-title"
        style={{ background: "#fff", borderRadius: 24, padding: "36px 32px", width: "100%", maxWidth: 440, boxShadow: "0 24px 64px rgba(15,23,42,0.25)", position: "relative" }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ position: "absolute", top: 16, right: 16, background: "#F1F5F9", border: "none", borderRadius: 999, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748B" }}
        >
          <X size={16} />
        </button>
        <h2 id="signin-modal-title" style={{ fontSize: 21, fontWeight: 800, color: "#0F172A", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          Sign in to your church
        </h2>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: "#64748B", margin: "0 0 24px" }}>
          Enter your church's subdomain to go to its sign-in page.
        </p>
        <form onSubmit={handleContinue}>
          <label htmlFor="signin-subdomain" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
            Church subdomain
          </label>
          <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #E2E8F0", borderRadius: 12, overflow: "hidden", background: "#fff", marginBottom: 6 }}>
            <input
              id="signin-subdomain"
              autoFocus
              value={subdomain}
              onChange={e => setSubdomain(e.target.value)}
              placeholder="yourchurch"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              style={{ flex: 1, minWidth: 0, height: 48, padding: "0 14px", border: "none", outline: "none", fontSize: 15, color: "#0F172A", fontFamily: "inherit" }}
            />
            <span style={{ padding: "0 14px", fontSize: 14, color: "#94A3B8", background: "#F8FAFC", alignSelf: "stretch", display: "flex", alignItems: "center", borderLeft: "1px solid #E2E8F0", whiteSpace: "nowrap" }}>
              .sentconnect.org
            </span>
          </div>
          <p style={{ fontSize: 12.5, color: "#94A3B8", margin: "0 0 18px" }}>
            e.g. if your church signs in at <strong style={{ color: "#64748B" }}>calvary.sentconnect.org</strong>, enter <strong style={{ color: "#64748B" }}>calvary</strong>
          </p>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13.5, color: "#B91C1C", lineHeight: 1.5 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={checking}
            style={{ width: "100%", height: 48, background: `linear-gradient(135deg, ${BLUE} 0%, #0560D4 100%)`, color: "#fff", fontWeight: 700, fontSize: 15, border: "none", borderRadius: 12, cursor: checking ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(16,133,253,0.35)", opacity: checking ? 0.7 : 1, fontFamily: "inherit" }}
          >
            {checking ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={16} />}
            {checking ? "Checking…" : "Continue to Sign In"}
          </button>
        </form>
        <p style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", margin: "18px 0 0" }}>
          Don't know your subdomain? <Link href="/login" style={{ color: BLUE, fontWeight: 600, textDecoration: "none" }}>Sign in here</Link>
        </p>
      </div>
    </div>
  );
}

export default function RequestAccess() {
  const { signupLogo } = useLogo();
  const [showSignIn, setShowSignIn] = useState(false);
  const [churchName, setChurchName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/signup-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ churchName, contactName, email, phone, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 48,
    padding: "0 16px",
    borderRadius: 12,
    border: "1.5px solid #E2E8F0",
    fontSize: 15,
    color: "#0F172A",
    outline: "none",
    background: "#fff",
    fontFamily: "inherit",
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#334155",
    marginBottom: 6,
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #F0F7FF 0%, #FAFCFF 100%)", fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ background: BLUE }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", height: 76, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img src={signupLogo} alt="SentConnect" style={{ height: 64, width: "auto", maxWidth: 220, display: "block" }} />
          </a>
          <button
            type="button"
            onClick={() => setShowSignIn(true)}
            style={{ fontSize: 14, fontWeight: 600, color: "#fff", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 999, padding: "9px 22px", cursor: "pointer", fontFamily: "inherit" }}
          >
            Sign in
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: 560 }}>
          {submitted ? (
            <div style={{ background: "#fff", borderRadius: 28, padding: "56px 44px", textAlign: "center", boxShadow: "0 12px 48px rgba(15,23,42,0.11), 0 2px 8px rgba(15,23,42,0.06)", border: "1px solid #E4EEFF" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <CheckCircle2 size={38} color="#10B981" />
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", margin: "0 0 12px", letterSpacing: "-0.02em" }}>Request received!</h1>
              <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "#64748B", margin: "0 0 28px" }}>
                Thank you for your interest in SentConnect. We'll review your request and reach out to <strong style={{ color: "#0F172A" }}>{email}</strong> to get your church set up.
              </p>
              <a href="/" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: 48, padding: "0 32px", borderRadius: 999, background: `linear-gradient(135deg, ${BLUE} 0%, #0059D6 100%)`, color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 20px rgba(16,133,253,0.38)" }}>
                Back to Home
              </a>
            </div>
          ) : (
            <div style={{ background: "#fff", borderRadius: 28, padding: "44px", boxShadow: "0 12px 48px rgba(15,23,42,0.11), 0 2px 8px rgba(15,23,42,0.06)", border: "1px solid #E4EEFF" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#EFF6FF", borderRadius: 999, padding: "6px 14px", marginBottom: 20 }}>
                <Mail size={13} color={BLUE} />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: BLUE, letterSpacing: "0.08em", textTransform: "uppercase" }}>Request Access</span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", margin: "0 0 10px", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
                Get SentConnect for your church
              </h1>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: "#64748B", margin: "0 0 32px" }}>
                We're currently inviting churches and missionaries to use SentConnect at no cost while we continue improving the platform. Tell us about your church or mission organization and we'll reach out to get you set up.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle} htmlFor="ra-church">Church / organization name *</label>
                  <input id="ra-church" style={inputStyle} value={churchName} onChange={e => setChurchName(e.target.value)} required minLength={2} placeholder="e.g. Calvary Chapel" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
                  <div>
                    <label style={labelStyle} htmlFor="ra-name">Your name *</label>
                    <input id="ra-name" style={inputStyle} value={contactName} onChange={e => setContactName(e.target.value)} required minLength={2} placeholder="Full name" />
                  </div>
                  <div>
                    <label style={labelStyle} htmlFor="ra-phone">Phone (optional)</label>
                    <input id="ra-phone" style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle} htmlFor="ra-email">Email *</label>
                  <input id="ra-email" type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@church.org" />
                </div>
                <div style={{ marginBottom: 26 }}>
                  <label style={labelStyle} htmlFor="ra-message">Tell us about your missionaries (optional)</label>
                  <textarea
                    id="ra-message"
                    style={{ ...inputStyle, height: 110, padding: "12px 16px", resize: "vertical", lineHeight: 1.6 }}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    maxLength={2000}
                    placeholder="How many missionaries do you support? Where do they serve?"
                  />
                </div>

                {error && (
                  <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", marginBottom: 18, fontSize: 14, color: "#B91C1C" }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{ width: "100%", height: 52, background: `linear-gradient(135deg, ${BLUE} 0%, #0560D4 100%)`, color: "#fff", fontWeight: 700, fontSize: 15, border: "none", borderRadius: 12, cursor: submitting ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 20px rgba(16,133,253,0.42)", opacity: submitting ? 0.7 : 1, fontFamily: "inherit" }}
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
                  {submitting ? "Sending…" : "Send Request"}
                </button>
              </form>

              <p style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", margin: "22px 0 0", lineHeight: 1.6 }}>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setShowSignIn(true)}
                  style={{ color: BLUE, fontWeight: 600, background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>
      </main>

      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
    </div>
  );
}
