import { useState, useEffect, useRef, useCallback } from "react";
import { useGetTimeline } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { type PostData } from "@/components/post-card";
import { MasonryCard, PostDetailModal } from "@/components/feed-grid";
import { PostComposer } from "@/components/post-composer";
import { useAuth } from "@/components/auth-provider";
import { BookOpen, MessageCircle, Loader2, LayoutGrid } from "lucide-react";

const PAGE_SIZE = 20;
type TimelineTab = "all" | "moments";

export default function Feed() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TimelineTab>("all");
  const [accumulatedPosts, setAccumulatedPosts] = useState<PostData[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  if (!authLoading && !isAuthenticated) {
    if (typeof window !== "undefined") window.location.replace("/login");
    return null;
  }
  if (!authLoading && isAuthenticated && user?.role !== "admin") {
    if (typeof window !== "undefined") window.location.replace("/");
    return null;
  }

  const { data, isLoading, isError } = useGetTimeline({ limit: PAGE_SIZE, offset: 0 });

  useEffect(() => {
    if (data && !initializedRef.current) {
      initializedRef.current = true;
      setAccumulatedPosts((data.reports ?? []) as PostData[]);
      setHasMore(data.hasMore ?? false);
    }
  }, [data]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const resp = await fetch(
        `${base}/api/timeline?limit=${PAGE_SIZE}&offset=${accumulatedPosts.length}`,
        { credentials: "include" }
      );
      if (!resp.ok) return;
      const next = await resp.json();
      setAccumulatedPosts(prev => {
        const existing = new Set(prev.map(p => p.id));
        const fresh = ((next.reports ?? []) as PostData[]).filter(p => !existing.has(p.id));
        return [...prev, ...fresh];
      });
      setHasMore(next.hasMore ?? false);
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, accumulatedPosts.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  function handlePost(newPost: PostData) {
    setAccumulatedPosts(prev => [newPost, ...prev]);
  }

  function handleDelete(id: number) {
    setAccumulatedPosts(prev => prev.filter(p => p.id !== id));
  }

  const missionMoments = accumulatedPosts.filter(p => p.isMissionMoment);
  const displayedPosts = activeTab === "moments" ? missionMoments : accumulatedPosts;

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto" style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28 }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1
              className="font-black tracking-tight"
              style={{ fontSize: "clamp(22px, 4vw, 28px)", color: "#0F172A", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 5 }}
            >
              Missions Feed
            </h1>
            <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.5 }}>
              Updates and stories from the field.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 mt-1">
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 12, fontWeight: 700, color: "#059669",
                background: "#ECFDF5", border: "1px solid #A7F3D0",
                borderRadius: 999, padding: "5px 12px",
              }}
            >
              <LayoutGrid className="h-3 w-3" />
              {accumulatedPosts.length}{hasMore ? "+" : ""} Posts
            </span>
          </div>
        </div>
      </div>

      {/* ── Composer ── */}
      <div style={{ marginBottom: 28 }}>
        <PostComposer onPost={handlePost} />
      </div>

      {/* ── Filter tabs (card style) ── */}
      <div
        className="flex items-center overflow-x-auto scrollbar-none"
        style={{
          background: "white",
          borderRadius: 14,
          border: "1px solid #F1F5F9",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          padding: "0 8px",
          marginBottom: 24,
        }}
      >
        {([
          { id: "all" as TimelineTab, label: "All Posts", count: accumulatedPosts.length },
          { id: "moments" as TimelineTab, label: "Mission Moments", count: missionMoments.length },
        ] as { id: TimelineTab; label: string; count: number }[]).map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="transition-all duration-150 flex-shrink-0"
              style={{
                paddingBottom: 16,
                paddingTop: 16,
                paddingLeft: 6,
                paddingRight: 6,
                marginRight: 28,
                marginBottom: -2,
                fontSize: 15,
                fontWeight: active ? 800 : 500,
                color: active ? "#009E7A" : "#94A3B8",
                border: "none",
                borderBottom: active ? "2.5px solid #009E7A" : "2.5px solid transparent",
                background: "transparent",
                cursor: "pointer",
                letterSpacing: active ? "-0.02em" : "normal",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    background: active ? "#E6F7F3" : "#F8FAFC",
                    color: active ? "#009E7A" : "#94A3B8",
                    borderRadius: 999,
                    padding: "2px 9px",
                  }}
                >
                  {tab.count}{hasMore && tab.id === "all" ? "+" : ""}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Posts grid ── */}
      {isLoading && accumulatedPosts.length === 0 ? (
        // Skeleton loading — matches card grid
        <div style={{ columns: "3 280px", columnGap: 20 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              style={{ breakInside: "avoid", display: "inline-block", width: "100%", marginBottom: 20 }}
            >
              <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}
              >
                {/* Image area */}
                <Skeleton
                  className="w-full"
                  style={{ aspectRatio: "16/9" }}
                />
                <div className="px-3.5 pt-3 pb-3.5 space-y-2.5">
                  {/* Excerpt lines */}
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-4/5 rounded" />
                  {/* Author row */}
                  <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                    <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-2.5 w-24 rounded" />
                      <Skeleton className="h-2 w-16 rounded" />
                    </div>
                    <Skeleton className="h-6 w-14 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16">
          <p className="text-destructive text-sm font-medium">Could not load posts.</p>
        </div>
      ) : displayedPosts.length === 0 ? (
        <div
          className="bg-white rounded-2xl py-20 text-center"
          style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
        >
          {activeTab === "moments" ? (
            <>
              <div
                className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "#E6F7F3" }}
              >
                <BookOpen className="h-5 w-5" style={{ color: "#009E7A" }} />
              </div>
              <p className="font-semibold text-[15px]" style={{ color: "#374151" }}>No Mission Moments yet</p>
              <p className="text-[13px] mt-1.5" style={{ color: "#9CA3AF" }}>
                Team members can mark posts as Mission Moments when sharing updates.
              </p>
            </>
          ) : (
            <>
              <div
                className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "#F8FAFC" }}
              >
                <MessageCircle className="h-5 w-5" style={{ color: "#9CA3AF" }} />
              </div>
              <p className="font-semibold text-[15px]" style={{ color: "#374151" }}>No posts yet</p>
              <p className="text-[13px] mt-1.5" style={{ color: "#9CA3AF" }}>
                Team updates will appear here once posted.
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Card grid */}
          <div style={{ columns: "3 280px", columnGap: 20 }}>
            {displayedPosts.map((post, i) => (
              <div
                key={post.id}
                style={{ breakInside: "avoid", display: "inline-block", width: "100%", marginBottom: 20 }}
              >
                <MasonryCard
                  post={post}
                  onClick={() => setSelectedPostIndex(i)}
                />
              </div>
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          {activeTab === "all" && (
            <div ref={sentinelRef} className="flex justify-center py-8">
              {loadingMore ? (
                <div className="flex items-center gap-2" style={{ color: "#94A3B8" }}>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading more posts…</span>
                </div>
              ) : hasMore ? (
                <button
                  onClick={loadMore}
                  className="text-sm font-semibold px-6 py-2.5 rounded-full border transition-colors hover:bg-gray-50"
                  style={{ color: "#6b7280", borderColor: "#E2E8F0" }}
                >
                  Load more
                </button>
              ) : accumulatedPosts.length > PAGE_SIZE ? (
                <p className="text-sm" style={{ color: "#9CA3AF" }}>All posts loaded</p>
              ) : null}
            </div>
          )}
        </>
      )}

      {/* Post detail modal */}
      {selectedPostIndex !== null && displayedPosts[selectedPostIndex] && (
        <PostDetailModal
          post={displayedPosts[selectedPostIndex]}
          allPosts={displayedPosts}
          postIndex={selectedPostIndex}
          onNavigate={setSelectedPostIndex}
          onClose={() => setSelectedPostIndex(null)}
          onDelete={(id) => {
            handleDelete(id);
            setSelectedPostIndex(null);
          }}
        />
      )}
    </div>
  );
}
