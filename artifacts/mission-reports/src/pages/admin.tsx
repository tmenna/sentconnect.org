import { useAuth } from "@/components/auth-provider";
import { Redirect, Link } from "wouter";
import {
  useGetStats, getGetStatsQueryKey,
  useListReports, getListReportsQueryKey,
  useListUsers, getListUsersQueryKey,
  useGetRecentActivity, getGetRecentActivityQueryKey
} from "@workspace/api-client-react";
import { Users, FileText, MapPin, Home, HeartHandshake, GraduationCap, MoreHorizontal, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CATEGORY_LABELS } from "@/lib/constants";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [filterMissionary, setFilterMissionary] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const { data: stats } = useGetStats({ query: { queryKey: getGetStatsQueryKey() } });
  const { data: activity } = useGetRecentActivity({ limit: 5 }, { query: { queryKey: getGetRecentActivityQueryKey({ limit: 5 }) } });
  const { data: missionaries } = useListUsers({ role: "missionary" }, { query: { queryKey: getListUsersQueryKey({ role: "missionary" }) } });
  const { data: reports, isLoading: loadingReports } = useListReports(
    {
      missionaryId: filterMissionary !== "all" ? Number(filterMissionary) : null,
      category: filterCategory !== "all" ? filterCategory as any : null,
      limit: 30
    },
    {
      query: {
        queryKey: getListReportsQueryKey({
          missionaryId: filterMissionary !== "all" ? Number(filterMissionary) : null,
          category: filterCategory !== "all" ? filterCategory as any : null,
          limit: 30
        })
      }
    }
  );

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

        {/* Main: Reports table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Field Reports</h2>
              <div className="flex items-center gap-2">
                <Select value={filterMissionary} onValueChange={setFilterMissionary}>
                  <SelectTrigger className="h-8 w-[148px] text-xs" data-testid="filter-missionary">
                    <SelectValue placeholder="All Missionaries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Missionaries</SelectItem>
                    {missionaries?.map(m => (
                      <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="h-8 w-[140px] text-xs" data-testid="filter-category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loadingReports ? (
              <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">Loading…</div>
            ) : reports && reports.length > 0 ? (
              <div>
                {reports.map((report, i) => {
                  const catMeta = CAT_META[report.category] ?? CAT_META.other;
                  return (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={i > 0 ? "border-t border-border" : ""}
                    >
                      <Link
                        href={`/reports/${report.id}`}
                        className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-[#F7F8FA] transition-colors group"
                      >
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", catMeta.iconBg)}>
                          <span className={catMeta.color}>{catMeta.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-colors">
                            {report.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                            <Link
                              href={`/missionaries/${report.missionaryId}`}
                              className="hover:text-foreground transition-colors font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {report.missionary.name}
                            </Link>
                            {report.location && (
                              <>
                                <span>·</span>
                                <span className="inline-flex items-center gap-0.5">
                                  <MapPin className="h-3 w-3" />{report.location}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                          <span className={cn("text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md", catMeta.iconBg, catMeta.color)}>
                            {CATEGORY_LABELS[report.category]}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {format(new Date(report.reportDate), "MMM d")}
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="py-14 text-center text-sm text-muted-foreground">
                No reports match the selected filters.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Missionaries list */}
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                Missionaries
              </h2>
            </div>
            <div>
              {missionaries?.slice(0, 6).map((m, i) => (
                <Link
                  key={m.id}
                  href={`/missionaries/${m.id}`}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3 hover:bg-[#F7F8FA] transition-colors group",
                    i > 0 ? "border-t border-border" : ""
                  )}
                >
                  <Avatar className="h-7 w-7 border border-border flex-shrink-0">
                    <AvatarImage src={m.avatarUrl || undefined} />
                    <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
                      {m.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {m.name}
                    </p>
                    {m.location && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                        <MapPin className="h-2.5 w-2.5" />{m.location}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

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
