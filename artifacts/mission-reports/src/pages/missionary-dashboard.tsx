import { useAuth } from "@/components/auth-provider";
import { useGetUserReports, getGetUserReportsQueryKey } from "@workspace/api-client-react";
import { Link, Redirect } from "wouter";
import {
  Home, Users, HeartHandshake, GraduationCap, MoreHorizontal,
  MapPin, Building, ChevronRight, FileText, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CATEGORY_LABELS } from "@/lib/constants";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  {
    key: "church_planting",
    label: "Church Planting",
    icon: Home,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200/80",
    iconBg: "bg-amber-100",
    dot: "bg-amber-400",
    desc: "New congregations & outreach",
  },
  {
    key: "leadership_training",
    label: "Leadership Training",
    icon: Users,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200/80",
    iconBg: "bg-blue-100",
    dot: "bg-blue-400",
    desc: "Equipping local leaders",
  },
  {
    key: "humanitarian_work",
    label: "Humanitarian Work",
    icon: HeartHandshake,
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200/80",
    iconBg: "bg-rose-100",
    dot: "bg-rose-400",
    desc: "Serving practical needs",
  },
  {
    key: "education",
    label: "Education",
    icon: GraduationCap,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200/80",
    iconBg: "bg-emerald-100",
    dot: "bg-emerald-400",
    desc: "Teaching & training programs",
  },
  {
    key: "other",
    label: "Other",
    icon: MoreHorizontal,
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200/80",
    iconBg: "bg-slate-100",
    dot: "bg-slate-400",
    desc: "General ministry updates",
  },
];

export default function MissionaryDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: reports } = useGetUserReports(user?.id ?? 0, {
    query: { enabled: !!user?.id, queryKey: getGetUserReportsQueryKey(user?.id ?? 0) }
  });

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Redirect href="/login" />;
  if (user.role !== "missionary") return <Redirect href="/admin" />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const countByCategory: Record<string, number> = {};
  reports?.forEach(r => { countByCategory[r.category] = (countByCategory[r.category] || 0) + 1; });

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Identity bar */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-xl border border-border p-5 flex items-start gap-4 shadow-sm"
      >
        <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-lg flex-shrink-0 border border-primary/20">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{greeting}</p>
          <h1 className="text-lg font-semibold text-foreground mt-0.5 tracking-tight">{user.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            {user.location ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Serving in <strong className="text-foreground font-medium ml-0.5">{user.location}</strong>
              </span>
            ) : (
              <Link href="/profile">
                <span className="inline-flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer">
                  <Plus className="h-3 w-3" /> Add field location
                </span>
              </Link>
            )}
            {user.organization ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building className="h-3.5 w-3.5 text-primary" />
                Sent from <strong className="text-foreground font-medium ml-0.5">{user.organization}</strong>
              </span>
            ) : (
              <Link href="/profile">
                <span className="inline-flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer">
                  <Plus className="h-3 w-3" /> Add sending church
                </span>
              </Link>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 text-right hidden sm:block">
          <p className="text-2xl font-bold text-foreground">{reports?.length ?? 0}</p>
          <p className="text-[11px] text-muted-foreground">Reports</p>
        </div>
      </motion.div>

      {/* Category grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">File a Report</h2>
          <span className="text-xs text-muted-foreground">Choose a ministry area</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            const count = countByCategory[cat.key] || 0;
            return (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                <Link href={`/submit?category=${cat.key}`}>
                  <div className={cn(
                    "flex items-center gap-3.5 p-4 rounded-xl border bg-white cursor-pointer group",
                    "hover:shadow-md hover:-translate-y-px transition-all duration-150",
                    cat.border
                  )}>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", cat.iconBg)}>
                      <Icon className={cn("h-5 w-5", cat.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-[13.5px] leading-tight">{cat.label}</p>
                      <p className="text-[11.5px] text-muted-foreground mt-0.5">{cat.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {count > 0 && (
                        <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", cat.bg, cat.color)}>
                          {count}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent reports */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Your Reports</h2>
          <Link href="/feed">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground gap-1">
              Church feed <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        {!reports || reports.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-border py-14 text-center">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
              <FileText className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <p className="font-semibold text-foreground text-sm">No reports yet</p>
            <p className="text-xs text-muted-foreground mt-1">Pick a ministry area above to file your first report.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            {reports.slice(0, 6).map((report, index) => {
              const meta = CATEGORIES.find(c => c.key === report.category) ?? CATEGORIES[4];
              const Icon = meta.icon;
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.04 }}
                  className={index > 0 ? "border-t border-border" : ""}
                >
                  <Link
                    href={`/reports/${report.id}`}
                    className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-[#F7F8FA] transition-colors group"
                    data-testid={`link-my-report-${report.id}`}
                  >
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", meta.iconBg)}>
                      <Icon className={cn("h-3.5 w-3.5", meta.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-colors">
                        {report.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {format(new Date(report.reportDate), "MMM d, yyyy")} · {CATEGORY_LABELS[report.category]}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
