import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "./auth-provider";
import { useLogoutUser } from "@workspace/api-client-react";
import { Button } from "./ui/button";
import { LogOut, Rss, ShieldCheck, HelpCircle, Menu, X, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useLogo } from "@/providers/logo-provider";

const PURPLE   = "#8705FA";
const BORDER   = "#E5E7EB";

export function Layout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { logo, isCustomLogo } = useLogo();
  const [currentPath] = useLocation();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const logout = useLogoutUser({
    mutation: {
      onSuccess: () => {
        toast({ title: "Signed out" });
        window.location.href = "/login";
      }
    }
  });

  useEffect(() => {
    setMobileOpen(false);
  }, [currentPath]);

  useEffect(() => {
    if (!mobileOpen) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  if (currentPath === "/login") return <>{children}</>;

  const navLink = (href: string, label: string, icon?: ReactNode) => (
    <Link href={href}>
      <span className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors",
        currentPath === href
          ? "bg-gray-100"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      )}
        style={currentPath === href ? { color: PURPLE, fontWeight: 600 } : {}}
      >
        {icon}
        {label}
      </span>
    </Link>
  );

  const mobileNavLink = (href: string, label: string, icon?: ReactNode) => (
    <Link href={href}>
      <span className={cn(
        "flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium transition-colors",
        currentPath === href
          ? "bg-gray-100 text-gray-900"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}>
        {icon}
        {label}
      </span>
    </Link>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col text-foreground" style={{ background: "#ffffff", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* ── Nav ── */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{ background: "#fff", borderBottom: `1px solid ${BORDER}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      >
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4 sm:px-8">
          {/* Brand wordmark */}
          <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
            <img src={logo} alt="SentConnect" style={{ maxHeight: 22, width: "auto", maxWidth: 160, filter: isCustomLogo ? undefined : "brightness(0)", display: "block", transition: "opacity 0.15s ease" }} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-0.5">
            <a
              href="/help"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-150"
              style={{ background: "#8705FA", color: "#fff" }}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Help
            </a>

            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <>
                    {user.role === "super_admin" && navLink("/admin", "Platform Admin", <ShieldCheck className="h-3.5 w-3.5" />)}

                    <Link href="/profile" data-testid="link-nav-profile">
                      <div
                        className="ml-1.5 w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] cursor-pointer transition-all duration-150"
                        style={{ background: "#F0E0FF", color: "#8705FA" }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </Link>

                    <button
                      className="ml-0.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150"
                      style={{ background: "#F0E0FF", color: "#8705FA", border: "none", cursor: "pointer" }}
                      onClick={() => logout.mutate({ data: undefined })}
                      title="Sign out"
                      data-testid="btn-logout"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <Link href="/login" data-testid="link-nav-login">
                    <Button
                      size="sm"
                      className="h-8 px-5 text-sm font-semibold rounded-lg text-white transition-colors"
                      style={{ backgroundColor: "#0f0f13" }}
                    >
                      Sign In
                    </Button>
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Mobile: avatar + hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            {!isLoading && isAuthenticated && user && (
              <Link href="/profile">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[13px] cursor-pointer"
                  style={{ background: "#f3f4f6", border: "1.5px solid #e5e7eb", color: "#374151" }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div ref={menuRef} className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 shadow-lg">
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <>
                    <div className="px-3 py-2 mb-1">
                      <p className="text-[13px] font-semibold text-gray-900">{user.name}</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">{user.email}</p>
                    </div>
                    <div className="h-px bg-gray-100 mb-2" />
                    {mobileNavLink("/", "Feed", <Rss className="h-4 w-4" />)}
                    {(user.role === "admin" || user.role === "super_admin") &&
                      mobileNavLink("/admin", user.role === "super_admin" ? "Platform Admin" : "Updates", <ShieldCheck className="h-4 w-4" />)}
                    {mobileNavLink("/profile", "Profile", <User className="h-4 w-4" />)}
                    <a
                      href="/help"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Help
                    </a>
                    <div className="h-px bg-gray-100 my-1" />
                    <button
                      onClick={() => logout.mutate({ data: undefined })}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                      data-testid="btn-logout"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href="/help"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Help
                    </a>
                    <Link href="/login">
                      <span className="flex items-center justify-center h-11 rounded-xl text-[15px] font-semibold text-white transition-colors" style={{ backgroundColor: EMERALD }}>
                        Sign In
                      </span>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </header>

      {/* ── Page content ── */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="mt-8 sm:mt-12 py-5 bg-white" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src={logo} alt="SentConnect" style={{ maxHeight: 14, width: "auto", maxWidth: 120, filter: isCustomLogo ? undefined : "brightness(0)", opacity: 0.35, display: "block" }} />
          </div>
          <p className="text-xs text-gray-400 italic text-center">"Declare his glory among the nations." — Ps 96:3</p>
        </div>
      </footer>
    </div>
  );
}
