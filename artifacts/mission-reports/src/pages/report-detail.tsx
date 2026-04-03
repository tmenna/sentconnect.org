import { useGetReport, getGetReportQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CATEGORY_LABELS } from "@/lib/constants";
import { MapPin, CalendarDays, ArrowLeft, Home, Users, HeartHandshake, GraduationCap, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const CAT_META: Record<string, { icon: React.ReactNode; color: string; bg: string; iconBg: string }> = {
  church_planting: { icon: <Home className="h-4 w-4" />, color: "text-amber-700", bg: "bg-amber-50", iconBg: "bg-amber-100" },
  leadership_training: { icon: <Users className="h-4 w-4" />, color: "text-blue-700", bg: "bg-blue-50", iconBg: "bg-blue-100" },
  humanitarian_work: { icon: <HeartHandshake className="h-4 w-4" />, color: "text-rose-700", bg: "bg-rose-50", iconBg: "bg-rose-100" },
  education: { icon: <GraduationCap className="h-4 w-4" />, color: "text-emerald-700", bg: "bg-emerald-50", iconBg: "bg-emerald-100" },
  other: { icon: <MoreHorizontal className="h-4 w-4" />, color: "text-slate-600", bg: "bg-slate-50", iconBg: "bg-slate-100" },
};

export default function ReportDetail() {
  const params = useParams<{ id: string }>();
  const reportId = Number(params.id);

  const { data: report, isLoading, isError } = useGetReport(reportId, {
    query: { enabled: !!reportId, queryKey: getGetReportQueryKey(reportId) }
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <Skeleton className="h-4 w-24" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-semibold text-foreground">Report not found</p>
        <Link href="/feed" className="mt-3 inline-block text-sm text-primary hover:underline">
          Back to Feed
        </Link>
      </div>
    );
  }

  const { missionary, photos, category, title, description, reportDate, location } = report;
  const meta = CAT_META[category] ?? CAT_META.other;

  return (
    <article className="max-w-2xl mx-auto py-6">

      <Link
        href="/feed"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        data-testid="link-back-timeline"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Church Feed
      </Link>

      {/* Category badge */}
      <div className="mb-4">
        <span className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wide",
          meta.bg, meta.color
        )}>
          <span>{meta.icon}</span>
          {CATEGORY_LABELS[category]}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-[1.75rem] font-bold text-foreground leading-tight tracking-tight mb-5">
        {title}
      </h1>

      {/* Meta bar */}
      <div className="flex flex-wrap items-center gap-3 text-[12.5px] text-muted-foreground mb-6 pb-6 border-b border-border">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          {format(new Date(reportDate), "MMMM d, yyyy")}
        </span>
        {location && (
          <>
            <span className="text-border">·</span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {location}
            </span>
          </>
        )}
      </div>

      {/* Missionary byline */}
      <Link
        href={`/missionaries/${missionary.id}`}
        className="flex items-center gap-3 mb-8 group w-fit"
      >
        <Avatar className="h-10 w-10 border border-border">
          <AvatarImage src={missionary.avatarUrl || undefined} alt={missionary.name} />
          <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
            {missionary.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
            {missionary.name}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {missionary.organization || "Missionary"}
          </p>
        </div>
      </Link>

      {/* Hero photo */}
      {photos && photos.length > 0 && (
        <figure className="mb-8 rounded-xl overflow-hidden bg-muted shadow-sm">
          <img
            src={photos[0].url}
            alt={photos[0].caption || title}
            className="w-full h-auto object-cover max-h-[500px]"
          />
          {photos[0].caption && (
            <figcaption className="px-4 py-2.5 text-[12px] text-muted-foreground italic border-t border-border bg-muted/40">
              {photos[0].caption}
            </figcaption>
          )}
        </figure>
      )}

      {/* Body */}
      <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-primary prose-p:text-foreground prose-p:leading-relaxed prose-p:text-[14.5px]">
        {description.split('\n').map((paragraph, i) =>
          paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
        )}
      </div>

      {/* Additional photos */}
      {photos && photos.length > 1 && (
        <section className="mt-10 pt-8 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Photo Gallery</h3>
          <div className="grid grid-cols-2 gap-3">
            {photos.slice(1).map((photo) => (
              <figure key={photo.id} className="rounded-lg overflow-hidden bg-muted aspect-video">
                <img
                  src={photo.url}
                  alt={photo.caption || "Gallery image"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {photo.caption && (
                  <figcaption className="px-2 py-1.5 text-[11px] text-muted-foreground italic bg-muted/40">
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Back */}
      <div className="mt-12 pt-8 border-t border-border">
        <Link
          href="/feed"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Church Feed
        </Link>
      </div>
    </article>
  );
}
