import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "./auth-provider";
import { useLogoutUser } from "@workspace/api-client-react";
import { Button } from "./ui/button";
import { LogOut, Rss, ShieldCheck, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
/* Brand tokens */
const EMERALD   = "#8A05FF";
const CHARCOAL  = "#374151";
const BORDER    = "#E5E7EB";

export function Layout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentPath] = useLocation();
  const { toast } = useToast();
  const logout = useLogoutUser({
    mutation: {
      onSuccess: () => {
        toast({ title: "Signed out" });
        window.location.href = "/login";
      }
    }
  });

  if (currentPath === "/login") return <>{children}</>;

  const navLink = (href: string, label: string, icon?: ReactNode) => (
    <Link href={href}>
      <span className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors",
        currentPath === href
          ? "bg-gray-100 text-gray-900"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
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
            <span className="font-bold text-[16px] tracking-tight" style={{ color: CHARCOAL }}>SentConnect</span>
          </Link>

          {/* Right nav */}
          <nav className="flex items-center gap-0.5">
            {/* Help — always visible, opens in new tab */}
            <a
              href="/help"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors",
                "text-gray-500 hover:text-purple-700 hover:bg-purple-50"
              )}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Help
            </a>

            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <>
                    {user.role === "admin" && navLink("/admin", "Updates", <Rss className="h-3.5 w-3.5" />)}
                    {user.role === "super_admin" && navLink("/admin", "Platform Admin", <ShieldCheck className="h-3.5 w-3.5" />)}

                    {/* Avatar */}
                    <Link href="/profile" data-testid="link-nav-profile">
                      <div
                        className="ml-1.5 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[13px] cursor-pointer transition-colors"
                        style={{ background: "#f3f4f6", border: `1.5px solid #e5e7eb`, color: "#374151" }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </Link>

                    {/* Logout */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 ml-0.5 hover:bg-gray-100"
                      style={{ color: "#9CA3AF" }}
                      onClick={() => logout.mutate({ data: undefined })}
                      title="Sign out"
                      data-testid="btn-logout"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </Button>
                  </>
                ) : (
                  <Link href="/login" data-testid="link-nav-login">
                    <Button
                      size="sm"
                      className="h-8 px-5 text-sm font-semibold rounded-lg text-white transition-colors"
                      style={{ backgroundColor: EMERALD }}
                    >
                      Sign In
                    </Button>
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-8">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="mt-12 py-5 bg-white" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 tracking-tight">SentConnect</span>
          </div>
          <p className="text-xs text-gray-400 italic">"Declare his glory among the nations." — Ps 96:3</p>
        </div>
      </footer>
    </div>
  );
}
