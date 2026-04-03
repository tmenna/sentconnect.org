import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "./auth-provider";
import { useLogoutUser } from "@workspace/api-client-react";
import { Button } from "./ui/button";
import { Shuffle, LogOut, LayoutDashboard, Rss } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
      )}>
        {icon}
        {label}
      </span>
    </Link>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
            <div className="bg-primary text-white p-1.5 rounded-lg">
              <Shuffle className="h-4 w-4" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-foreground">SentTrack</span>
          </Link>

          <nav className="flex items-center gap-0.5">
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <>
                    {navLink("/feed", "Feed", <Rss className="h-3.5 w-3.5" />)}

                    {user.role === "admin" && navLink("/admin", "Admin", <LayoutDashboard className="h-3.5 w-3.5" />)}

                    <Link href="/profile" data-testid="link-nav-profile">
                      <div className="ml-1.5 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-[13px] cursor-pointer hover:bg-primary/20 transition-colors border border-primary/20">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </Link>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 ml-0.5 text-muted-foreground hover:text-foreground"
                      onClick={() => logout.mutate({ data: undefined })}
                      title="Sign out"
                      data-testid="btn-logout"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </Button>
                  </>
                ) : (
                  <Link href="/login" data-testid="link-nav-login">
                    <Button size="sm" className="h-8 px-4 text-sm font-medium rounded-lg">Sign In</Button>
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

      <footer className="border-t border-border bg-white py-5 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/8 p-1 rounded-md">
              <Shuffle className="h-3 w-3 text-primary" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">SentTrack</span>
          </div>
          <p className="text-xs text-muted-foreground/60 italic">"Declare his glory among the nations." — Ps 96:3</p>
        </div>
      </footer>
    </div>
  );
}
