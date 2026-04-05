import { useGetUser, getGetUserQueryKey, useGetUserReports, getGetUserReportsQueryKey } from "@workspace/api-client-react";
import { useParams, Link, Redirect } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Building, Calendar, ArrowLeft, Home, Users, HeartHandshake, GraduationCap, MoreHorizontal, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";

const CAT_META: Record<string, { icon: React.ReactNode; color: string; iconBg: string }> = {
  church_planting: { icon: <Home className="h-3.5 w-3.5" />, color: "text-amber-700", iconBg: "bg-amber-100" },
  leadership_training: { icon: <Users className="h-3.5 w-3.5" />, color: "text-blue-700", iconBg: "bg-blue-100" },
  humanitarian_work: { icon: <HeartHandshake className="h-3.5 w-3.5" />, color: "text-rose-700", iconBg: "bg-rose-100" },
  education: { icon: <GraduationCap className="h-3.5 w-3.5" />, color: "text-emerald-700", iconBg: "bg-emerald-100" },
  other: { icon: <MoreHorizontal className="h-3.5 w-3.5" />, color: "text-slate-600", iconBg: "bg-slate-100" },
};

export default function MissionaryProfile() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: user, isLoading: loadingUser } = useGetUser(userId, {
    query: { enabled: !!userId && !!currentUser, queryKey: getGetUserQueryKey(userId) }
  });

  const { data: reports, isLoading: loadingReports } = useGetUserReports(userId, {
    query: { enabled: !!userId && !!currentUser, queryKey: getGetUserReportsQueryKey(userId) }
  });

  if (!authLoading && !isAuthenticated) return <Redirect href="/login" />;
  // Non-admins can only view their own profile
  if (!authLoading && currentUser && currentUser.role !== "admin" && userId !== currentUser.id) {
    return <Redirect href="/" />;
  }

  if (authLoading || loadingUser) {
    return (
      <div className="max-w-2xl mx-auto py-10 text-center text-sm text-muted-foreground animate-pulse">
        Loading profile…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-10 text-center">
        <p className="text-foreground font-semibold">User not found</p>
        <Link href="/feed" className="text-sm text-primary mt-2 inline-block hover:underline">Back to feed</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <Link
        href="/feed"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        data-testid="link-back"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Feed
      </Link>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6 mb-5">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <Avatar className="h-20 w-20 border-2 border-border shadow-sm flex-shrink-0">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground tracking-tight">{user.name}</h1>

            <div className="flex flex-wrap items-center gap-3 mt-2">
              {user.location && (
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {user.location}
                </span>
              )}
              {user.organization && (
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building className="h-3.5 w-3.5 text-primary" />
                  {user.organization}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground/50" />
                Since {format(new Date(user.createdAt), "MMM yyyy")}
              </span>
            </div>

            {user.bio && (
              <p className="text-sm text-muted-foreground leading-relaxed mt-3 max-w-lg">
                {user.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reports */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Field Reports
          {reports && <span className="text-muted-foreground font-normal ml-1.5">({reports.length})</span>}
        </h2>

        {loadingReports ? (
          <div className="bg-white rounded-xl border border-border py-10 text-center text-sm text-muted-foreground animate-pulse">
            Loading reports…
          </div>
        ) : reports && reports.length > 0 ? (
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            {reports.map((report, i) => {
              const meta = CAT_META[report.category] ?? CAT_META.other;
              const Icon = () => <span className={meta.color}>{meta.icon}</span>;
              return (
                <Link
                  key={report.id}
                  href={`/reports/${report.id}`}
                  className={cn(
                    "flex items-center gap-3.5 px-5 py-3.5 hover:bg-[#F7F8FA] transition-colors group",
                    i > 0 ? "border-t border-border" : ""
                  )}
                >
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", meta.iconBg)}>
                    <Icon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {report.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {format(new Date(report.reportDate), "MMM d, yyyy")} · {CATEGORY_LABELS[report.category]}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">No reports published yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
