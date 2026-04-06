import { useGetUser, getGetUserQueryKey, useGetUserReports, getGetUserReportsQueryKey } from "@workspace/api-client-react";
import { useParams, Link, Redirect } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Building, Calendar, ArrowLeft, FileText } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/components/auth-provider";
import { PostCard, type PostData } from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";

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
  if (!authLoading && currentUser && currentUser.role !== "admin" && userId !== currentUser.id) {
    return <Redirect href="/" />;
  }

  if (authLoading || loadingUser) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl h-24 animate-pulse" style={{ background: "linear-gradient(135deg, #132272 0%, #1e3a8a 100%)" }} />
        <div className="bg-white rounded-xl border border-border/60 shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  const feedHref = currentUser?.role === "admin" ? "/admin" : "/feed";

  if (!user) {
    return (
      <div className="py-10 text-center">
        <p className="text-foreground font-semibold">User not found</p>
        <Link href={feedHref} className="text-sm text-primary mt-2 inline-block hover:underline">Back to Activity Feed</Link>
      </div>
    );
  }

  const posts = (reports ?? []) as PostData[];

  return (
    <div className="space-y-5">
      {/* Back link */}
      <Link
        href={feedHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Back to Activity Feed
      </Link>

      {/* Profile banner — matches admin/dashboard navy style */}
      <div
        className="rounded-2xl px-6 py-5 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, #132272 0%, #1e3a8a 100%)" }}
      >
        <Avatar className="h-16 w-16 ring-2 ring-white/30 flex-shrink-0">
          <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
          <AvatarFallback className="text-2xl font-bold bg-white/20 text-white">
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h1 className="text-[20px] font-extrabold text-white tracking-tight leading-snug">{user.name}</h1>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
            {user.location && (
              <span className="inline-flex items-center gap-1.5 text-[12px] text-white/70">
                <MapPin className="h-3 w-3" />{user.location}
              </span>
            )}
            {user.organization && (
              <span className="inline-flex items-center gap-1.5 text-[12px] text-white/70">
                <Building className="h-3 w-3" />{user.organization}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-[12px] text-white/60">
              <Calendar className="h-3 w-3" />Since {format(new Date(user.createdAt), "MMM yyyy")}
            </span>
          </div>
          {user.bio && (
            <p className="text-[12px] text-white/60 mt-1.5 leading-relaxed line-clamp-2">{user.bio}</p>
          )}
        </div>

        <div className="hidden sm:block text-right flex-shrink-0">
          <p className="text-[28px] font-extrabold text-white leading-none">{posts.length}</p>
          <p className="text-[11px] text-white/60 mt-0.5 flex items-center gap-1 justify-end">
            <FileText className="h-3 w-3" />posts
          </p>
        </div>
      </div>

      {/* Posts feed */}
      {loadingReports ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-xl border border-border/60 shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-border py-20 text-center shadow-sm">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
          <p className="font-semibold text-foreground text-sm">No posts yet</p>
          <p className="text-muted-foreground text-xs mt-1">This team member hasn't shared any updates.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
