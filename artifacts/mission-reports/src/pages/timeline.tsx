import { useState, useEffect, useRef, useCallback } from "react";
import { useGetTimeline } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard, type PostData } from "@/components/post-card";
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
  const sentinelRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  if (!authLoading && !isAuthenticated) {
    if (typeof window !== "undefined") window.location.replace("/login");
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

  const displayedPosts = accumulatedPosts;

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-[700px] mx-auto" style={{ display: "flex", flexDirection: "column", gap: 0 }}>

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
                fontSize: 12, fontWeight: 700, color: "#374151",
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
                color: active ? "#1085FD" : "#94A3B8",
                border: "none",
                borderBottom: active ? "2.5px solid #1085FD" : "2.5px solid transparent",
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
                    background: active ? "#EFF6FF" : "#F8FAFC",
                    color: active ? "#1085FD" : "#94A3B8",
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

      {/* ── Posts ── */}
      {isLoading && accumulatedPosts.length === 0 ? (
        // Skeleton loading — matches PostCard
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="bg-white rounded-xl overflow-hidden"
              style={{ border: "1px solid #E2E8F0", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}
            >
              <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-32 rounded" />
                </div>
                <Skeleton className="h-3 w-12 rounded" />
              </div>
              <div className="px-4 pb-3 space-y-2">
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-3/5 rounded" />
              </div>
              <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-3">
                <Skeleton className="h-7 w-14 rounded-lg" />
                <Skeleton className="h-7 w-14 rounded-lg" />
                <Skeleton className="h-7 w-14 rounded-lg" />
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
                style={{ background: "#F5F5F5" }}
              >
                <BookOpen className="h-5 w-5" style={{ color: "#111827" }} />
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
          {/* Single-column flat feed — Bluesky style */}
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E7EAEF" }}>
            {displayedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleDelete}
                flat
              />
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
    </div>
  );
}
