import { useState } from "react";
import { useGetTimeline, getGetTimelineQueryKey, ReportWithDetails } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CATEGORY_LABELS } from "@/lib/constants";
import {
  MapPin, Users, HeartHandshake, GraduationCap,
  Home, MoreHorizontal, ChevronRight, BookOpen, CalendarDays
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CAT_META: Record<string, {
  icon: React.ReactNode;
  color: string;
  iconBg: string;
  tagBg: string;
  tagColor: string;
}> = {
  church_planting: {
    icon: <Home className="h-3.5 w-3.5" />,
    color: "text-amber-700",
    iconBg: "bg-amber-100",
    tagBg: "bg-amber-50",
    tagColor: "text-amber-700",
  },
  leadership_training: {
    icon: <Users className="h-3.5 w-3.5" />,
    color: "text-blue-700",
    iconBg: "bg-blue-100",
    tagBg: "bg-blue-50",
    tagColor: "text-blue-700",
  },
  humanitarian_work: {
    icon: <HeartHandshake className="h-3.5 w-3.5" />,
    color: "text-rose-700",
    iconBg: "bg-rose-100",
    tagBg: "bg-rose-50",
    tagColor: "text-rose-700",
  },
  education: {
    icon: <GraduationCap className="h-3.5 w-3.5" />,
    color: "text-emerald-700",
    iconBg: "bg-emerald-100",
    tagBg: "bg-emerald-50",
    tagColor: "text-emerald-700",
  },
  other: {
    icon: <MoreHorizontal className="h-3.5 w-3.5" />,
    color: "text-slate-600",
    iconBg: "bg-slate-100",
    tagBg: "bg-slate-50",
    tagColor: "text-slate-600",
  },
};

const TEXT_LIMIT = 300;

function PostCard({ report, index }: { report: ReportWithDetails; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [, navigate] = useLocation();
  const meta = CAT_META[report.category] ?? CAT_META.other;
  const isLong = report.description.length > TEXT_LIMIT;
  const displayText = expanded || !isLong
    ? report.description
    : report.description.slice(0, TEXT_LIMIT);

  const firstPhoto = (report as any).photos?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start gap-3 mb-3">
            <Link href={`/missionaries/${report.missionary.id}`} onClick={(e) => e.stopPropagation()}>
              <Avatar className="h-10 w-10 border border-border cursor-pointer flex-shrink-0">
                <AvatarImage src={report.missionary.avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {report.missionary.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <Link
                href={`/missionaries/${report.missionary.id}`}
                className="font-semibold text-foreground hover:text-primary transition-colors text-[14px]"
                onClick={(e) => e.stopPropagation()}
              >
                {report.missionary.name}
              </Link>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[11.5px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {format(new Date(report.reportDate), "MMM d, yyyy")}
                </span>
                {report.location && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{report.location}
                    </span>
                  </>
                )}
              </div>
            </div>

            <span className={cn(
              "flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md",
              meta.tagBg, meta.tagColor
            )}>
              {meta.icon}
              {CATEGORY_LABELS[report.category]}
            </span>
          </div>

          {/* Title */}
          <h2
            className="font-bold text-foreground text-[17px] leading-snug mb-2.5 cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate(`/reports/${report.id}`)}
            data-testid={`link-report-${report.id}`}
          >
            {report.title}
          </h2>

          {/* Body text */}
          <div className="text-[13.5px] text-foreground/75 leading-relaxed space-y-1.5">
            {displayText.split('\n').map((para, i) =>
              para.trim() ? <p key={i}>{para}</p> : null
            )}
            {isLong && (
              <button
                className="text-primary font-medium text-sm hover:underline"
                onClick={() => setExpanded(v => !v)}
              >
                {expanded ? "See less" : "See more"}
              </button>
            )}
          </div>
        </div>

        {/* Media (photo or video) */}
        {firstPhoto?.url && (
          <div
            className="cursor-pointer border-t border-border"
            onClick={() => navigate(`/reports/${report.id}`)}
          >
            {/\.(mp4|webm|ogg|mov)$/i.test(firstPhoto.url) ? (
              <video
                src={firstPhoto.url}
                controls
                className="w-full max-h-[360px] bg-black"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img
                src={firstPhoto.url}
                alt={firstPhoto.caption || report.title}
                className="w-full object-cover max-h-[360px]"
                loading="lazy"
              />
            )}
            {firstPhoto.caption && (
              <p className="px-5 py-2 text-[11.5px] text-muted-foreground italic border-t border-border bg-muted/30">
                {firstPhoto.caption}
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border">
          <Link
            href={`/reports/${report.id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Read full report
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function MissionarySidebar({ reports }: { reports: ReportWithDetails[] }) {
  const seen = new Set<number>();
  const missionaries = reports
    .map(r => r.missionary)
    .filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true; });

  const reportCounts: Record<number, number> = {};
  reports.forEach(r => { reportCounts[r.missionaryId] = (reportCounts[r.missionaryId] || 0) + 1; });

  return (
    <aside className="hidden lg:block">
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden sticky top-[72px] max-h-[calc(100vh-96px)] overflow-y-auto">
        <div className="px-4 py-3.5 border-b border-border">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Field Team
          </h3>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {missionaries.map(m => (
            <Link key={m.id} href={`/missionaries/${m.id}`}>
              <div className="group flex flex-col items-center gap-2 cursor-pointer">
                <div className="w-full aspect-square rounded-xl overflow-hidden border-2 border-transparent group-hover:border-primary transition-all duration-150 shadow-sm bg-muted">
                  {m.avatarUrl ? (
                    <img
                      src={m.avatarUrl}
                      alt={m.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <span className="text-2xl font-bold text-primary">
                        {m.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-[12px] font-semibold text-foreground group-hover:text-primary transition-colors leading-tight truncate w-full">
                    {m.name.split(" ")[0]}
                  </p>
                  <p className="text-[10.5px] text-muted-foreground mt-0.5">
                    {reportCounts[m.id] ?? 0} report{reportCounts[m.id] !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function Timeline() {
  const { data, isLoading, isError } = useGetTimeline(
    { limit: 40 },
    { query: { queryKey: getGetTimelineQueryKey({ limit: 40 }) } }
  );

  const allReports = data?.reports ?? [];

  if (isLoading) {
    return (
      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-border shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
        <div className="hidden lg:block w-64">
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive font-medium text-sm">Could not load reports.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 items-start">

      {/* Main feed */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* Posts */}
        {allReports.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-border py-20 text-center shadow-sm">
            <BookOpen className="h-9 w-9 mx-auto text-muted-foreground/25 mb-3" />
            <p className="font-semibold text-foreground text-sm">No reports yet</p>
            <p className="text-muted-foreground text-xs mt-1">Check back soon for field updates.</p>
          </div>
        ) : (
          allReports.map((report, index) => (
            <PostCard key={report.id} report={report} index={index} />
          ))
        )}

        {allReports.length > 0 && (
          <p className="text-center text-[11px] text-muted-foreground py-2">
            {allReports.length} report{allReports.length !== 1 ? "s" : ""} total
          </p>
        )}
      </div>

      {/* Missionary sidebar */}
      <div className="w-56 flex-shrink-0">
        <MissionarySidebar reports={allReports} />
      </div>
    </div>
  );
}
