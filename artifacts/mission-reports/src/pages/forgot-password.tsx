import { useState } from "react";
import { Link } from "wouter";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useOrg } from "@/providers/org-provider";
import logoWhite from "@/assets/logo-white.png";

const BG    = "linear-gradient(150deg, #3D0066 0%, #111827 55%, #374151 100%)";
const BLUE  = "#111827";
const BLUE_DK = "#000000";

export default function ForgotPassword() {
  const { orgSlug, prefix } = useOrg();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [hoverBtn, setHoverBtn] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (orgSlug) headers["X-Org-Subdomain"] = orgSlug;
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers,
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }
      setDone(true);
      if (data.devResetLink) setDevLink(data.devResetLink);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: BG }}
    >
      <div className="flex items-center gap-2.5 mb-8">
        <img src={logoWhite} alt="SentConnect" style={{ height: 28, display: "block" }} />
      </div>

      <div
        className="w-full max-w-[420px] bg-white rounded-2xl px-8 py-8"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
      >
        {done ? (
          <div className="text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#F5F5F5", border: "2px solid #D1D5DB" }}
            >
              <CheckCircle2 className="h-7 w-7" style={{ color: BLUE }} />
            </div>
            <h2 className="text-[18px] font-bold text-gray-900 mb-2">Check your email</h2>
            <p className="text-[14px] text-gray-500 mb-5">
              If an account exists for <strong>{email}</strong>, a reset link has been sent.
            </p>
            {devLink && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-left mb-5">
                <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">Dev mode — reset link</p>
                <Link href={devLink} className="text-[12px] text-gray-800 break-all hover:underline">{window.location.origin}{devLink}</Link>
              </div>
            )}
            <Link href={prefix("/login")} className="text-[13px] font-semibold hover:underline" style={{ color: BLUE }}>
              ← Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-[22px] font-bold text-gray-900 mb-1">Reset your password</h2>
            <p className="text-[14px] text-gray-500 mb-6">
              Enter your email and we'll send you a reset link.
            </p>

            {error && (
              <div className="bg-gray-50 border border-gray-200 text-gray-700 text-[13px] px-3 py-2 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.org"
                  required
                  className="w-full h-11 px-4 text-[14px] rounded-xl border outline-none transition-all"
                  style={{ borderColor: "#E5E7EB" }}
                  onFocus={e => { e.target.style.borderColor = BLUE; e.target.style.boxShadow = `0 0 0 3px rgba(135,5,250,0.1)`; }}
                  onBlur={e => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 text-white font-bold rounded-xl text-[15px] flex items-center justify-center gap-2 transition-all"
                style={{ background: hoverBtn ? BLUE_DK : BLUE, opacity: submitting ? 0.7 : 1 }}
                onMouseEnter={() => setHoverBtn(true)}
                onMouseLeave={() => setHoverBtn(false)}
              >
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Sending…</> : "Send reset link"}
              </button>
            </form>

            <div className="mt-5 text-center">
              <Link href={prefix("/login")} className="text-[13px] font-medium hover:underline" style={{ color: "#6B7280" }}>
                ← Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>

      <p className="mt-8 text-white/40 text-[12px]">"Declare his glory among the nations." — Ps 96:3</p>
    </div>
  );
}
