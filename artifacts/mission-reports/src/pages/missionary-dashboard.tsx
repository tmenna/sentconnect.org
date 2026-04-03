import { useAuth } from "@/components/auth-provider";
import { useGetUserReports, getGetUserReportsQueryKey } from "@workspace/api-client-react";
import { Link, Redirect } from "wouter";
import {
  Home, Users, HeartHandshake, GraduationCap, MoreHorizontal,
  MapPin, Building, PlusCircle, ArrowRight, Calendar, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CATEGORY_LABELS } from "@/lib/constants";
import { motion } from "framer-motion";

const CATEGORIES = [
  {
    key: "church_planting",
    label: "Church Planting",
    icon: Home,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconBg: "bg-amber-100",
    desc: "New congregations & outreach",
  },
  {
    key: "leadership_training",
    label: "Leadership Training",
    icon: Users,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    desc: "Equipping local leaders",
  },
  {
    key: "humanitarian_work",
    label: "Humanitarian Work",
    icon: HeartHandshake,
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    iconBg: "bg-rose-100",
    desc: "Serving practical needs",
  },
  {
    key: "education",
    label: "Education",
    icon: GraduationCap,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    iconBg: "bg-emerald-100",
    desc: "Teaching & training programs",
  },
  {
    key: "other",
    label: "Other",
    icon: MoreHorizontal,
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
    iconBg: "bg-slate-100",
    desc: "General ministry updates",
  },
];

export default function MissionaryDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: reports } = useGetUserReports(user?.id ?? 0, {
    query: { enabled: !!user?.id, queryKey: getGetUserReportsQueryKey(user?.id ?? 0) }
  });

  if (isLoading) return <div className="text-center py-12 animate-pulse text-muted-foreground">Loading...</div>;
  if (!isAuthenticated || !user) return <Redirect href="/login" />;
  if (user.role !== "missionary") return <Redirect href="/admin" />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const countByCategory: Record<string, number> = {};
  reports?.forEach(r => {
    countByCategory[r.category] = (countByCategory[r.category] || 0) + 1;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-7"
      >
        <p className="text-sm text-muted-foreground font-medium">{greeting}</p>
        <h1 className="text-2xl font-bold text-foreground mt-0.5">{user.name}</h1>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm">
          {user.location ? (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              Serving in{" "}
              <strong className="text-foreground font-semibold">{user.location}</strong>
            </span>
          ) : (
            <Link href="/profile">
              <span className="flex items-center gap-1.5 text-primary text-xs border border-dashed border-primary/40 rounded-full px-3 py-1 hover:bg-primary/5 transition-colors cursor-pointer">
                <MapPin className="h-3.5 w-3.5" /> Add field location
              </span>
            </Link>
          )}

          {user.organization ? (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Building className="h-4 w-4 text-primary" />
              Sent from{" "}
              <strong className="text-foreground font-semibold">{user.organization}</strong>
            </span>
          ) : (
            <Link href="/profile">
              <span className="flex items-center gap-1.5 text-primary text-xs border border-dashed border-primary/40 rounded-full px-3 py-1 hover:bg-primary/5 transition-colors cursor-pointer">
                <Building className="h-3.5 w-3.5" /> Add sending church
              </span>
            </Link>
          )}

          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4 text-muted-foreground/50" />
            {reports?.length ?? 0} report{(reports?.length ?? 0) !== 1 ? "s" : ""} submitted
          </span>
        </div>
      </motion.div>

      <div>
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2.5">
          <span className="inline-block w-1 h-5 bg-primary rounded-full" />
          File a Report
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            const count = countByCategory[cat.key] || 0;
            return (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.06 }}
              >
                <Link href={`/submit?category=${cat.key}`}>
                  <div className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border bg-white cursor-pointer group",
                    "hover:shadow-md hover:-translate-y-0.5 transition-all duration-150",
                    cat.border
                  )}>
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", cat.iconBg)}>
                      <Icon className={cn("h-5 w-5", cat.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-[14px]">{cat.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{cat.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {count > 0 && (
                        <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full", cat.bg, cat.color)}>
                          {count}
                        </span>
                      )}
                      <PlusCircle className={cn("h-5 w-5 group-hover:scale-110 transition-transform", cat.color)} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2.5">
            <span className="inline-block w-1 h-5 bg-primary rounded-full" />
            Your Reports
          </h2>
          <Link href="/feed">
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground h-8">
              Church feed <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {!reports || reports.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-xl border border-dashed border-border">
            <p className="font-semibold text-foreground">No reports yet</p>
            <p className="text-sm text-muted-foreground mt-1">Choose a category above to file your first report.</p>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl overflow-hidden divide-y divide-border">
            {reports.slice(0, 6).map((report, index) => {
              const meta = CATEGORIES.find(c => c.key === report.category) ?? CATEGORIES[4];
              const Icon = meta.icon;
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Link
                    href={`/reports/${report.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors group"
                    data-testid={`link-my-report-${report.id}`}
                  >
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", meta.iconBg)}>
                      <Icon className={cn("h-4 w-4", meta.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                        {report.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(report.reportDate), "MMM d, yyyy")}
                        {" · "}{CATEGORY_LABELS[report.category]}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
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
