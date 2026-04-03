import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "./auth-provider";
import { useLogoutUser } from "@workspace/api-client-react";
import { Button } from "./ui/button";
import { Shuffle, LogOut, User as UserIcon, LayoutDashboard, Rss } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Layout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentPath] = useLocation();
  const { toast } = useToast();

  const logout = useLogoutUser({
    mutation: {
      onSuccess: () => {
        toast({ title: "Logged out" });
        window.location.href = "/login";
      }
    }
  });

  if (currentPath === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-50 text-foreground selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full bg-white border-b border-border shadow-sm">
        <div className="container max-w-5xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:opacity-90 transition-opacity">
              <Shuffle className="h-4 w-4" />
            </div>
            <span className="font-bold text-[16px] tracking-tight">SentTrack</span>
          </Link>

          <nav className="flex items-center gap-1">
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <>
                    <Link href="/feed" data-testid="link-nav-feed">
                      <Button variant="ghost" size="sm" className="gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                        <Rss className="h-4 w-4" />
                        <span className="hidden sm:inline">Feed</span>
                      </Button>
                    </Link>

                    {user.role === "admin" && (
                      <Link href="/admin" data-testid="link-nav-admin">
                        <Button variant="ghost" size="sm" className="gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                          <LayoutDashboard className="h-4 w-4" />
                          <span className="hidden sm:inline">Admin</span>
                        </Button>
                      </Link>
                    )}

                    <Link href="/profile" data-testid="link-nav-profile">
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-8 w-8"
                      onClick={() => logout.mutate({ data: undefined })}
                      title="Sign out"
                      data-testid="btn-logout"
                    >
                      <LogOut className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </>
                ) : (
                  <Link href="/login" data-testid="link-nav-login">
                    <Button size="sm" className="rounded-full px-5 h-8 text-sm">Sign In</Button>
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {children}
      </main>

      <footer className="border-t border-border py-6 mt-8 bg-white">
        <div className="container max-w-5xl mx-auto px-4 text-center">
          <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-muted-foreground/50">SentTrack</p>
          <p className="text-xs text-muted-foreground/60 mt-1 font-medium">"Declare his glory among the nations."</p>
        </div>
      </footer>
    </div>
  );
}
