import { useEffect, useState } from "react";
import { useSearch } from "wouter";
import { Shuffle, CheckCircle2, Loader2 } from "lucide-react";
import { usePlatformLogo } from "@/hooks/use-platform-logo";
import { buildOrgHref } from "@/lib/org";

const BLUE = "#005BBC";

export default function SignupSuccess() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sessionId = params.get("session_id");

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const logoUrl = usePlatformLogo();

  useEffect(() => {
    if (!sessionId) { setStatus("error"); return; }

    // Poll the API until the webhook has created the org (up to ~20s)
    let attempts = 0;
    const maxAttempts = 10;

    async function poll() {
      attempts++;
      try {
        const res = await fetch(`/api/billing/session-status?session_id=${encodeURIComponent(sessionId!)}`);
        if (!res.ok) throw new Error("not ready");
        const data = await res.json();
        if (data.subdomain) {
          setSubdomain(data.subdomain);
          setStatus("ready");
        } else if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          // Webhook may still be processing — show a generic success
          setStatus("ready");
        }
      } catch {
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setStatus("ready");
        }
      }
    }

    poll();
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(150deg, #004EA8 0%, #0066CC 55%, #1A80E0 100%)" }}>
      <div className="w-full max-w-md bg-white rounded-2xl px-8 py-10 text-center"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>

        <div className="flex items-center justify-center gap-2 mb-6">
          {logoUrl ? (
            <img src={logoUrl} alt="SentConnect" style={{ height: 36, maxHeight: 36, width: "auto", maxWidth: 180, objectFit: "contain" }} />
          ) : (
            <>
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Shuffle className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-extrabold tracking-tight" style={{ color: BLUE }}>SentConnect</span>
            </>
          )}
        </div>

        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: BLUE }} />
            <h1 className="text-xl font-extrabold text-gray-900 mb-2">Setting up your organization…</h1>
            <p className="text-sm text-gray-500">Payment confirmed. Hang tight while we create your account.</p>
          </>
        )}

        {status === "ready" && (
          <>
            <CheckCircle2 className="h-14 w-14 mx-auto mb-4" style={{ color: "#16a34a" }} />
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">You're all set!</h1>
            <p className="text-sm text-gray-500 mb-6">
              Your organization has been created and your subscription is active.
            </p>
            {subdomain ? (
              <a
                href={buildOrgHref(subdomain, "/login")}
                className="inline-flex w-full h-11 items-center justify-center rounded-xl text-[15px] font-bold text-white transition-colors"
                style={{ background: BLUE }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#0155a5"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = BLUE; }}
              >
                Go to your portal →
              </a>
            ) : (
              <a
                href="/"
                className="inline-flex w-full h-11 items-center justify-center rounded-xl text-[15px] font-bold text-white"
                style={{ background: BLUE }}
              >
                Return to SentConnect
              </a>
            )}
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-extrabold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-500 mb-6">
              If you were charged, your organization will be set up shortly. Contact support if this persists.
            </p>
            <a href="/" className="inline-flex w-full h-11 items-center justify-center rounded-xl text-[15px] font-bold text-white" style={{ background: BLUE }}>
              Return home
            </a>
          </>
        )}
      </div>
    </div>
  );
}
