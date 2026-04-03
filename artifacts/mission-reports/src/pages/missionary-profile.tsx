import { useGetUser, getGetUserQueryKey, useGetUserReports, getGetUserReportsQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Building, Calendar, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

export default function MissionaryProfile() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  
  const { data: user, isLoading: loadingUser } = useGetUser(userId, {
    query: { enabled: !!userId, queryKey: getGetUserQueryKey(userId) }
  });
  
  const { data: reports, isLoading: loadingReports } = useGetUserReports(userId, {
    query: { enabled: !!userId, queryKey: getGetUserReportsQueryKey(userId) }
  });

  if (loadingUser) {
    return <div className="max-w-3xl mx-auto py-12 text-center text-muted-foreground animate-pulse">Loading profile...</div>;
  }

  if (!user) {
    return <div className="max-w-3xl mx-auto py-12 text-center text-destructive">User not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group" data-testid="link-back">
        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Timeline
      </Link>

      <div className="bg-card rounded-2xl p-8 sm:p-10 border border-border shadow-sm mb-10 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start gap-8">
        <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-background shadow-md">
          <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
          <AvatarFallback className="text-4xl font-serif bg-primary/10 text-primary">{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">{user.name}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground mt-2">
              {user.location && (
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {user.location}</span>
              )}
              {user.organization && (
                <span className="flex items-center gap-1.5"><Building className="h-4 w-4" /> {user.organization}</span>
              )}
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Joined {format(new Date(user.createdAt), "MMM yyyy")}</span>
            </div>
          </div>
          
          {user.bio ? (
            <p className="text-muted-foreground leading-relaxed max-w-2xl text-left">{user.bio}</p>
          ) : (
            <p className="text-muted-foreground/60 italic text-left">No biography provided.</p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Field Reports</h2>
        
        {loadingReports ? (
          <div className="text-center py-8 text-muted-foreground animate-pulse">Loading reports...</div>
        ) : reports && reports.length > 0 ? (
          <div className="grid gap-4">
            {reports.map(report => (
              <Link key={report.id} href={`/reports/${report.id}`} className="block group">
                <Card className="hover:border-primary/30 transition-colors bg-card/50 hover:bg-card">
                  <CardContent className="p-5 flex gap-4">
                    {report.photos?.[0] && (
                      <div className="hidden sm:block h-24 w-32 shrink-0 rounded bg-muted overflow-hidden">
                        <img src={report.photos[0].url} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-serif font-semibold text-lg truncate group-hover:text-primary transition-colors">{report.title}</h3>
                        <span className="text-xs text-muted-foreground shrink-0">{format(new Date(report.reportDate), "MMM d, yyyy")}</span>
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2 mt-2">{report.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-border border-dashed">
            <p className="text-muted-foreground">No reports published yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
