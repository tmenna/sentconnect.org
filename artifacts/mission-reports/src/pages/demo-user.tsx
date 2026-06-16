import { useEffect, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

const SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ?? "";

export default function DemoUser() {
  const [errMsg, setErrMsg] = useState("");
  const [token, setToken] = useState<string | null>(SITE_KEY ? null : "skip");

  // Fire login as soon as we have a Turnstile token (or immediately if no key configured)
  useEffect(() => {
    if (token === null) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/demo-user-login", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(token === "skip" ? {} : { turnstileToken: token }),
        });
        if (cancelled) return;
        if (res.ok) {
          const { subdomain } = await res.json();
          window.location.href = `/${subdomain}/feed`;
        } else {
          const data = await res.json().catch(() => ({}));
          setErrMsg(data.error ?? "Demo temporarily unavailable — please try again shortly.");
        }
      } catch {
        if (!cancelled) setErrMsg("Network error — please check your connection and try again.");
      }
    })();

    return () => { cancelled = true; };
  }, [token]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 24,
      background: "linear-gradient(160deg, #F0F6FF 0%, #F7FAFF 60%, #FFFFFF 100%)",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1085FD", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/>
          </svg>
        </div>
        <span style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em" }}>sentconnect</span>
      </div>

      {/* Invisible Turnstile challenge — resolves immediately for real humans */}
      {SITE_KEY && !token && !errMsg && (
        <Turnstile
          siteKey={SITE_KEY}
          onSuccess={(t) => setToken(t)}
          onError={() => setErrMsg("Security check failed. Please refresh and try again.")}
          onExpire={() => setToken(null)}
          options={{ size: "invisible" }}
        />
      )}

      {errMsg ? (
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 8px" }}>Couldn't load the demo</p>
          <p style={{ fontSize: 13.5, color: "#64748B", margin: "0 0 20px", lineHeight: 1.6 }}>{errMsg}</p>
          <a href="/" style={{ fontSize: 13.5, fontWeight: 600, color: "#1085FD", textDecoration: "none" }}>← Back to sentconnect.org</a>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #EBF3FF", borderTopColor: "#1085FD", animation: "spin .7s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", margin: "0 0 6px" }}>Signing you in as a missionary…</p>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>You'll be able to add posts just like a real field user</p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
