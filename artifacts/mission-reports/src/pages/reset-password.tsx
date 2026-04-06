import { useState } from "react";
import { Link, useSearch } from "wouter";
import { Shuffle, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPassword() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 bg-[#132272] rounded-xl flex items-center justify-center">
            <Shuffle className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-extrabold text-[#132272]">SentConnect</span>
        </div>

        {!token ? (
          <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-8 text-center">
            <p className="text-muted-foreground text-sm mb-4">Invalid or missing reset token.</p>
            <Link href="/forgot-password" className="text-[13px] text-[hsl(171,100%,34%)] font-semibold hover:underline">
              Request a new link
            </Link>
          </div>
        ) : done ? (
          <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <h2 className="text-[18px] font-extrabold text-foreground mb-2">Password reset!</h2>
            <p className="text-muted-foreground text-sm mb-4">You can now sign in with your new password.</p>
            <Link href="/login">
              <Button className="bg-[hsl(171,100%,34%)] hover:bg-[hsl(171,100%,28%)] text-white font-bold w-full">
                Sign in
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-8">
            <h2 className="text-[20px] font-extrabold text-foreground mb-1">Set new password</h2>
            <p className="text-muted-foreground text-sm mb-6">Choose a strong password for your account.</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-3 py-2 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-foreground mb-1">New password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  className="h-10"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-foreground mb-1">Confirm password</label>
                <Input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Same password again"
                  required
                  className="h-10"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-[hsl(171,100%,34%)] hover:bg-[hsl(171,100%,28%)] text-white font-bold rounded-lg"
              >
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Resetting…</> : "Reset password"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
