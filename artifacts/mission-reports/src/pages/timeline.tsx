import { useGetTimeline, getGetTimelineQueryKey, ReportWithDetails, useGetCurrentUser } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CATEGORY_LABELS } from "@/lib/constants";
import { MapPin, Users, HeartHandshake, GraduationCap, Home, MoreHorizontal, BookOpen, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  church_planting: {
    icon: <Home className="h-4 w-4" />,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  leadership_training: {
    icon: <Users className="h-4 w-4" />,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  humanitarian_work: {
    icon: <HeartHandshake className="h-4 w-4" />,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  education: {
    icon: <GraduationCap className="h-4 w-4" />,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  other: {
    icon: <MoreHorizontal className="h-4 w-4" />,
    color: "text-slate-500",
    bg: "bg-slate-50",
  },
};

function ReportRow({ report, index }: { report: ReportWithDetails; index: number }) {
  const { missionary, category, title, description, reportDate, location } = report;
  const meta = CATEGORY_META[category] ?? CATEGORY_META.other;
  const excerpt = description.length > 120 ? description.substring(0, 120) + "…" : description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
    >
      <Link
        href={`/reports/${report.id}`}
        data-testid={`link-report-${report.id}`}
        className="flex items-start gap-4 py-4 px-4 sm:px-5 hover:bg-muted/40 transition-colors group rounded-sm"
      >
        {/* Icon */}
        <div className={cn("mt-0.5 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center", meta.bg, meta.color)}>
          {meta.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-[15px] leading-snug group-hover:text-primary transition-colors truncate">
            {title}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{excerpt}</p>
          <p className="text-xs text-muted-foreground/70 mt-1.5">
            {format(new Date(reportDate), "MMM d, yyyy")}
            {" · by "}
            <span className="font-medium text-muted-foreground">{missionary.name}</span>
            {location && (
              <span className="ml-2 inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {location}
              </span>
            )}
          </p>
        </div>

        {/* Category tag */}
        <span
          className={cn(
            "flex-shrink-0 mt-0.5 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full",
            meta.bg,
            meta.color
          )}
        >
          {CATEGORY_LABELS[category]}
        </span>
      </Link>
    </motion.div>
  );
}

export default function Timeline() {
  const { data, isLoading, isError } = useGetTimeline(
    { limit: 20 },
    { query: { queryKey: getGetTimelineQueryKey({ limit: 20 }) } }
  );
  const { data: currentUser } = useGetCurrentUser();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
        <div className="bg-card border border-border rounded-lg overflow-hidden divide-y divide-border">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-4 px-5 py-4">
              <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full flex-shrink-0" />
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
      {/* Section header — PWE-style with left accent bar */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-3">
          <span className="inline-block w-1 h-6 bg-primary rounded-full" />
          Field Reports
        </h2>
        {currentUser?.role === "missionary" && (
          <Link href="/submit">
            <Button size="sm" className="gap-1.5 rounded-md" data-testid="link-nav-submit-inline">
              <PlusCircle className="h-4 w-4" />
              Add Entry
            </Button>
          </Link>
        )}
      </div>

      {data.reports.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-lg border border-border border-dashed">
          <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="font-medium text-foreground">No reports yet</p>
          <p className="text-muted-foreground text-sm mt-1">The field journal is waiting for its first entry.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden divide-y divide-border">
          {data.reports.map((report, index) => (
            <ReportRow key={report.id} report={report} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
