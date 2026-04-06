import { useState, useEffect } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { Building2, Users, FileText, CheckCircle2, XCircle, Loader2, Globe, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

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

export default function SuperAdminPanel() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [orgs, setOrgs] = useState<OrgWithStats[] | null>(null);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && user?.role === "super_admin") {
      Promise.all([
        fetch("/api/super-admin/orgs", { credentials: "include" }).then(r => r.json()),
        fetch("/api/super-admin/stats", { credentials: "include" }).then(r => r.json()),
      ]).then(([orgData, statsData]) => {
        setOrgs(orgData);
        setStats(statsData);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [isLoading, user]);

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Redirect href="/login" />;
  if (user.role !== "super_admin") return <Redirect href="/" />;

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

  async function impersonate(userId: number, userName: string) {
    try {
      const res = await fetch(`/api/super-admin/impersonate/${userId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      toast({ title: `Now impersonating ${userName}`, description: "Refresh to see their view." });
      window.location.href = "/";
    } catch {
      toast({ title: "Impersonation failed", variant: "destructive" });
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div
        className="rounded-2xl px-6 py-5 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, #132272 0%, #1e3a8a 100%)" }}
      >
        <div className="p-3 bg-white/15 rounded-xl">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-[20px] font-extrabold text-white tracking-tight">Super Admin Panel</h1>
          <p className="text-white/65 text-sm mt-0.5">Platform-wide overview and organization management.</p>
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

      {/* Organizations List */}
      <div>
        <h2 className="text-[15px] font-bold text-foreground mb-3">All Organizations</h2>
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
                <div className="p-2.5 bg-muted/50 rounded-lg">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[14px] text-foreground truncate">{org.name}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${org.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {org.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[12px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{org.subdomain}.sentconnect.org</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{org.userCount} users</span>
                    <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{org.postCount} posts</span>
                    <span>Created {formatDistanceToNow(new Date(org.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleOrgStatus(org)}
                    disabled={toggling === org.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                      org.status === "active"
                        ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                    }`}
                  >
                    {toggling === org.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : org.status === "active" ? (
                      <><XCircle className="h-3.5 w-3.5" /> Deactivate</>
                    ) : (
                      <><CheckCircle2 className="h-3.5 w-3.5" /> Activate</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
