import { useAuth } from "@/components/auth-provider";
import { Redirect, Link } from "wouter";
import {
  useGetStats, getGetStatsQueryKey,
  useListUsers, getListUsersQueryKey,
  useGetRecentActivity, getGetRecentActivityQueryKey,
  useListReports, getListReportsQueryKey
} from "@workspace/api-client-react";
import { Users, FileText, MapPin, Home, HeartHandshake, GraduationCap, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const CAT_META: Record<string, { icon: React.ReactNode; color: string; iconBg: string }> = {
  church_planting: { icon: <Home className="h-3.5 w-3.5" />, color: "text-amber-700", iconBg: "bg-amber-100" },
  leadership_training: { icon: <Users className="h-3.5 w-3.5" />, color: "text-blue-700", iconBg: "bg-blue-100" },
  humanitarian_work: { icon: <HeartHandshake className="h-3.5 w-3.5" />, color: "text-rose-700", iconBg: "bg-rose-100" },
  education: { icon: <GraduationCap className="h-3.5 w-3.5" />, color: "text-emerald-700", iconBg: "bg-emerald-100" },
  other: { icon: <MoreHorizontal className="h-3.5 w-3.5" />, color: "text-slate-600", iconBg: "bg-slate-100" },
};

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: stats } = useGetStats({ query: { queryKey: getGetStatsQueryKey() } });
  const { data: activity } = useGetRecentActivity({ limit: 5 }, { query: { queryKey: getGetRecentActivityQueryKey({ limit: 5 }) } });
  const { data: missionaries } = useListUsers({ role: "missionary" }, { query: { queryKey: getListUsersQueryKey({ role: "missionary" }) } });
  const { data: reports } = useListReports({ limit: 100 }, { query: { queryKey: getListReportsQueryKey({ limit: 100 }) } });

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Redirect href="/login" />;
  if (user.role !== "admin") return <Redirect href="/" />;

  const totalReports = stats?.totalReports ?? 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Admin Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {stats ? `${stats.totalMissionaries} missionaries · ${stats.totalReports} reports` : "Loading…"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Main: Missionary thumbnail grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                Field Team
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Select a missionary to view their reports</p>
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {missionaries?.map((m, i) => {
                const reportCount = reports?.filter(r => r.missionaryId === m.id).length ?? 0;
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link href={`/missionaries/${m.id}`}>
                      <div className="group flex flex-col items-center gap-2.5 cursor-pointer">
                        <div className="w-full aspect-square rounded-xl overflow-hidden border-2 border-transparent group-hover:border-primary transition-all duration-150 shadow-sm bg-muted relative">
                          {m.avatarUrl ? (
                            <img
                              src={m.avatarUrl}
                              alt={m.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                              <span className="text-3xl font-bold text-primary">{m.name.charAt(0)}</span>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                            {reportCount}
                          </div>
                        </div>
                        <div className="text-center w-full">
                          <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors leading-tight truncate">
                            {m.name}
                          </p>
                          {m.location && (
                            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center justify-center gap-0.5 truncate">
                              <MapPin className="h-2.5 w-2.5 flex-shrink-0" />{m.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
              {(!missionaries || missionaries.length === 0) && (
                <div className="col-span-3 py-12 text-center text-sm text-muted-foreground">
                  No missionaries yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Category breakdown */}
          {stats?.reportsByCategory && stats.reportsByCategory.length > 0 && (
            <div className="bg-white rounded-xl border border-border shadow-sm p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-muted-foreground" />
                By Category
              </h2>
              <div className="space-y-3">
                {stats.reportsByCategory.map(cat => {
                  const meta = CAT_META[cat.category] ?? CAT_META.other;
                  const pct = totalReports > 0 ? Math.max(2, (cat.count / totalReports) * 100) : 2;
                  return (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn("text-[12px] font-medium flex items-center gap-1.5", meta.color)}>
                          <span className={cn("w-4 h-4 rounded flex items-center justify-center", meta.iconBg)}>
                            {meta.icon}
                          </span>
                          {CATEGORY_LABELS[cat.category] || cat.category}
                        </span>
                        <span className="text-[12px] font-semibold text-foreground">{cat.count}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent activity */}
          {activity && activity.length > 0 && (
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
              </div>
              <div>
                {activity.map((rep, i) => (
                  <Link
                    key={`activity-${rep.id}`}
                    href={`/reports/${rep.id}`}
                    className={cn(
                      "block px-5 py-3.5 hover:bg-[#F7F8FA] transition-colors group",
                      i > 0 ? "border-t border-border" : ""
                    )}
                  >
                    <p className="text-[12.5px] text-foreground leading-snug">
                      <span className="font-medium">{rep.missionary.name}</span>
                      <span className="text-muted-foreground"> filed </span>
                      <span className="font-medium group-hover:text-primary transition-colors">{rep.title}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {format(new Date(rep.createdAt), "MMM d, yyyy")}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
