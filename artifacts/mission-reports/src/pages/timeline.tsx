import { useGetTimeline, getGetTimelineQueryKey, ReportWithDetails } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CATEGORY_LABELS } from "@/lib/constants";
import { MapPin, Users, HeartHandshake, GraduationCap, Home, MoreHorizontal, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string; bg: string; iconBg: string }> = {
  church_planting: {
    icon: <Home className="h-5 w-5" />,
    color: "text-amber-700",
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
  },
  leadership_training: {
    icon: <Users className="h-5 w-5" />,
    color: "text-blue-700",
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
  },
  humanitarian_work: {
    icon: <HeartHandshake className="h-5 w-5" />,
    color: "text-rose-700",
    bg: "bg-rose-50",
    iconBg: "bg-rose-100",
  },
  education: {
    icon: <GraduationCap className="h-5 w-5" />,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
  },
  other: {
    icon: <MoreHorizontal className="h-5 w-5" />,
    color: "text-slate-600",
    bg: "bg-slate-50",
    iconBg: "bg-slate-100",
  },
};

function ReportRow({ report, index }: { report: ReportWithDetails; index: number }) {
  const { missionary, category, title, description, reportDate, location } = report;
  const meta = CATEGORY_META[category] ?? CATEGORY_META.other;
  const excerpt = description.length > 200 ? description.substring(0, 200) + "…" : description;
  const [, navigate] = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.05 }}
    >
      <div
        role="link"
        tabIndex={0}
        data-testid={`link-report-${report.id}`}
        onClick={() => navigate(`/reports/${report.id}`)}
        onKeyDown={(e) => e.key === "Enter" && navigate(`/reports/${report.id}`)}
        className="flex items-start gap-4 py-5 px-5 sm:px-6 hover:bg-slate-50 transition-colors group cursor-pointer"
      >
        <div className={cn("mt-1 flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center", meta.iconBg)}>
          <span className={meta.color}>{meta.icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <p className="flex-1 font-bold text-foreground text-[17px] leading-snug group-hover:text-primary transition-colors">
              {title}
            </p>
            <span className={cn(
              "flex-shrink-0 mt-0.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap",
              meta.bg, meta.color
            )}>
              {CATEGORY_LABELS[category]}
            </span>
          </div>

          <p className="text-[13.5px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
            {excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[12px] text-muted-foreground">
            <span>{format(new Date(reportDate), "MMM d, yyyy")}</span>
            <span className="text-border mx-0.5">·</span>
            <Link
              href={`/missionaries/${missionary.id}`}
              className="font-semibold text-foreground hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {missionary.name}
            </Link>
            {location && (
              <>
                <span className="text-border mx-0.5">·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{location}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Timeline() {
  const { data, isLoading, isError } = useGetTimeline(
    { limit: 30 },
    { query: { queryKey: getGetTimelineQueryKey({ limit: 30 }) } }
  );

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="bg-white border border-border rounded-xl overflow-hidden divide-y">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-4 px-6 py-5">
              <Skeleton className="h-11 w-11 rounded-full flex-shrink-0 mt-1" />
              <div className="flex-1 space-y-2.5">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive font-medium">Could not load reports.</p>
        <p className="text-muted-foreground text-sm mt-1">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-5">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2.5">
          <span className="inline-block w-1 h-5 bg-primary rounded-full" />
          Church Feed
        </h2>
      </div>

      {data.reports.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-border">
          <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="font-semibold text-foreground">No reports yet</p>
          <p className="text-muted-foreground text-sm mt-1">The field journal is waiting for its first entry.</p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden divide-y divide-border">
          {data.reports.map((report, index) => (
            <ReportRow key={report.id} report={report} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
