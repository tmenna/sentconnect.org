import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "./auth-provider";
import { useLogoutUser } from "@workspace/api-client-react";
import { Button } from "./ui/button";
import { Shuffle, LogOut, Rss, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const BRAND_NAVY = "#132272";

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
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
        currentPath === href
          ? "bg-white/15 text-white"
          : "text-white/65 hover:text-white hover:bg-white/10"
      )}>
        {icon}
        {label}
      </span>
    </Link>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col text-foreground" style={{ backgroundColor: "#eef1fa" }}>
      <header className="sticky top-0 z-50 w-full" style={{ backgroundColor: BRAND_NAVY }}>
        <div className="max-w-5xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
            <div className="bg-white/15 border border-white/20 p-1.5 rounded-lg">
              <Shuffle className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-white">SentConnect</span>
          </Link>

          <nav className="flex items-center gap-0.5">
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <>
                    {user.role === "admin" && navLink("/admin", "Updates", <Rss className="h-3.5 w-3.5" />)}
                    {user.role === "super_admin" && navLink("/admin", "Platform Admin", <ShieldCheck className="h-3.5 w-3.5" />)}

                    <Link href="/profile" data-testid="link-nav-profile">
                      <div className="ml-1.5 w-8 h-8 rounded-full bg-white/15 border border-white/25 text-white flex items-center justify-center font-semibold text-[13px] cursor-pointer hover:bg-white/25 transition-colors">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </Link>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 ml-0.5 text-white/60 hover:text-white hover:bg-white/10"
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
                      className="h-8 px-5 text-sm font-bold rounded-md bg-white text-[#132272] border border-white/60 hover:bg-white/90 transition-colors"
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

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      <footer className="border-t border-border py-5 mt-12" style={{ backgroundColor: BRAND_NAVY }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-1 rounded-md border border-white/15">
              <Shuffle className="h-3 w-3 text-white/70" />
            </div>
            <span className="text-xs font-semibold text-white/60">SentConnect</span>
          </div>
          <p className="text-xs text-white/35 italic">"Declare his glory among the nations." — Ps 96:3</p>
        </div>
      </footer>
    </div>
  );
}
