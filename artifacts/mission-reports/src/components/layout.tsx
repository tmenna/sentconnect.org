import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "./auth-provider";
import { useLogoutUser } from "@workspace/api-client-react";
import { Button } from "./ui/button";
import { Shuffle, LogOut, Rss, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { usePlatformLogo } from "@/hooks/use-platform-logo";

/* Brand tokens */
const EMERALD   = "#0268CE";
const CHARCOAL  = "#374151";
const BORDER    = "#E5E7EB";

export function Layout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentPath] = useLocation();
  const { toast } = useToast();
  const logoUrl = usePlatformLogo();

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
          ? "bg-blue-50 text-blue-700"
          : "text-gray-500 hover:text-blue-700 hover:bg-blue-50"
      )}>
        {icon}
        {label}
      </span>
    </Link>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col text-foreground bg-white">
      {/* ── Nav ── */}
      <header
        className="sticky top-0 z-50 w-full bg-white"
        style={{ borderBottom: `1px solid ${BORDER}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      >
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4 sm:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="SentConnect"
                style={{ height: 36, maxHeight: 36, width: "auto", maxWidth: 180, objectFit: "contain" }}
              />
            ) : (
              <>
                <div className="p-1.5 rounded-lg" style={{ background: "#EFF6FF", border: `1px solid #BFDBFE` }}>
                  <Shuffle className="h-4 w-4" style={{ color: EMERALD }} />
                </div>
                <span className="font-semibold text-[15px] tracking-tight" style={{ color: CHARCOAL }}>SentConnect</span>
              </>
            )}
          </Link>

          {/* Right nav */}
          <nav className="flex items-center gap-0.5">
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
                        style={{ background: "#EFF6FF", border: `1.5px solid #93C5FD`, color: EMERALD }}
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
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="SentConnect"
                style={{ height: 32, maxHeight: 32, width: "auto", maxWidth: 140, objectFit: "contain" }}
              />
            ) : (
              <>
                <div className="p-1 rounded-md" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                  <Shuffle className="h-3 w-3" style={{ color: EMERALD }} />
                </div>
                <span className="text-xs font-semibold text-gray-400">SentConnect</span>
              </>
            )}
          </div>
          <p className="text-xs text-gray-400 italic">"Declare his glory among the nations." — Ps 96:3</p>
        </div>
      </footer>
    </div>
  );
}
