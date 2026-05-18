import { useEffect, useState } from "react";
import { useSearch } from "wouter";
import { CheckCircle2, Loader2 } from "lucide-react";
import { buildOrgHref } from "@/lib/org";
import logoWhite from "@/assets/logo-white.png";

const BLUE = "#111827";
const BLUE_DK = "#000000";

export default function SignupSuccess() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sessionId = params.get("session_id");

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [subdomain, setSubdomain] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) { setStatus("error"); return; }

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
      style={{ background: "linear-gradient(150deg, #3D0066 0%, #111827 55%, #374151 100%)" }}>
      <div className="w-full max-w-md bg-white rounded-2xl px-8 py-10 text-center"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>

        <div className="flex items-center justify-center gap-2 mb-6">
          <img src={logoWhite} alt="SentConnect" style={{ height: 26, display: "block", filter: "brightness(0)" }} />
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
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = BLUE_DK; }}
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
