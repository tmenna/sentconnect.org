import { useState } from "react";
import { Link } from "wouter";
import { Loader2, CheckCircle2, Send, Mail } from "lucide-react";
import { useLogo } from "@/providers/logo-provider";

const BLUE = "#1085FD";

export default function RequestAccess() {
  const { signupLogo } = useLogo();
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
            <img src={signupLogo} alt="SentConnect" style={{ height: 56, width: "auto", maxWidth: 200, display: "block" }} />
          </a>
          <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 999, padding: "9px 22px" }}>
            Sign in
          </Link>
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
                SentConnect is currently available by invitation. Tell us about your church or mission organization and we'll reach out to get you set up.
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
                Already have an account? <Link href="/login" style={{ color: BLUE, fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
