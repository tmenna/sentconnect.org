import { useGetTimeline, getGetTimelineQueryKey, ReportWithDetails } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CATEGORY_LABELS } from "@/lib/constants";
import { MapPin, Users, HeartHandshake, GraduationCap, Home, MoreHorizontal, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useState } from "react";

const CATEGORY_META: Record<string, {
  icon: React.ReactNode;
  color: string;
  iconBg: string;
  tagBg: string;
  tagColor: string;
}> = {
  church_planting: {
    icon: <Home className="h-4.5 w-4.5" />,
    color: "text-amber-700",
    iconBg: "bg-amber-100",
    tagBg: "bg-amber-50",
    tagColor: "text-amber-700",
  },
  leadership_training: {
    icon: <Users className="h-4.5 w-4.5" />,
    color: "text-blue-700",
    iconBg: "bg-blue-100",
    tagBg: "bg-blue-50",
    tagColor: "text-blue-700",
  },
  humanitarian_work: {
    icon: <HeartHandshake className="h-4.5 w-4.5" />,
    color: "text-rose-700",
    iconBg: "bg-rose-100",
    tagBg: "bg-rose-50",
    tagColor: "text-rose-700",
  },
  education: {
    icon: <GraduationCap className="h-4.5 w-4.5" />,
    color: "text-emerald-700",
    iconBg: "bg-emerald-100",
    tagBg: "bg-emerald-50",
    tagColor: "text-emerald-700",
  },
  other: {
    icon: <MoreHorizontal className="h-4.5 w-4.5" />,
    color: "text-slate-600",
    iconBg: "bg-slate-100",
    tagBg: "bg-slate-50",
    tagColor: "text-slate-600",
  },
};

const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "church_planting", label: "Church Planting" },
  { key: "leadership_training", label: "Leadership" },
  { key: "humanitarian_work", label: "Humanitarian" },
  { key: "education", label: "Education" },
  { key: "other", label: "Other" },
];

function ReportRow({ report, index }: { report: ReportWithDetails; index: number }) {
  const { missionary, category, title, description, reportDate, location } = report;
  const meta = CATEGORY_META[category] ?? CATEGORY_META.other;
  const excerpt = description.length > 180 ? description.substring(0, 180) + "…" : description;
  const [, navigate] = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="border-b border-border last:border-b-0"
    >
      <div
        role="link"
        tabIndex={0}
        data-testid={`link-report-${report.id}`}
        onClick={() => navigate(`/reports/${report.id}`)}
        onKeyDown={(e) => e.key === "Enter" && navigate(`/reports/${report.id}`)}
        className="flex items-start gap-4 py-5 px-5 sm:px-6 hover:bg-[#F7F8FA] transition-colors group cursor-pointer"
      >
        <div className={cn("mt-0.5 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center", meta.iconBg)}>
          <span className={meta.color}>{meta.icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <p className="font-semibold text-foreground text-[15px] leading-snug group-hover:text-primary transition-colors flex-1">
              {title}
            </p>
            <span className={cn(
              "flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md whitespace-nowrap",
              meta.tagBg, meta.tagColor
            )}>
              {CATEGORY_LABELS[category]}
            </span>
          </div>

          <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
            {excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11.5px] text-muted-foreground">
            <span>{format(new Date(reportDate), "MMM d, yyyy")}</span>
            <span className="text-border">·</span>
            <Link
              href={`/missionaries/${missionary.id}`}
              className="font-medium text-foreground/80 hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {missionary.name}
            </Link>
            {location && (
              <>
                <span className="text-border">·</span>
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
  const [activeFilter, setActiveFilter] = useState("all");

  const { data, isLoading, isError } = useGetTimeline(
    { limit: 40 },
    { query: { queryKey: getGetTimelineQueryKey({ limit: 40 }) } }
  );

  const filtered = activeFilter === "all"
    ? (data?.reports ?? [])
    : (data?.reports ?? []).filter(r => r.category === activeFilter);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-5">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-7 w-24 rounded-full" />)}
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-start gap-4 px-6 py-5 border-b border-border last:border-b-0">
              <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-4/5" />
                <Skeleton className="h-3 w-1/3 mt-1" />
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
        <p className="text-destructive font-medium text-sm">Could not load reports.</p>
        <p className="text-muted-foreground text-xs mt-1">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setActiveFilter(opt.key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-colors",
              activeFilter === opt.key
                ? "bg-primary text-white shadow-sm"
                : "bg-white border border-border text-muted-foreground hover:text-foreground hover:border-border/60"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-border py-20 text-center shadow-sm">
          <BookOpen className="h-9 w-9 mx-auto text-muted-foreground/25 mb-3" />
          <p className="font-semibold text-foreground text-sm">No reports yet</p>
          <p className="text-muted-foreground text-xs mt-1">The field journal is waiting for its first entry.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          {filtered.map((report, index) => (
            <ReportRow key={report.id} report={report} index={index} />
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-center text-[11px] text-muted-foreground mt-4">
          {filtered.length} report{filtered.length !== 1 ? "s" : ""}
          {activeFilter !== "all" ? ` in ${CATEGORY_LABELS[activeFilter]}` : " total"}
        </p>
      )}
    </div>
  );
}
