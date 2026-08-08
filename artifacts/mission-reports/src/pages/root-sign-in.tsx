import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Loader2, SearchX } from "lucide-react";
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
  const [notFound, setNotFound] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const { logo: lpLogo, isLogoReady } = useLogo();
  const [, navigate] = useLocation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (checking) return;
    const cleaned = slug.trim().toLowerCase().replace(/\.sentconnect\.org.*$/, "").replace(/^https?:\/\//, "");
    if (!/^[a-z0-9-]{2,40}$/.test(cleaned)) {
      setNotFound(null);
      setError("Enter your church's address, e.g. \u201cgrace\u201d for grace.sentconnect.org");
      return;
    }
    setError("");
    setNotFound(null);
    setChecking(true);
    let exists = true; // if the lookup itself fails, don't block sign-in
    try {
      const res = await fetch(`/api/orgs/resolve?subdomain=${encodeURIComponent(cleaned)}`);
      if (res.status === 404) exists = false;
    } catch {
      // network hiccup — proceed to the org sign-in page as before
    }
    setChecking(false);
    if (!exists) {
      setNotFound(cleaned);
      return;
    }
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
            <img src={lpLogo} alt="SentConnect" className="h-16 md:h-20" style={{ width: "auto", maxWidth: 240, display: "block", opacity: isLogoReady ? 1 : 0, transition: "opacity .25s ease" }} />
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
                disabled={checking}
                value={slug}
                onChange={e => { setSlug(e.target.value); if (error) setError(""); if (notFound) setNotFound(null); }}
                placeholder="yourchurch"
                className="flex-1 min-w-0 px-4 py-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none disabled:bg-slate-50 disabled:text-slate-400"
              />
              <span className="flex items-center px-4 bg-slate-50 border-l border-slate-200 text-sm font-medium text-slate-500 select-none">
                .sentconnect.org
              </span>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            {notFound && (
              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/70 p-4 flex gap-3" role="alert" data-testid="church-not-found">
                <SearchX className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: BLUE }} />
                <div className="text-sm leading-relaxed text-slate-700">
                  <p className="font-semibold text-slate-900 mb-1">
                    We couldn't find a church at &ldquo;{notFound}.sentconnect.org&rdquo;.
                  </p>
                  <p className="mb-2">
                    Double-check the spelling, or ask your church admin for the exact address in your invitation email.
                  </p>
                  <p>
                    New to SentConnect?{" "}
                    <a href="/signup" className="font-semibold" style={{ color: BLUE, textDecoration: "none" }}>Sign up your church</a>
                    {" "}or{" "}
                    <a href="https://demo.sentconnect.org/" className="font-semibold" style={{ color: BLUE, textDecoration: "none" }}>try the demo</a>.
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={checking}
              aria-busy={checking}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: BLUE, boxShadow: "0 4px 16px rgba(16,133,253,0.3)" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; if (!checking) el.style.background = "#0e74e0"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = BLUE; }}
            >
              {checking ? (
                <>
                  Finding your church…
                  <Loader2 className="w-4 h-4 animate-spin" />
                </>
              ) : (
                <>
                  Continue to sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
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
