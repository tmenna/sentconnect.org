import { useGetReport, getGetReportQueryKey, useGetCurrentUser } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/constants";
import { MapPin, Users, Heart, Target, CalendarDays, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function ReportDetail() {
  const params = useParams<{ id: string }>();
  const reportId = Number(params.id);
  
  const { data: report, isLoading, isError } = useGetReport(reportId, {
    query: {
      enabled: !!reportId,
      queryKey: getGetReportQueryKey(reportId)
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-8 py-8">
        <div className="h-8 w-24 bg-muted rounded"></div>
        <div className="space-y-4">
          <div className="h-12 w-3/4 bg-muted rounded"></div>
          <div className="flex gap-4">
            <div className="h-12 w-12 bg-muted rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded"></div>
              <div className="h-3 w-24 bg-muted rounded"></div>
            </div>
          </div>
        </div>
        <div className="h-64 w-full bg-muted rounded-lg"></div>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-serif text-destructive">Report not found</h2>
        <Link href="/" className="mt-4 inline-block text-primary hover:underline">Return to timeline</Link>
      </div>
    );
  }

  const { missionary, photos, category, title, description, reportDate, location, peopleReached, leadersTrainer, communitiesServed } = report;

  return (
    <article className="max-w-3xl mx-auto py-6 sm:py-10 bg-background">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group" data-testid="link-back-timeline">
        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Timeline
      </Link>

      <header className="space-y-6 sm:space-y-8 mb-10 sm:mb-14">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={CATEGORY_COLORS[category]} className="uppercase text-[10px] tracking-widest font-bold px-3 py-1">
            {CATEGORY_LABELS[category]}
          </Badge>
          <div className="flex items-center text-[11px] text-muted-foreground gap-3 uppercase tracking-wider font-medium">
            <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {format(new Date(reportDate), "MMM d, yyyy")}</span>
            {location && (
              <>
                <span className="opacity-50">·</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {location}</span>
              </>
            )}
          </div>
        </div>

        <h1 className="text-3xl sm:text-[2.75rem] font-serif font-extrabold leading-tight text-foreground">{title}</h1>

        <Link href={`/missionaries/${missionary.id}`} className="flex items-center gap-4 group w-fit hover:bg-muted/50 p-2 -ml-2 rounded-lg transition-colors">
          <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-border/50">
            <AvatarImage src={missionary.avatarUrl || undefined} alt={missionary.name} />
            <AvatarFallback className="font-serif bg-primary/10 text-primary font-bold">{missionary.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">{missionary.name}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-0.5">{missionary.organization || 'Missionary'}</div>
          </div>
        </Link>
      </header>

      {(peopleReached || leadersTrainer || communitiesServed) && (
        <section className="my-10 p-6 bg-card rounded-xl border border-border shadow-sm">
          <h3 className="text-sm font-bold tracking-wider uppercase text-muted-foreground mb-6 text-center">Measured Impact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-border">
            {peopleReached !== null && peopleReached !== undefined && (
              <div className="flex flex-col items-center pt-4 sm:pt-0 first:pt-0">
                <div className="p-3 bg-primary/10 rounded-full text-primary mb-3"><Users className="h-5 w-5" /></div>
                <div className="text-3xl font-serif font-bold text-foreground">{peopleReached.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">People Reached</div>
              </div>
            )}
            {leadersTrainer !== null && leadersTrainer !== undefined && (
              <div className="flex flex-col items-center pt-4 sm:pt-0 first:pt-0">
                <div className="p-3 bg-primary/10 rounded-full text-primary mb-3"><Target className="h-5 w-5" /></div>
                <div className="text-3xl font-serif font-bold text-foreground">{leadersTrainer.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">Leaders Trained</div>
              </div>
            )}
            {communitiesServed !== null && communitiesServed !== undefined && (
              <div className="flex flex-col items-center pt-4 sm:pt-0 first:pt-0">
                <div className="p-3 bg-primary/10 rounded-full text-primary mb-3"><Heart className="h-5 w-5" /></div>
                <div className="text-3xl font-serif font-bold text-foreground">{communitiesServed.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">Communities Served</div>
              </div>
            )}
          </div>
        </section>
      )}

      {photos && photos.length > 0 && (
        <figure className="my-10 relative rounded-xl overflow-hidden bg-muted shadow-sm">
          <img 
            src={photos[0].url} 
            alt={photos[0].caption || title} 
            className="w-full h-auto object-cover max-h-[600px]"
          />
          {photos[0].caption && (
            <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12 text-white text-sm">
              {photos[0].caption}
            </figcaption>
          )}
        </figure>
      )}

      <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-primary prose-p:leading-relaxed">
        {description.split('\n').map((paragraph, i) => 
          paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
        )}
      </div>

      {photos && photos.length > 1 && (
        <section className="mt-16 pt-10 border-t border-border">
          <h3 className="text-xl font-serif font-semibold mb-6 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            Photo Gallery
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photos.slice(1).map((photo) => (
              <figure key={photo.id} className="relative rounded-lg overflow-hidden bg-muted aspect-square sm:aspect-auto">
                <img src={photo.url} alt={photo.caption || "Gallery image"} className="w-full h-full object-cover" loading="lazy" />
                {photo.caption && (
                  <figcaption className="absolute bottom-0 inset-x-0 bg-black/60 p-3 text-white text-xs backdrop-blur-sm">
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
