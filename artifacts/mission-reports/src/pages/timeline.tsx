import { useState } from "react";
import { useGetTimeline, getGetTimelineQueryKey, ReportWithDetails } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CATEGORY_LABELS } from "@/lib/constants";
import {
  MapPin, Users, HeartHandshake, GraduationCap,
  Home, MoreHorizontal, ChevronRight, BookOpen, CalendarDays, Globe
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CAT_META: Record<string, {
  icon: React.ReactNode;
  color: string;
  tagBg: string;
  tagColor: string;
}> = {
  church_planting: { icon: <Home className="h-3 w-3" />, color: "text-amber-700", tagBg: "bg-amber-50", tagColor: "text-amber-700" },
  leadership_training: { icon: <Users className="h-3 w-3" />, color: "text-blue-700", tagBg: "bg-blue-50", tagColor: "text-blue-700" },
  humanitarian_work: { icon: <HeartHandshake className="h-3 w-3" />, color: "text-rose-700", tagBg: "bg-rose-50", tagColor: "text-rose-700" },
  education: { icon: <GraduationCap className="h-3 w-3" />, color: "text-emerald-700", tagBg: "bg-emerald-50", tagColor: "text-emerald-700" },
  other: { icon: <MoreHorizontal className="h-3 w-3" />, color: "text-slate-600", tagBg: "bg-slate-50", tagColor: "text-slate-600" },
};

const PREVIEW_LIMIT = 140;

function ArticleCard({ report, index }: { report: ReportWithDetails; index: number }) {
  const [, navigate] = useLocation();
  const firstPhoto = (report as any).photos?.[0];
  const isVideo = firstPhoto && /\.(mp4|webm|ogg|mov)$/i.test(firstPhoto.url);
  const preview = report.description.length > PREVIEW_LIMIT
    ? report.description.slice(0, PREVIEW_LIMIT).trimEnd() + "…"
    : report.description;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.05 }}
      className="cursor-pointer group"
      onClick={() => navigate(`/reports/${report.id}`)}
    >
      {/* Image */}
      <div className="w-full aspect-[4/3] overflow-hidden bg-muted mb-3 rounded-sm">
        {firstPhoto?.url && !isVideo ? (
          <img
            src={firstPhoto.url}
            alt={firstPhoto.caption || report.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            loading="lazy"
          />
        ) : firstPhoto?.url && isVideo ? (
          <video src={firstPhoto.url} className="w-full h-full object-cover" muted />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Globe className="h-10 w-10 text-muted-foreground/20" />
          </div>
        )}
      </div>

      {/* Date */}
      <p className="text-[11.5px] text-muted-foreground mb-1.5">
        {format(new Date(report.reportDate), "M/d/yy")}
        {report.location && (
          <span className="ml-2 inline-flex items-center gap-0.5">
            <MapPin className="h-2.5 w-2.5" />{report.location}
          </span>
        )}
      </p>

      {/* Title */}
      <h2 className="text-[19px] font-bold text-foreground leading-tight mb-2 group-hover:text-primary transition-colors" style={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
        {report.title}
      </h2>

      {/* Excerpt */}
      <p className="text-[13px] text-foreground/70 leading-relaxed mb-2.5 line-clamp-3">
        {preview}
      </p>

      {/* Read More */}
      <span className="text-[13px] font-semibold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
        Read More
      </span>
    </motion.article>
  );
}

function Sidebar({ reports }: { reports: ReportWithDetails[] }) {
  const seen = new Set<number>();
  const missionaries = reports
    .map(r => r.missionary)
    .filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true; });

  const reportCounts: Record<number, number> = {};
  reports.forEach(r => { reportCounts[r.missionaryId] = (reportCounts[r.missionaryId] || 0) + 1; });

  return (
    <aside className="hidden lg:block w-72 flex-shrink-0">
      <div className="sticky top-[72px] space-y-5 max-h-[calc(100vh-96px)] overflow-y-auto pr-1">

        {/* Global Partners */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Global Partners
            </h3>
          </div>
          <div className="p-3 grid grid-cols-3 gap-2">
            {missionaries.map(m => (
              <Link key={m.id} href={`/missionaries/${m.id}`}>
                <div className="group flex flex-col items-center gap-1.5 cursor-pointer">
                  <div className="w-full aspect-square rounded-xl overflow-hidden border-2 border-transparent group-hover:border-primary transition-all duration-150 bg-muted">
                    {m.avatarUrl ? (
                      <img
                        src={m.avatarUrl}
                        alt={m.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <span className="text-lg font-bold text-primary">{m.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10.5px] font-semibold text-foreground group-hover:text-primary transition-colors text-center leading-tight truncate w-full">
                    {m.name.split(" ")[0]}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent News */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Recent News
            </h3>
          </div>
          <div className="divide-y divide-border">
            {reports.slice(0, 6).map(r => {
              const firstPhoto = (r as any).photos?.[0];
              return (
                <Link key={r.id} href={`/reports/${r.id}`}>
                  <div className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors group cursor-pointer">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border/50">
                      {firstPhoto?.url && !/\.(mp4|webm|ogg|mov)$/i.test(firstPhoto.url) ? (
                        <img
                          src={firstPhoto.url}
                          alt={r.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/8">
                          <Globe className="h-5 w-5 text-primary/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {r.title}
                      </p>
                      <p className="text-[10.5px] text-muted-foreground mt-1">
                        {r.missionary.name} · {format(new Date(r.reportDate), "MMM d")}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
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
      <div className="flex gap-6 items-start">
        <div className="flex-1 space-y-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <Skeleton className="w-full h-52" />
              <div className="p-6 space-y-3">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden lg:block w-72 space-y-5">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
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

      {/* Sidebar */}
      <Sidebar reports={allReports} />

      {/* Main feed — 2-col newspaper grid */}
      <div className="flex-1 min-w-0">
        {allReports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-border py-24 text-center shadow-sm">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
            <p className="font-semibold text-foreground text-sm">No reports yet</p>
            <p className="text-muted-foreground text-xs mt-1">Check back soon for field updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10">
            {allReports.map((report, index) => (
              <ArticleCard key={report.id} report={report} index={index} />
            ))}
          </div>
        )}

        {allReports.length > 0 && (
          <p className="text-center text-[11px] text-muted-foreground pt-8">
            {allReports.length} report{allReports.length !== 1 ? "s" : ""} total
          </p>
        )}
      </div>
    </div>
  );
}
