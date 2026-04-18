import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "./auth-provider";
import { useLogoutUser } from "@workspace/api-client-react";
import { Button } from "./ui/button";
import { Shuffle, LogOut, Rss, ShieldCheck } from "lucide-react";
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
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors",
        currentPath === href
          ? "bg-gray-100 text-[#111827]"
          : "text-gray-500 hover:text-[#111827] hover:bg-gray-100"
      )}>
        {icon}
        {label}
      </span>
    </Link>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col text-foreground" style={{ backgroundColor: "#F2F2F2" }}>
      <header
        className="sticky top-0 z-50 w-full bg-white"
        style={{ borderBottom: "1px solid #E9E9E9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      >
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
            <div className="bg-gray-100 border border-gray-200 p-1.5 rounded-lg">
              <Shuffle className="h-4 w-4 text-[#111827]" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-[#111827]">SentConnect</span>
          </Link>

          <nav className="flex items-center gap-0.5">
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <>
                    {user.role === "admin" && navLink("/admin", "Updates", <Rss className="h-3.5 w-3.5" />)}
                    {user.role === "super_admin" && navLink("/admin", "Platform Admin", <ShieldCheck className="h-3.5 w-3.5" />)}

                    <Link href="/profile" data-testid="link-nav-profile">
                      <div className="ml-1.5 w-8 h-8 rounded-full bg-gray-100 border border-gray-200 text-[#374151] flex items-center justify-center font-semibold text-[13px] cursor-pointer hover:bg-gray-200 transition-colors">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </Link>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 ml-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
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
                      className="h-8 px-5 text-sm font-bold rounded-lg bg-[#111827] text-white hover:bg-[#1f2937] transition-colors"
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

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-8">
        {children}
      </main>

      <footer className="mt-12 py-5" style={{ borderTop: "1px solid #E9E9E9", backgroundColor: "#FFFFFF" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-1 rounded-md border border-gray-200">
              <Shuffle className="h-3 w-3 text-gray-500" />
            </div>
            <span className="text-xs font-semibold text-gray-400">SentConnect</span>
          </div>
          <p className="text-xs text-gray-400 italic">"Declare his glory among the nations." — Ps 96:3</p>
        </div>
      </footer>
    </div>
  );
}
