import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";
import { useLogo } from "@/providers/logo-provider";
import { buildOrgLoginHref } from "@/lib/org";

const BLUE = "#1085FD";

/**
 * Sign-in entry point for the root sentconnect.org site.
 * Each church signs in at its own address (yourchurch.sentconnect.org),
 * so this page asks for the church address and redirects there.
 */
export default function RootSignIn() {
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const { logo: lpLogo, isLogoReady } = useLogo();
  const [, navigate] = useLocation();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = slug.trim().toLowerCase().replace(/\.sentconnect\.org.*$/, "").replace(/^https?:\/\//, "");
    if (!/^[a-z0-9-]{2,40}$/.test(cleaned)) {
      setError("Enter your church's address, e.g. \u201cgrace\u201d for grace.sentconnect.org");
      return;
    }
    setError("");
    const href = buildOrgLoginHref(cleaned);
    if (href.startsWith("/")) {
      navigate(href);
    } else {
      window.location.href = href;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <header style={{ background: BLUE }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <img src={lpLogo} alt="SentConnect" style={{ height: 56, width: "auto", maxWidth: 200, display: "block", opacity: isLogoReady ? 1 : 0, transition: "opacity .25s ease" }} />
          </a>
          <a href="/" className="text-sm font-semibold text-white/90 hover:text-white px-4 py-2 rounded-full hover:bg-white/10 transition-colors" style={{ textDecoration: "none" }}>
            &larr; Back to home
          </a>
        </div>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-10">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Sign in to SentConnect</h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-8">
            Every church has its own private address. Enter yours below and we'll take you to your sign-in page.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="church-address" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Your church address
            </label>
            <div className="flex items-stretch rounded-xl border border-slate-200 overflow-hidden focus-within:border-[#1085FD] focus-within:ring-2 focus-within:ring-[#1085FD]/20 transition-all">
              <input
                id="church-address"
                type="text"
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={slug}
                onChange={e => { setSlug(e.target.value); if (error) setError(""); }}
                placeholder="yourchurch"
                className="flex-1 min-w-0 px-4 py-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none"
              />
              <span className="flex items-center px-4 bg-slate-50 border-l border-slate-200 text-sm font-medium text-slate-500 select-none">
                .sentconnect.org
              </span>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all"
              style={{ background: BLUE, boxShadow: "0 4px 16px rgba(16,133,253,0.3)" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#0e74e0"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = BLUE; }}
            >
              Continue to sign in
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-sm text-slate-500 space-y-2">
            <p>
              Don't have an account yet?{" "}
              <a href="/signup" className="font-semibold" style={{ color: BLUE, textDecoration: "none" }}>Sign up your church</a>
            </p>
            <p>
              Just looking around?{" "}
              <a href="https://demo.sentconnect.org/" className="font-semibold" style={{ color: BLUE, textDecoration: "none" }}>Try the demo</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
