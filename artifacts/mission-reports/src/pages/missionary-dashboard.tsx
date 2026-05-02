import { useState, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { useGetUserReports, getGetUserReportsQueryKey } from "@workspace/api-client-react";
import { Redirect } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard, type PostData } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { FileText, BookOpen } from "lucide-react";

type FeedTab = "all" | "moments";


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
        <div className="flex items-center gap-2 mb-3">
          <div style={{ width: 3, height: 18, background: "#0268CE", borderRadius: 2, flexShrink: 0 }} />
          <span style={{ color: "#0268CE", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            YOUR MISSIONS FEED
          </span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8 }}>
          Missions Feed
        </h1>
        <p style={{ fontSize: 14, color: "#475569", marginBottom: 20, lineHeight: 1.55 }}>
          Stay connected. Share what God is doing in the field.
        </p>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5"
            style={{ fontSize: 12, fontWeight: 600, color: "#0268CE", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 999, padding: "4px 12px" }}
          >
            {allPosts.length} <span style={{ fontWeight: 400, color: "#475569" }}>Posts Shared</span>
          </span>
          <span
            className="inline-flex items-center gap-1.5"
            style={{ fontSize: 12, fontWeight: 600, color: "#0268CE", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 999, padding: "4px 12px" }}
          >
            {missionMoments.length} <span style={{ fontWeight: 400, color: "#475569" }}>Mission Moments</span>
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
      <div className="flex items-center" style={{ borderBottom: "1px solid #BFDBFE" }}>
        {[
          { id: "all" as FeedTab, label: "All Posts", count: allPosts.length },
          { id: "moments" as FeedTab, label: "Mission Moments", count: missionMoments.length },
        ].map(tab => {
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
                fontSize: 13,
                fontWeight: active ? 700 : 400,
                color: active ? "#0268CE" : "#94A3B8",
                border: "none",
                borderBottom: active ? "2px solid #0268CE" : "2px solid transparent",
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
                    background: active ? "#EFF6FF" : "transparent",
                    color: active ? "#0268CE" : "#94A3B8",
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

        {!postsLoading && (
          <span className="ml-auto pb-3 text-[12px]" style={{ color: "#94A3B8", letterSpacing: "0.02em" }}>
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
        <div className="space-y-5">
          {myPosts.map(post => (
            <PostCard key={post.id} post={post} hideViewPost onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
