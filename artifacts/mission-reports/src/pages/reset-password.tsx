import { useState } from "react";
import { Link, useSearch } from "wouter";
import { Shuffle, Loader2, CheckCircle2 } from "lucide-react";

const BG    = "linear-gradient(150deg, #004EA8 0%, #0066CC 55%, #1A80E0 100%)";
const BLUE  = "#0268CE";
const BLUE_DK = "#0155a5";

export default function ResetPassword() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [hoverBtn, setHoverBtn] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Reset failed"); return; }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full h-11 px-4 text-[14px] rounded-xl border outline-none transition-all";
  const inputStyle = { borderColor: "#E5E7EB" };
  function onFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = BLUE;
    e.target.style.boxShadow = `0 0 0 3px rgba(0,107,213,0.1)`;
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = "#E5E7EB";
    e.target.style.boxShadow = "none";
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: BG }}
    >
      {/* Logo above card */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.18)" }}>
          <Shuffle className="h-5 w-5 text-white" />
        </div>
        <span className="text-[18px] font-extrabold tracking-tight text-white">SentConnect</span>
      </div>

      <div
        className="w-full max-w-[420px] bg-white rounded-2xl px-8 py-8"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
      >
        {!token ? (
          <div className="text-center">
            <p className="text-[14px] text-gray-500 mb-4">Invalid or missing reset token.</p>
            <Link href="/forgot-password" className="text-[13px] font-semibold hover:underline" style={{ color: BLUE }}>
              Request a new link
            </Link>
          </div>
        ) : done ? (
          <div className="text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#EFF6FF", border: "2px solid #93C5FD" }}
            >
              <CheckCircle2 className="h-7 w-7" style={{ color: BLUE }} />
            </div>
            <h2 className="text-[18px] font-bold text-gray-900 mb-2">Password reset!</h2>
            <p className="text-[14px] text-gray-500 mb-5">You can now sign in with your new password.</p>
            <Link href="/login">
              <button
                className="w-full h-11 text-white font-bold rounded-xl text-[15px] transition-all"
                style={{ background: BLUE }}
                onMouseEnter={e => { e.currentTarget.style.background = BLUE_DK; }}
                onMouseLeave={e => { e.currentTarget.style.background = BLUE; }}
              >
                Sign in
              </button>
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-[22px] font-bold text-gray-900 mb-1">Set new password</h2>
            <p className="text-[14px] text-gray-500 mb-6">Choose a strong password for your account.</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-3 py-2 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  className={inputClass}
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Confirm password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Same password again"
                  required
                  className={inputClass}
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
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
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Resetting…</> : "Reset password"}
              </button>
            </form>
          </>
        )}
      </div>

      <p className="mt-8 text-white/40 text-[12px]">"Declare his glory among the nations." — Ps 96:3</p>
    </div>
  );
}
