import { useGetTimeline, getGetTimelineQueryKey, ReportWithDetails } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/constants";
import { MapPin, Users, HeartHandshake, GraduationCap, Home, MoreHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CategoryIcon = ({ category, className }: { category: string, className?: string }) => {
  switch (category) {
    case "church_planting": return <Home className={className} />;
    case "leadership_training": return <Users className={className} />;
    case "humanitarian_work": return <HeartHandshake className={className} />;
    case "education": return <GraduationCap className={className} />;
    default: return <MoreHorizontal className={className} />;
  }
};

function ReportCard({ report, index }: { report: ReportWithDetails, index: number }) {
  const { missionary, photos, category, title, description, reportDate, location } = report;
  const firstPhoto = photos?.[0];
  const excerpt = description.length > 150 ? description.substring(0, 150) + "..." : description;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/reports/${report.id}`} data-testid={`link-report-${report.id}`} className="block group">
        <Card className="overflow-hidden border-2 border-border/60 shadow-sm transition-all hover:shadow-lg hover:border-primary/30 bg-card hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center gap-4 p-4 sm:p-6 pb-3">
            <Avatar className="h-10 w-10 sm:h-11 sm:w-11 ring-2 ring-border/40">
              <AvatarImage src={missionary.avatarUrl || undefined} alt={missionary.name} />
              <AvatarFallback className="font-serif bg-primary/10 text-primary font-bold">{missionary.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground truncate tracking-tight">{missionary.name}</p>
              <div className="flex items-center text-[11px] text-muted-foreground mt-0.5 gap-2 uppercase tracking-wider font-medium">
                <span>{format(new Date(reportDate), "MMM d, yyyy")}</span>
                {location && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 truncate"><MapPin className="h-2.5 w-2.5" /> {location}</span>
                  </>
                )}
              </div>
            </div>
            <Badge variant={CATEGORY_COLORS[category]} className="hidden sm:flex gap-1.5 whitespace-nowrap uppercase text-[10px] tracking-widest font-bold px-3 py-1">
              <CategoryIcon category={category} className="h-3 w-3" />
              {CATEGORY_LABELS[category]}
            </Badge>
          </CardHeader>
          
          <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
            <h2 className="text-xl sm:text-2xl font-serif font-bold leading-snug group-hover:text-primary transition-colors tracking-tight">{title}</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">{excerpt}</p>
            
            {firstPhoto && (
              <div className="relative mt-4 aspect-video sm:aspect-[21/9] overflow-hidden rounded-md bg-muted">
                <img 
                  src={firstPhoto.url} 
                  alt={firstPhoto.caption || title} 
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function Timeline() {
  const { data, isLoading, isError } = useGetTimeline(
    { limit: 20 },
    { query: { queryKey: getGetTimelineQueryKey({ limit: 20 }) } }
  );

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-48 w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-serif text-destructive">Could not load timeline</h2>
        <p className="text-muted-foreground mt-2">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10 text-center space-y-3">
        <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-primary mb-2">Church Missionary Updates</p>
        <h1 className="text-4xl sm:text-5xl font-serif font-extrabold text-foreground">Field Journal</h1>
        <p className="text-muted-foreground text-base sm:text-lg font-medium">Stories of impact from around the world.</p>
      </div>

      {data.reports.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-lg border border-border border-dashed">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-serif text-foreground">No reports yet</h3>
          <p className="text-muted-foreground mt-2">The field journal is waiting for its first entry.</p>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {data.reports.map((report, index) => (
            <ReportCard key={report.id} report={report} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

import { BookOpen } from "lucide-react";
