import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "./auth-provider";
import { useLogoutUser } from "@workspace/api-client-react";
import { Button } from "./ui/button";
import { BookOpen, LogOut, PlusCircle, User as UserIcon, LayoutDashboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Layout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const logout = useLogoutUser({
    mutation: {
      onSuccess: () => {
        toast({ title: "Logged out successfully" });
        window.location.href = "/login";
      }
    }
  });

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b-2 bg-white shadow-sm">
        <div className="container max-w-5xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group transition-opacity hover:opacity-80" data-testid="link-home">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md group-hover:scale-105 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-sans font-bold text-lg tracking-tight">SentTrack</span>
          </Link>
          
          <nav className="flex items-center gap-1 sm:gap-2">
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <>
                    <Link href="/" className="hidden sm:inline-flex" data-testid="link-nav-timeline">
                      <Button variant="ghost" size="sm">Timeline</Button>
                    </Link>
                    
                    {user.role === "missionary" && (
                      <Link href="/submit" data-testid="link-nav-submit">
                        <Button variant="default" size="sm" className="gap-2 rounded-full">
                          <PlusCircle className="h-4 w-4" />
                          <span className="hidden sm:inline">New Report</span>
                        </Button>
                      </Link>
                    )}
                    
                    {user.role === "admin" && (
                      <Link href="/admin" data-testid="link-nav-admin">
                        <Button variant="outline" size="sm" className="gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          <span className="hidden sm:inline">Admin</span>
                        </Button>
                      </Link>
                    )}
                    
                    <Link href="/profile" data-testid="link-nav-profile">
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <UserIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => logout.mutate({ data: undefined })}
                      title="Logout"
                      data-testid="btn-logout"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Link href="/login" data-testid="link-nav-login">
                    <Button variant="default" size="sm" className="rounded-full px-6">Sign In</Button>
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {children}
      </main>
      
      <footer className="border-t-2 py-8 mt-12 bg-card">
        <div className="container max-w-5xl mx-auto px-4 text-center space-y-1">
          <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-muted-foreground/60">SentTrack</p>
          <p className="text-xs text-muted-foreground font-medium">"Declare his glory among the nations, his marvelous works among all the peoples!"</p>
        </div>
      </footer>
    </div>
  );
}
