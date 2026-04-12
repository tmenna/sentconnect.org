import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  Building2, Users, FileText, CheckCircle2, XCircle,
  Loader2, Globe, ShieldCheck, UserCog, Search,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type OrgWithStats = {
  id: number;
  name: string;
  subdomain: string;
  plan: string;
  status: string;
  createdAt: string;
  userCount: number;
  postCount: number;
};

type PlatformStats = {
  totalOrgs: number;
  totalUsers: number;
  totalPosts: number;
};

type PlatformUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  organizationId: number | null;
  organization: string | null;
  createdAt: string;
  avatarUrl: string | null;
  location: string | null;
};

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-border/60 shadow-sm p-5 flex items-center gap-4">
      <div className="p-3 bg-[#132272]/8 rounded-xl text-[#132272]">{icon}</div>
      <div>
        <p className="text-[13px] text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-extrabold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-[13px] font-semibold rounded-lg transition-colors ${
        active
          ? "bg-[#132272] text-white"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
      }`}
    >
      {children}
    </button>
  );
}

export default function SuperAdminPanel() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"orgs" | "users">("orgs");
  const [orgs, setOrgs] = useState<OrgWithStats[] | null>(null);
  const [allUsers, setAllUsers] = useState<PlatformUser[] | null>(null);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);
  const [impersonating, setImpersonating] = useState<number | null>(null);
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    if (!isLoading && user?.role === "super_admin") {
      Promise.all([
        fetch("/api/super-admin/orgs", { credentials: "include" }).then(r => r.json()),
        fetch("/api/super-admin/stats", { credentials: "include" }).then(r => r.json()),
        fetch("/api/super-admin/users", { credentials: "include" }).then(r => r.json()),
      ]).then(([orgData, statsData, userData]) => {
        setOrgs(orgData);
        setStats(statsData);
        setAllUsers(userData);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [isLoading, user]);

  async function toggleOrgStatus(org: OrgWithStats) {
    setToggling(org.id);
    try {
      const newStatus = org.status === "active" ? "inactive" : "active";
      const res = await fetch(`/api/super-admin/orgs/${org.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setOrgs(prev => prev ? prev.map(o => o.id === org.id ? { ...o, status: updated.status } : o) : null);
      toast({ title: `Organization ${newStatus === "active" ? "activated" : "deactivated"}` });
    } catch {
      toast({ title: "Failed to update organization", variant: "destructive" });
    } finally {
      setToggling(null);
    }
  }

  async function impersonate(userId: number, userName: string, orgSubdomain: string | null) {
    setImpersonating(userId);
    try {
      const res = await fetch(`/api/super-admin/impersonate/${userId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      toast({ title: `Now impersonating ${userName}` });
      // Navigate into the org's context if subdomain is known
      window.location.href = orgSubdomain ? `/${orgSubdomain}/` : "/";
    } catch {
      toast({ title: "Impersonation failed", variant: "destructive" });
      setImpersonating(null);
    }
  }

  const filteredUsers = (allUsers ?? []).filter(u => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.organization ?? "").toLowerCase().includes(q)
    );
  });

  // Group filtered users by organization for display
  const usersByOrg = filteredUsers.reduce<Record<string, PlatformUser[]>>((acc, u) => {
    const key = u.organization ?? "No Organization";
    if (!acc[key]) acc[key] = [];
    acc[key].push(u);
    return acc;
  }, {});

  const orgSubdomainMap = (orgs ?? []).reduce<Record<string, string>>((acc, o) => {
    acc[o.name] = o.subdomain;
    return acc;
  }, {});

  const roleBadge = (role: string) => {
    if (role === "admin") return "bg-blue-100 text-blue-700";
    if (role === "super_admin") return "bg-purple-100 text-purple-700";
    return "bg-slate-100 text-slate-600";
  };

  const initials = (name: string) =>
    name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div
        className="rounded-2xl px-6 py-5 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, #132272 0%, #1e3a8a 100%)" }}
      >
        <div className="p-3 bg-white/15 rounded-xl">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-[20px] font-extrabold text-white tracking-tight">Platform Admin</h1>
          <p className="text-white/65 text-sm mt-0.5">
            Global view — no organization filter applied. Accessible only from the root domain.
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-wide">Signed in as</span>
          <span className="text-[13px] font-semibold text-white/90">{user?.name}</span>
        </div>
      </div>

      {/* Platform Stats */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-xl border border-border/60 animate-pulse" />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Organizations" value={stats.totalOrgs} icon={<Building2 className="h-5 w-5" />} />
          <StatCard label="Total Users" value={stats.totalUsers} icon={<Users className="h-5 w-5" />} />
          <StatCard label="Total Posts" value={stats.totalPosts} icon={<FileText className="h-5 w-5" />} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted/40 rounded-xl p-1 w-fit border border-border/40">
        <TabButton active={activeTab === "orgs"} onClick={() => setActiveTab("orgs")}>
          <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Organizations</span>
        </TabButton>
        <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")}>
          <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> All Users</span>
        </TabButton>
      </div>

      {/* Tab: Organizations */}
      {activeTab === "orgs" && (
        <div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-xl border border-border/60 animate-pulse" />)}
            </div>
          ) : !orgs || orgs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-border py-16 text-center shadow-sm">
              <Building2 className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
              <p className="text-sm font-semibold text-foreground">No organizations yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orgs.map(org => (
                <div key={org.id} className="bg-white rounded-xl border border-border/60 shadow-sm px-5 py-4 flex items-center gap-4">
                  <div className="p-2.5 bg-muted/50 rounded-lg flex-shrink-0">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[14px] text-foreground truncate">{org.name}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${org.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {org.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[12px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{org.subdomain}.sentconnect.org</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{org.userCount} users</span>
                      <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{org.postCount} posts</span>
                      <span>Created {formatDistanceToNow(new Date(org.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleOrgStatus(org)}
                    disabled={toggling === org.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors flex-shrink-0 ${
                      org.status === "active"
                        ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                    }`}
                  >
                    {toggling === org.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : org.status === "active" ? (
                      <><XCircle className="h-3.5 w-3.5" /> Suspend</>
                    ) : (
                      <><CheckCircle2 className="h-3.5 w-3.5" /> Activate</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: All Users */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or organization…"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-[13px] border border-border/60 rounded-xl bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-white rounded-xl border border-border/60 animate-pulse" />)}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-border py-16 text-center shadow-sm">
              <Users className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
              <p className="text-sm font-semibold text-foreground">No users found</p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(usersByOrg).map(([orgName, orgUsers]) => {
                const subdomain = orgSubdomainMap[orgName];
                return (
                  <div key={orgName}>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-wide">{orgName}</span>
                      {subdomain && (
                        <span className="text-[11px] text-muted-foreground/60">{subdomain}.sentconnect.org</span>
                      )}
                    </div>
                    <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
                      {orgUsers.map((u, idx) => (
                        <div
                          key={u.id}
                          className={`flex items-center gap-3 px-4 py-3 ${idx < orgUsers.length - 1 ? "border-b border-border/40" : ""}`}
                        >
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={u.avatarUrl ?? undefined} />
                            <AvatarFallback className="text-[11px] font-bold bg-[#132272]/10 text-[#132272]">
                              {initials(u.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-semibold text-foreground truncate">{u.name}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${roleBadge(u.role)}`}>
                                {u.role.replace("_", " ")}
                              </span>
                              {u.status === "inactive" && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                                  inactive
                                </span>
                              )}
                            </div>
                            <p className="text-[12px] text-muted-foreground truncate">{u.email}</p>
                          </div>
                          <button
                            onClick={() => impersonate(u.id, u.name, subdomain ?? null)}
                            disabled={impersonating === u.id || u.role === "super_admin"}
                            title={u.role === "super_admin" ? "Cannot impersonate another super admin" : `Sign in as ${u.name}`}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                          >
                            {impersonating === u.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <UserCog className="h-3 w-3" />
                            )}
                            Sign in as
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredUsers.length > 0 && (
            <p className="text-[12px] text-muted-foreground text-right">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} across {Object.keys(usersByOrg).length} organization{Object.keys(usersByOrg).length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
