import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "./auth-provider";
import { useLogoutUser } from "@workspace/api-client-react";
import { Button } from "./ui/button";
import { ArrowRight, LogOut, LogIn, Rss, ShieldCheck, Menu, X, User, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useOrg } from "@/providers/org-provider";
import logoBlueBlack from "@/assets/logo-blue-black.png";
import logoWhite from "@/assets/logo-white.png";


const PURPLE   = "#1085FD";
const BORDER   = "#E5E7EB";

const DEMO_ORG = "demo";

function MissionaryIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function AdminIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="10" width="18" height="11" rx="1" /><path d="M12 3v7" /><path d="M9 6h6" /><path d="M9 21v-4a3 3 0 0 1 6 0v4" />
    </svg>
  );
}

/**
 * Demo-only "Viewing as" switcher: flips the demo session between the
 * missionary (field user) and Church admin personas in one click.
 */
function DemoRoleSwitch({
  selectedRole,
  onSelectRole,
}: {
  selectedRole: "admin" | "field_user";
  onSelectRole: (role: "admin" | "field_user") => void;
}) {
  const { user } = useAuth();
  const { prefix } = useOrg();
  const { toast } = useToast();
  const [switching, setSwitching] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const selectedIsAdmin = selectedRole === "admin";

  async function switchTo(role: "admin" | "field_user") {
    if (switching) return;
    if (role === selectedRole) return;
    onSelectRole(role);
    setSwitching(true);
    try {
      const res = await fetch("/api/auth/demo-switch-role", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        // Land each persona on its full home experience: admins get the
        // dashboard (sidebar, member filter), missionaries get their
        // dashboard home (sidebar with Missions Feed / org / Profile).
        window.location.href = prefix(role === "admin" ? "/admin" : "/");
      } else {
        const data = await res.json().catch(() => ({}));
        toast({ title: data.error ?? "Couldn't switch views — please try again." });
        onSelectRole(isAdmin ? "admin" : "field_user");
        setSwitching(false);
      }
    } catch {
      toast({ title: "Network error — please try again." });
      onSelectRole(isAdmin ? "admin" : "field_user");
      setSwitching(false);
    }
  }

  const btnBase: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 7,
    border: "none", cursor: switching ? "wait" : "pointer",
    borderRadius: 8, fontWeight: 700, lineHeight: 1,
    fontSize: 13,
    padding: "8px 12px",
    transition: "background .15s, color .15s",
    whiteSpace: "nowrap",
  };

  return (
    <div
      role="group"
      aria-label="Switch demo view"
      style={{
        display: "inline-flex", alignItems: "center", gap: 3,
        background: "#EFF6FF", borderRadius: 10, padding: 3,
        border: "1px solid #BFDBFE",
        opacity: switching ? 0.7 : 1,
      }}
    >
      <button
        onClick={() => switchTo("field_user")}
        aria-pressed={!selectedIsAdmin}
        data-testid="btn-demo-view-missionary"
        style={{ ...btnBase, background: !selectedIsAdmin ? "#1085FD" : "transparent", color: !selectedIsAdmin ? "#fff" : "#2563A8" }}
      >
        <MissionaryIcon size={13} />
        Missionary
      </button>
      <button
        onClick={() => switchTo("admin")}
        aria-pressed={selectedIsAdmin}
        data-testid="btn-demo-view-admin"
        style={{ ...btnBase, background: selectedIsAdmin ? "#1085FD" : "transparent", color: selectedIsAdmin ? "#fff" : "#2563A8" }}
      >
        <AdminIcon size={13} />
        Church Admin
      </button>
    </div>
  );
}

