import { useState } from "react";
import { useGetTimeline, getGetTimelineQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard, type PostData } from "@/components/post-card";
import { useAuth } from "@/components/auth-provider";
import { Globe, Star } from "lucide-react";

type TimelineTab = "all" | "moments";

function PostSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border/60 shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}

export default function Feed() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [posts, setPosts] = useState<PostData[] | null>(null);
  const [activeTab, setActiveTab] = useState<TimelineTab>("all");

  if (!authLoading && !isAuthenticated) {
    if (typeof window !== "undefined") window.location.replace("/login");
    return null;
  }
  if (!authLoading && isAuthenticated && user?.role !== "admin") {
    if (typeof window !== "undefined") window.location.replace("/");
    return null;
  }

  const { data, isLoading, isError } = useGetTimeline(
    { limit: 40 },
    {
      query: {
        queryKey: getGetTimelineQueryKey({ limit: 40 }),
      },
    }
  );

  const allPosts: PostData[] = posts ?? (data?.reports ?? []) as PostData[];
  const missionMoments = allPosts.filter(p => p.isMissionMoment);
  const displayedPosts = activeTab === "moments" ? missionMoments : allPosts;

  function handleDelete(id: number) {
    setPosts(prev => prev ? prev.filter(p => p.id !== id) : null);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive text-sm font-medium">Could not load posts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-border/50 pb-0">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "all"
              ? "border-[#005BBC] text-[#005BBC]"
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

      {displayedPosts.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-border py-20 text-center shadow-sm">
          {activeTab === "moments" ? (
            <>
              <Star className="h-10 w-10 mx-auto text-amber-300/50 mb-3" />
              <p className="font-semibold text-foreground text-sm">No Mission Moments yet</p>
              <p className="text-muted-foreground text-xs mt-1">Team members can mark posts as Mission Moments when sharing updates.</p>
            </>
          ) : (
            <>
              <Globe className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
              <p className="font-semibold text-foreground text-sm">No posts yet</p>
              <p className="text-muted-foreground text-xs mt-1">Team updates will appear here once posted.</p>
            </>
          )}
        </div>
      ) : (
        displayedPosts.map(post => (
          <PostCard key={post.id} post={post} onDelete={handleDelete} />
        ))
      )}
    </div>
  );
}
