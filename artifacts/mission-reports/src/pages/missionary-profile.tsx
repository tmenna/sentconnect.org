import { useState } from "react";
import { useGetUser, getGetUserQueryKey, useGetUserReports, getGetUserReportsQueryKey } from "@workspace/api-client-react";
import { useParams, Link, Redirect } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Building, Calendar, ArrowLeft, FileText, Star } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/components/auth-provider";
import { PostCard, type PostData } from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";

type ProfileTab = "all" | "moments";

export default function MissionaryProfile() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("all");

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
        <div className="rounded-xl h-24 animate-pulse bg-gray-100" />
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
        <Link href={feedHref} className="text-sm text-primary mt-2 inline-block hover:underline">Back to Updates</Link>
      </div>
    );
  }

  const posts = (reports ?? []) as PostData[];
  const missionMoments = posts.filter(p => p.isMissionMoment);
  const displayedPosts = activeTab === "moments" ? missionMoments : posts;

  return (
    <div className="space-y-5">
      {/* Back link */}
      <Link
        href={feedHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Back to Updates
      </Link>

      {/* Profile header */}
      <div className="flex items-start gap-5 py-2">
        <Avatar className="h-16 w-16 flex-shrink-0 rounded-xl" style={{ border: "1.5px solid #F3F4F6" }}>
          <AvatarImage src={user.avatarUrl || undefined} alt={user.name} className="rounded-xl" />
          <AvatarFallback className="text-2xl font-bold rounded-xl" style={{ background: "#F5F5F5", color: "#111827" }}>
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0F172A", letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 6 }}>{user.name}</h1>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
            {user.location && (
              <span className="inline-flex items-center gap-1.5" style={{ fontSize: 13, color: "#64748B" }}>
                <MapPin className="h-3.5 w-3.5" />{user.location}
              </span>
            )}
            {user.organization && (
              <span className="inline-flex items-center gap-1.5" style={{ fontSize: 13, color: "#64748B" }}>
                <Building className="h-3.5 w-3.5" />{user.organization}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5" style={{ fontSize: 13, color: "#94A3B8" }}>
              <Calendar className="h-3.5 w-3.5" />Since {format(new Date(user.createdAt), "MMM yyyy")}
            </span>
          </div>
          {user.bio && (
            <p className="leading-relaxed line-clamp-2" style={{ fontSize: 14, color: "#64748B" }}>{user.bio}</p>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 flex-shrink-0 mt-1">
          <span className="inline-flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 600, color: "#111827", background: "#F5F5F5", border: "1px solid #D1D5DB", borderRadius: 999, padding: "4px 12px" }}>
            {posts.length} <span style={{ fontWeight: 400, color: "#475569" }}>posts</span>
          </span>
          {missionMoments.length > 0 && (
            <span className="inline-flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 600, color: "#111827", background: "#F5F5F5", border: "1px solid #D1D5DB", borderRadius: 999, padding: "4px 12px" }}>
              {missionMoments.length} <span style={{ fontWeight: 400, color: "#475569" }}>moments</span>
            </span>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center" style={{ borderBottom: "1px solid #D1D5DB" }}>
        {([
          { id: "all" as ProfileTab, label: "All Posts", count: posts.length },
          { id: "moments" as ProfileTab, label: "Mission Moments", count: missionMoments.length },
        ] as const).map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="transition-all duration-150"
              style={{
                paddingBottom: 12,
                paddingTop: 4,
                marginRight: 24,
                marginBottom: -1,
                fontSize: 14,
                fontWeight: active ? 700 : 400,
                color: active ? "#111827" : "#94A3B8",
                border: "none",
                borderBottom: active ? "2px solid #111827" : "2px solid transparent",
                background: "transparent",
                cursor: "pointer",
                letterSpacing: active ? "-0.01em" : "normal",
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    background: active ? "#F5F5F5" : "transparent",
                    color: active ? "#111827" : "#94A3B8",
                    borderRadius: 999,
                    padding: "1px 7px",
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Posts feed */}
      {loadingReports ? (
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden divide-y divide-border/40">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              {i === 1 && <Skeleton className="h-48 w-full rounded-lg" />}
            </div>
          ))}
        </div>
      ) : displayedPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-border py-20 text-center">
          {activeTab === "moments" ? (
            <>
              <Star className="h-10 w-10 mx-auto text-gray-300/50 mb-3" />
              <p className="font-semibold text-foreground text-sm">No Mission Moments yet</p>
              <p className="text-muted-foreground text-xs mt-1">This member hasn't marked any posts as Mission Moments.</p>
            </>
          ) : (
            <>
              <FileText className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
              <p className="font-semibold text-foreground text-sm">No posts yet</p>
              <p className="text-muted-foreground text-xs mt-1">This team member hasn't shared any updates.</p>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          {displayedPosts.map(post => (
            <PostCard key={post.id} post={post} flat hideViewPost />
          ))}
        </div>
      )}
    </div>
  );
}
