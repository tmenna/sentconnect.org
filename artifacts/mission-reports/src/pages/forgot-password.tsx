import { useState } from "react";
import { Link } from "wouter";
import { Shuffle, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 bg-[#132272] rounded-xl flex items-center justify-center">
            <Shuffle className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-extrabold text-[#132272]">SentConnect</span>
        </div>

        {done ? (
          <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <h2 className="text-[18px] font-extrabold text-foreground mb-2">Check your email</h2>
            <p className="text-muted-foreground text-sm mb-4">
              If an account exists for <strong>{email}</strong>, a reset link has been sent.
            </p>
            {devLink && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left mb-4">
                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide mb-1">Dev mode — reset link</p>
                <Link href={devLink} className="text-[12px] text-amber-800 break-all hover:underline">{window.location.origin}{devLink}</Link>
              </div>
            )}
            <Link href="/login" className="text-[13px] text-[hsl(171,100%,34%)] font-semibold hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-8">
            <h2 className="text-[20px] font-extrabold text-foreground mb-1">Reset your password</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Enter your email and we'll send you a reset link.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-3 py-2 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-foreground mb-1">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.org"
                  required
                  className="h-10"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-[hsl(171,100%,34%)] hover:bg-[hsl(171,100%,28%)] text-white font-bold rounded-lg"
              >
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Sending…</> : "Send reset link"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/login" className="text-[13px] text-muted-foreground hover:text-foreground">
                ← Back to sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
