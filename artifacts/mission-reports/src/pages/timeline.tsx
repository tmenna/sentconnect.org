import { useState, useEffect, useRef, useCallback } from "react";
import { useGetTimeline } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard, type PostData } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { useAuth } from "@/components/auth-provider";
import { BookOpen, MessageCircle, Loader2 } from "lucide-react";

const PAGE_SIZE = 20;
type TimelineTab = "all" | "moments";

export default function Feed() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TimelineTab>("all");
  const [accumulatedPosts, setAccumulatedPosts] = useState<PostData[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
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

  // First page via React Query (benefits from 60 s stale cache)
  const { data, isLoading, isError } = useGetTimeline({ limit: PAGE_SIZE, offset: 0 });

  // Sync the first page into accumulated state once
  useEffect(() => {
    if (data && !initializedRef.current) {
      initializedRef.current = true;
      setAccumulatedPosts((data.reports ?? []) as PostData[]);
      setHasMore(data.hasMore ?? false);
    }
  }, [data]);

  // Load next page using fetch (avoids generating extra React Query keys)
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
        // deduplicate by id in case of concurrent inserts
        const existing = new Set(prev.map(p => p.id));
        const fresh = ((next.reports ?? []) as PostData[]).filter(p => !existing.has(p.id));
        return [...prev, ...fresh];
      });
      setHasMore(next.hasMore ?? false);
    } catch {
      // silent — user can scroll back to trigger again
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, accumulatedPosts.length]);

  // IntersectionObserver — auto-trigger load more when sentinel enters viewport
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
  const EMERALD = "#8705FA";

  return (
    <div className="max-w-[720px] mx-auto" style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* ── Page title + stats ── */}
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-bold tracking-tight" style={{ fontSize: 26, color: "#111827", marginBottom: 4 }}>Missions Feed</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Updates and stories from the field.</p>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5"
            style={{ fontSize: 12, color: "#6b7280", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 999, padding: "3px 12px" }}
          >
            <strong style={{ color: "#111827", fontWeight: 600 }}>{accumulatedPosts.length}{hasMore ? "+" : ""}</strong> Posts Shared
          </span>
          <span
            className="inline-flex items-center gap-1.5"
            style={{ fontSize: 12, color: "#6b7280", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 999, padding: "3px 12px" }}
          >
            <strong style={{ color: "#111827", fontWeight: 600 }}>{missionMoments.length}{hasMore ? "+" : ""}</strong> Mission Moments
          </span>
        </div>
      </div>

      {/* ── Composer ── */}
      <div style={{ marginBottom: 32 }}>
        <PostComposer onPost={handlePost} />
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-center" style={{ borderBottom: "1px solid #e5e7eb", marginBottom: 8 }}>
        {[
          { id: "all" as TimelineTab, label: "All Posts", count: accumulatedPosts.length },
          { id: "moments" as TimelineTab, label: "Mission Moments", count: missionMoments.length },
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
                fontWeight: active ? 600 : 400,
                color: active ? "#111827" : "#6b7280",
                border: "none",
                borderBottom: active ? "2px solid #111827" : "2px solid transparent",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 11,
                    fontWeight: 500,
                    background: active ? "#f3f4f6" : "transparent",
                    color: active ? "#374151" : "#9ca3af",
                    borderRadius: 999,
                    padding: "1px 7px",
                  }}
                >
                  {tab.count}{hasMore && tab.id === "all" ? "+" : ""}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Posts ── */}
      {isLoading && accumulatedPosts.length === 0 ? (
        <div style={{ paddingTop: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ paddingTop: 24, paddingBottom: 24, borderBottom: "1px solid #f0f0f0" }}>
              <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
                <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </div>
              <Skeleton className="h-3.5 w-full" style={{ marginBottom: 6 }} />
              <Skeleton className="h-3.5 w-4/5" />
              {i === 1 && <Skeleton className="h-44 w-full rounded-lg" style={{ marginTop: 12 }} />}
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16">
          <p className="text-destructive text-sm font-medium">Could not load posts.</p>
        </div>
      ) : displayedPosts.length === 0 ? (
        <div className="py-20 text-center" style={{ borderTop: "1px solid #f0f0f0" }}>
          {activeTab === "moments" ? (
            <>
              <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#eff6ff" }}>
                <BookOpen className="h-5 w-5" style={{ color: EMERALD }} />
              </div>
              <p className="font-semibold text-[15px]" style={{ color: "#374151" }}>No Mission Moments yet</p>
              <p className="text-[13px] mt-1.5" style={{ color: "#9CA3AF" }}>Team members can mark posts as Mission Moments when sharing updates.</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#f3f4f6" }}>
                <MessageCircle className="h-5 w-5" style={{ color: "#9CA3AF" }} />
              </div>
              <p className="font-semibold text-[15px]" style={{ color: "#374151" }}>No posts yet</p>
              <p className="text-[13px] mt-1.5" style={{ color: "#9CA3AF" }}>Team updates will appear here once posted.</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div>
            {displayedPosts.map(post => (
              <PostCard key={post.id} post={post} onDelete={handleDelete} flat />
            ))}
          </div>

          {/* Sentinel + load-more indicator */}
          {activeTab === "all" && (
            <div ref={sentinelRef} className="flex justify-center py-6">
              {loadingMore ? (
                <div className="flex items-center gap-2" style={{ color: "#9CA3AF" }}>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading more posts…</span>
                </div>
              ) : hasMore ? (
                <button
                  onClick={loadMore}
                  className="text-sm font-medium px-6 py-2 rounded-full border transition-colors hover:bg-gray-50"
                  style={{ color: "#6b7280", borderColor: "#e5e7eb" }}
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
    </div>
  );
}