function DemoBanner() {
  const { orgSlug } = useOrg();
  const { user, isAuthenticated } = useAuth();
  const actualRole = user?.role === "admin" || user?.role === "super_admin" ? "admin" : "field_user";
  const [selectedRole, setSelectedRole] = useState<"admin" | "field_user">(actualRole);

  useEffect(() => {
    setSelectedRole(actualRole);
  }, [actualRole]);

  if (orgSlug !== DEMO_ORG || !isAuthenticated || !user) return null;

  // Only the two canonical demo personas can switch views; anyone else in the
  // demo org (invited members, platform admins) sees the banner without the toggle.
  const isDemoPersona = user.email === "demoadmin@sentconnect.org" || user.email === "demouser@sentconnect.org";
  const isAdmin = selectedRole === "admin";

  return (
    <div style={{
      background: "#FFFFFF",
      color: "#0F172A",
      flexShrink: 0,
      borderBottom: "1px solid #E2E8F0",
      boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
    }}>
      <div style={{
        maxWidth: 1152,
        minHeight: 62,
        margin: "0 auto",
        padding: "8px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#475569" }}>
          Demo mode: <span style={{ color: "#0F172A" }}>{isAdmin ? "Church Admin" : "Missionary"}</span>
        </span>
        {isDemoPersona && (
          <DemoRoleSwitch selectedRole={selectedRole} onSelectRole={setSelectedRole} />
        )}
        {isDemoPersona && (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 10px",
            borderRadius: 9,
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            color: "#64748B",
            fontSize: 13,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
          }}>
            <ArrowRight size={14} strokeWidth={2.4} color="#1085FD" aria-hidden="true" />
            <span>
              Choose{" "}
              <strong style={{ color: "#1085FD", fontWeight: 750 }}>
                {isAdmin ? "Missionary" : "Church Admin"}
              </strong>
              {isAdmin ? " to post" : " to view posts"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { orgSlug } = useOrg();
  const isDemoOrg = orgSlug === DEMO_ORG;
  // Signed-in org pages (admin + missionary dashboards) use the blue brand
  // header with the white logo. Demo pages always start with the same white
  // logo instead of waiting for authentication and briefly showing another one.
  const onBlue = isDemoOrg || isAuthenticated;

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
        onBlue
          ? "text-white/85 hover:text-white hover:bg-white/15"
          : currentPath === href
            ? "bg-gray-100"
            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      )}
        style={!onBlue && currentPath === href ? { color: PURPLE, fontWeight: 600 } : onBlue && currentPath === href ? { fontWeight: 600, background: "rgba(255,255,255,0.16)" } : {}}
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
        style={onBlue
          ? { background: "#1085FD", boxShadow: "0 1px 0 rgba(0,72,160,0.18)" }
          : { background: "#fff", borderBottom: `1px solid ${BORDER}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      >
        <div className={cn(
          "max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8",
          isDemoOrg ? "h-24 md:h-28" : "h-16",
        )}>
          {/* Brand wordmark */}
          <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
            <img
              src={onBlue ? logoWhite : logoBlueBlack}
              alt="SentConnect"
              fetchPriority={isDemoOrg ? "high" : "auto"}
              decoding={isDemoOrg ? "sync" : "async"}
              className={isDemoOrg ? "h-20 md:h-24 w-auto" : onBlue ? "h-11 w-auto" : "h-14 w-auto"}
              style={{ maxWidth: isDemoOrg ? 300 : 220, display: "block", objectFit: "contain" }}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-0.5">
            {isDemoOrg && (
              <a
                href="https://www.sentconnect.org"
                className="inline-flex items-center gap-1.5 px-3 h-8 mr-1 rounded-full text-[13px] font-semibold transition-colors"
                style={onBlue
                  ? { color: "rgba(255,255,255,0.92)", border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)", textDecoration: "none" }
                  : { color: "#6B7280", border: "1px solid #E5E7EB", background: "#fff", textDecoration: "none" }}
                title="Back to sentconnect.org"
              >
                <Globe className="h-3.5 w-3.5" />
                Main Site
              </a>
            )}
            {isDemoOrg && !isAuthenticated && (
              <a
                href="https://www.sentconnect.org/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 mr-1 rounded-lg text-[13px] font-semibold transition-colors"
                style={{ color: "#1085FD", border: "1px solid #BFDBFE", background: "#F5FAFF" }}
                title="Sign in to your own organization"
              >
                <LogIn className="h-3.5 w-3.5" />
                Your Org Sign In
              </a>
            )}
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <>
                    {user.role === "super_admin" && navLink("/admin", "Platform Admin", <ShieldCheck className="h-3.5 w-3.5" />)}

                    <Link href="/profile" data-testid="link-nav-profile">
                      <div
                        className="ml-1.5 w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] cursor-pointer transition-all duration-150 overflow-hidden flex-shrink-0"
                        style={user.avatarUrl
                          ? { border: onBlue ? "2px solid rgba(255,255,255,0.6)" : "2px solid #E5E7EB" }
                          : onBlue
                            ? { background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)" }
                            : { background: "#2B92FD", color: "#fff" }}
                      >
                        {user.avatarUrl
                          ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                          : user.name.charAt(0).toUpperCase()}
                      </div>
                    </Link>

                    <button
                      className="ml-0.5 flex items-center gap-1.5 px-3 h-8 rounded-full transition-all duration-150 text-[13px] font-semibold"
                      style={onBlue
                        ? { background: "rgba(255,255,255,0.16)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer" }
                        : { background: "#EFF6FF", color: "#1085FD", border: "none", cursor: "pointer" }}
                      onClick={() => logout.mutate({ data: undefined })}
                      title="Sign out"
                      data-testid="btn-logout"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 ml-1">
                    <Link href="/signup">
                      <Button
                        size="sm"
                        className="h-8 px-4 text-sm font-semibold rounded-lg transition-colors"
                        style={{ background: "#1085FD", color: "#fff" }}
                      >
                        Sign Up
                      </Button>
                    </Link>
                    <Link href="/login" data-testid="link-nav-login">
                      <Button
                        size="sm"
                        className="h-8 px-5 text-sm font-semibold rounded-lg text-white transition-colors"
                        style={{ backgroundColor: "#0f0f13" }}
                      >
                        Sign In
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </nav>

          {/* Mobile: avatar + hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            {!isLoading && isAuthenticated && user && (
              <Link href="/profile">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[13px] cursor-pointer overflow-hidden flex-shrink-0"
                  style={user.avatarUrl
                    ? { border: onBlue ? "2px solid rgba(255,255,255,0.6)" : "2px solid #E5E7EB" }
                    : onBlue
                      ? { background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)" }
                      : { background: "#2B92FD", color: "#fff" }}
                >
                  {user.avatarUrl
                    ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    : user.name.charAt(0).toUpperCase()}
                </div>
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className={onBlue
                ? "p-2 rounded-lg text-white/90 hover:bg-white/15 transition-colors"
                : "p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div ref={menuRef} className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 shadow-lg">
            {isDemoOrg && (
              <a
                href="https://www.sentconnect.org"
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <Globe className="h-4 w-4" />
                Main Site
              </a>
            )}
            {isDemoOrg && !isAuthenticated && (
              <a
                href="https://www.sentconnect.org/login"
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-semibold transition-colors"
                style={{ color: "#1085FD", background: "#F5FAFF" }}
              >
                <LogIn className="h-4 w-4" />
                Your Org Sign In
              </a>
            )}
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
                    <Link href="/signup">
                      <span className="flex items-center justify-center h-11 rounded-xl text-[15px] font-semibold text-white transition-colors" style={{ backgroundColor: "#1085FD" }}>
                        Sign Up
                      </span>
                    </Link>
                    <Link href="/login">
                      <span className="flex items-center justify-center h-11 rounded-xl text-[15px] font-semibold text-white transition-colors" style={{ backgroundColor: "#0f0f13" }}>
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

      {/* ── Demo banner ── */}
      <DemoBanner />

      {/* ── Page content ── */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="mt-8 sm:mt-12 py-5 bg-white" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400 italic text-center">"Declare his glory among the nations." — Ps 96:3</p>
          <a
            href="https://www.sentconnect.org"
            className="text-xs font-semibold hover:underline"
            style={{ color: "#006AFF" }}
          >
            Visit sentconnect.org →
          </a>
        </div>
      </footer>
    </div>
  );
}
