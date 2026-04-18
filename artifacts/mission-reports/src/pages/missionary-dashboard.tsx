import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useGetUserReports, getGetUserReportsQueryKey } from "@workspace/api-client-react";
import { Redirect } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard, type PostData } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { MapPin, Building2, FileText, Star, BookOpen, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type FeedTab = "all" | "moments";

const EMERALD = "#005BBC";

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
    setPosts(prev => prev ? prev.filter(p => p.id !== id) : (data as PostData[] ?? []).filter(p => p.id !== id));
  }

  const displayedCount = activeTab === "moments" ? missionMoments.length : allPosts.length;

  return (
    <div className="space-y-8">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 pb-6" style={{ borderBottom: "1px solid #E9E9E9" }}>
        <div>
          <h1 className="text-[32px] font-bold leading-tight tracking-tight" style={{ color: "#1F2937" }}>
            My Updates
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
            <p className="text-[15px]" style={{ color: "#6B7280" }}>
              {allPosts.length > 0
                ? `${allPosts.length} post${allPosts.length !== 1 ? "s" : ""} shared`
                : "Share your first update below"}
            </p>
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

        {/* Avatar + quick stats */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {allPosts.length > 0 && (
            <div className="hidden sm:flex gap-4 text-right">
              <div>
                <p className="text-[20px] font-bold leading-none" style={{ color: "#1F2937" }}>{allPosts.length}</p>
                <p className="text-[11px] mt-0.5 flex items-center gap-1 justify-end" style={{ color: "#9CA3AF" }}>
                  <FileText className="h-3 w-3" />posts
                </p>
              </div>
              {missionMoments.length > 0 && (
                <div className="border-l pl-4" style={{ borderColor: "#E5E7EB" }}>
                  <p className="text-[20px] font-bold leading-none" style={{ color: "#1F2937" }}>{missionMoments.length}</p>
                  <p className="text-[11px] mt-0.5 flex items-center gap-1 justify-end" style={{ color: "#9CA3AF" }}>
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />moments
                  </p>
                </div>
              )}
            </div>
          )}
          <Avatar className="h-10 w-10 flex-shrink-0" style={{ border: "2px solid #BFDBFE" }}>
            <AvatarImage src={user?.avatarUrl ?? undefined} />
            <AvatarFallback className="font-semibold text-[14px]" style={{ background: "#EFF6FF", color: EMERALD }}>
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* ── Composer ── */}
      <PostComposer
        onPost={(newPost) => setPosts(prev => [newPost, ...(prev ?? (data as PostData[] ?? []))])}
      />

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-1" style={{ borderBottom: "1px solid #E9E9E9" }}>
        {[
          { id: "all" as FeedTab, label: "All Posts", icon: <Send className="h-3.5 w-3.5" />, count: allPosts.length },
          { id: "moments" as FeedTab, label: "Mission Moments", icon: <BookOpen className="h-3.5 w-3.5" />, count: missionMoments.length },
        ].map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-1 pb-3 pt-1 mr-5 text-[14px] font-semibold border-b-2 -mb-px transition-all duration-200"
              style={{
                borderColor: active ? EMERALD : "transparent",
                color: active ? EMERALD : "#9CA3AF",
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && (
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: active ? "#ECFDF5" : "#F3F4F6",
                    color: active ? EMERALD : "#6B7280",
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Results label aligned right */}
        {!postsLoading && (
          <span className="ml-auto pb-3 text-[13px]" style={{ color: "#9CA3AF" }}>
            {displayedCount} result{displayedCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Posts ── */}
      {postsLoading && posts === null ? (
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
      ) : myPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-border py-20 text-center">
          {activeTab === "moments" ? (
            <>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#EFF6FF" }}>
                <BookOpen className="h-6 w-6" style={{ color: EMERALD }} />
              </div>
              <p className="font-semibold text-[16px]" style={{ color: "#374151" }}>No Mission Moments yet</p>
              <p className="text-[14px] mt-1.5" style={{ color: "#9CA3AF" }}>Mark a post as Mission Moments when you share an update.</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#F3F4F6" }}>
                <FileText className="h-6 w-6" style={{ color: "#9CA3AF" }} />
              </div>
              <p className="font-semibold text-[16px]" style={{ color: "#374151" }}>No posts yet</p>
              <p className="text-[14px] mt-1.5" style={{ color: "#9CA3AF" }}>Share your first update using the composer above.</p>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          {myPosts.map(post => (
            <PostCard key={post.id} post={post} flat hideViewPost onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
