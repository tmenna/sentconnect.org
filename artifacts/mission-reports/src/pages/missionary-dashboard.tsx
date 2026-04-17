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
    <div className="space-y-6">
      {/* Minimal welcome header — no heavy banner */}
      <div className="flex items-center gap-4 pt-1 pb-2">
        <Avatar className="h-11 w-11 flex-shrink-0">
          <AvatarImage src={user?.avatarUrl ?? undefined} />
          <AvatarFallback className="font-semibold text-[15px]" style={{ background: "#E5E7EB", color: "#374151" }}>
            {user?.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h1 className="text-[26px] font-semibold leading-tight" style={{ color: "#111827" }}>
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
            <p className="text-[14px]" style={{ color: "#6B7280" }}>Here's what's happening today</p>
            {user?.location && (
              <span className="flex items-center gap-1 text-[13px]" style={{ color: "#9CA3AF" }}>
                <MapPin className="h-3 w-3" />{user.location}
              </span>
            )}
            {user?.organization && (
              <span className="flex items-center gap-1 text-[13px]" style={{ color: "#9CA3AF" }}>
                <Building2 className="h-3 w-3" />{user.organization}
              </span>
            )}
          </div>
        </div>
        {allPosts.length > 0 && (
          <div className="hidden sm:flex gap-4 flex-shrink-0 text-right">
            <div>
              <p className="text-[22px] font-bold leading-none" style={{ color: "#111827" }}>{allPosts.length}</p>
              <p className="text-[12px] mt-0.5 flex items-center gap-1 justify-end" style={{ color: "#9CA3AF" }}>
                <FileText className="h-3 w-3" />posts
              </p>
            </div>
            {missionMoments.length > 0 && (
              <div className="border-l pl-4" style={{ borderColor: "#E5E7EB" }}>
                <p className="text-[22px] font-bold leading-none" style={{ color: "#111827" }}>{missionMoments.length}</p>
                <p className="text-[12px] mt-0.5 flex items-center gap-1 justify-end" style={{ color: "#9CA3AF" }}>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />moments
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      <PostComposer
        onPost={(newPost) => setPosts(prev => [newPost, ...(prev ?? (data as PostData[] ?? []))])}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2" style={{ borderBottom: "1px solid #F1F5F9" }}>
        <button
          onClick={() => setActiveTab("all")}
          className="flex items-center gap-2 px-1 pb-3 pt-1 text-[15px] font-semibold border-b-2 -mb-px transition-all duration-200"
          style={{
            borderColor: activeTab === "all" ? "#3B82F6" : "transparent",
            color: activeTab === "all" ? "#111827" : "#9CA3AF",
          }}
        >
          <Globe className="h-4 w-4" />
          All Posts
          <span className="text-[12px] px-2 py-0.5 rounded-full font-medium" style={{ background: "#F3F4F6", color: "#6B7280" }}>
            {allPosts.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("moments")}
          className="flex items-center gap-2 px-1 pb-3 pt-1 ml-4 text-[15px] font-semibold border-b-2 -mb-px transition-all duration-200"
          style={{
            borderColor: activeTab === "moments" ? "#3B82F6" : "transparent",
            color: activeTab === "moments" ? "#111827" : "#9CA3AF",
          }}
        >
          <Star className={`h-4 w-4 ${activeTab === "moments" ? "fill-amber-500 text-amber-500" : ""}`} />
          Mission Moments
          {missionMoments.length > 0 && (
            <span className="text-[12px] px-2 py-0.5 rounded-full font-medium" style={{ background: "#F3F4F6", color: "#6B7280" }}>
              {missionMoments.length}
            </span>
          )}
        </button>
      </div>

      {/* Timeline */}
      {postsLoading && posts === null ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 space-y-3" style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : myPosts.length === 0 ? (
        <div className="bg-white rounded-2xl py-16 text-center" style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          {activeTab === "moments" ? (
            <>
              <Star className="h-8 w-8 mx-auto mb-3" style={{ color: "#D1D5DB" }} />
              <p className="font-medium text-[15px]" style={{ color: "#374151" }}>No Mission Moments yet</p>
              <p className="text-[14px] mt-1" style={{ color: "#9CA3AF" }}>Mark a post as Mission Moments using the toolbar.</p>
            </>
          ) : (
            <>
              <FileText className="h-8 w-8 mx-auto mb-3" style={{ color: "#D1D5DB" }} />
              <p className="font-medium text-[15px]" style={{ color: "#374151" }}>No posts yet</p>
              <p className="text-[14px] mt-1" style={{ color: "#9CA3AF" }}>Share your first update above.</p>
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
