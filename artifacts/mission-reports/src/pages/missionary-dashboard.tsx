import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useGetUserReports, getGetUserReportsQueryKey } from "@workspace/api-client-react";
import { Redirect } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard, type PostData } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { MapPin, Building2, FileText, Star, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type FeedTab = "all" | "moments";

export default function MissionaryDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [posts, setPosts] = useState<PostData[] | null>(null);
  const [activeTab, setActiveTab] = useState<FeedTab>("all");

  const { data, isLoading: postsLoading } = useGetUserReports(
    user?.id ?? 0,
    {
      query: {
        enabled: !!user?.id,
        queryKey: getGetUserReportsQueryKey(user?.id ?? 0),
      },
    }
  );

  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/login" />;
  if (user?.role === "admin") return <Redirect href="/admin" />;

  const allPosts: PostData[] = posts ?? ((data ?? []) as PostData[]);
  const missionMoments = allPosts.filter(p => p.isMissionMoment);
  const myPosts = activeTab === "moments" ? missionMoments : allPosts;

  function handleDelete(id: number) {
    setPosts(prev => prev ? prev.filter(p => p.id !== id) : null);
  }

  return (
    <div className="space-y-5">
      {/* Identity banner — matches admin welcome banner width */}
      <div
        className="rounded-2xl px-6 py-5 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, #132272 0%, #1e3a8a 100%)" }}
      >
        <Avatar className="h-14 w-14 ring-2 ring-white/30 flex-shrink-0">
          <AvatarImage src={user?.avatarUrl ?? undefined} />
          <AvatarFallback className="bg-white/20 text-white font-bold text-xl">
            {user?.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-[20px] text-white tracking-tight leading-snug">
            Welcome back, {user?.name?.split(" ")[0]}!
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
            {user?.location && (
              <span className="flex items-center gap-1 text-[12px] text-white/70">
                <MapPin className="h-3 w-3" />{user.location}
              </span>
            )}
            {user?.organization && (
              <span className="flex items-center gap-1 text-[12px] text-white/70">
                <Building2 className="h-3 w-3" />{user.organization}
              </span>
            )}
          </div>
        </div>
        <div className="hidden sm:flex gap-5 flex-shrink-0">
          <div className="text-right">
            <p className="text-[28px] font-extrabold text-white leading-none">{allPosts.length}</p>
            <p className="text-[11px] text-white/60 mt-0.5 flex items-center gap-1 justify-end">
              <FileText className="h-3 w-3" />posts
            </p>
          </div>
          {missionMoments.length > 0 && (
            <div className="text-right border-l border-white/20 pl-5">
              <p className="text-[28px] font-extrabold text-white leading-none">{missionMoments.length}</p>
              <p className="text-[11px] text-white/60 mt-0.5 flex items-center gap-1 justify-end">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />moments
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <PostComposer
        onPost={(newPost) => setPosts(prev => [newPost, ...(prev ?? (data as PostData[] ?? []))])}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-border/50 pb-0">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "all"
              ? "border-[#132272] text-[#132272]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          All Posts
          <span className="ml-0.5 text-[11px] font-normal bg-muted rounded-full px-1.5 py-0.5">{allPosts.length}</span>
        </button>
        <button
          onClick={() => setActiveTab("moments")}
          className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "moments"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Star className={`h-3.5 w-3.5 ${activeTab === "moments" ? "fill-amber-500 text-amber-500" : ""}`} />
          Mission Moments
          {missionMoments.length > 0 && (
            <span className="ml-0.5 text-[11px] font-normal bg-muted rounded-full px-1.5 py-0.5">{missionMoments.length}</span>
          )}
        </button>
      </div>

      {/* Timeline */}
      {postsLoading && posts === null ? (
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
      ) : myPosts.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-border py-20 text-center shadow-sm">
          {activeTab === "moments" ? (
            <>
              <Star className="h-10 w-10 mx-auto text-amber-300/50 mb-3" />
              <p className="font-semibold text-foreground text-sm">No Mission Moments yet</p>
              <p className="text-muted-foreground text-xs mt-1">Mark a post as Mission Moments using the toolbar.</p>
            </>
          ) : (
            <>
              <FileText className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
              <p className="font-semibold text-foreground text-sm">No posts yet</p>
              <p className="text-muted-foreground text-xs mt-1">Share your first update above.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {myPosts.map(post => (
            <PostCard key={post.id} post={post} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
