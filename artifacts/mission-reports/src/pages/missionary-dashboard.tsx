import { useState, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { useGetUserReports, getGetUserReportsQueryKey } from "@workspace/api-client-react";
import { Redirect } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard, type PostData } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { FileText, BookOpen, Send, Star, PenSquare } from "lucide-react";

type FeedTab = "all" | "moments";

const EMERALD = "#0268CE";


export default function MissionaryDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [posts, setPosts] = useState<PostData[] | null>(null);
  const [activeTab, setActiveTab] = useState<FeedTab>("all");
  const composerRef = useRef<HTMLDivElement>(null);

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
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Page header ── */}
      <div>
        <h1 className="font-bold tracking-tight" style={{ fontSize: 26, color: "#111827", marginBottom: 4 }}>
          Missions Feed
        </h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
          Stay connected. Share what God is doing in the field.
        </p>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5"
            style={{ fontSize: 12, color: "#6b7280", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 999, padding: "3px 12px" }}
          >
            <strong style={{ color: "#111827", fontWeight: 600 }}>{allPosts.length}</strong> Posts Shared
          </span>
          <span
            className="inline-flex items-center gap-1.5"
            style={{ fontSize: 12, color: "#6b7280", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 999, padding: "3px 12px" }}
          >
            <strong style={{ color: "#111827", fontWeight: 600 }}>{missionMoments.length}</strong> Mission Moments
          </span>
        </div>
      </div>

      {/* ── Composer ── */}
      <div ref={composerRef}>
        <PostComposer
          onPost={(newPost) => setPosts(prev => [newPost, ...(prev ?? (data as PostData[] ?? []))])}
        />
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-1" style={{ borderBottom: "1px solid #E9E9E9" }}>
        {[
          { id: "all" as FeedTab, label: "All Posts", icon: <Send className="h-3.5 w-3.5" />, count: allPosts.length, activeColor: EMERALD, activeBg: "#EFF6FF" },
          { id: "moments" as FeedTab, label: "Mission Moments", icon: <Star className="h-3.5 w-3.5" style={{ fill: activeTab === "moments" ? "#DB1C4F" : "none", color: activeTab === "moments" ? "#DB1C4F" : "currentColor" }} />, count: missionMoments.length, activeColor: "#DB1C4F", activeBg: "#FFF1F4" },
        ].map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-1 pb-3 pt-1 mr-5 text-[14px] font-semibold border-b-2 -mb-px transition-all duration-200"
              style={{
                borderColor: active ? tab.activeColor : "transparent",
                color: active ? tab.activeColor : "#9CA3AF",
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && (
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: active ? tab.activeBg : "#F3F4F6",
                    color: active ? tab.activeColor : "#6B7280",
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}

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
            <div key={i} className="p-6 space-y-3">
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
        <div className="space-y-4">
          {myPosts.map(post => (
            <PostCard key={post.id} post={post} hideViewPost onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
