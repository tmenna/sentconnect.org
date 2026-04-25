import { useState } from "react";
import { useGetTimeline, getGetTimelineQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard, type PostData } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { useAuth } from "@/components/auth-provider";
import { BookOpen, Send, Star, PenSquare, MessageCircle } from "lucide-react";

type TimelineTab = "all" | "moments";

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
    setPosts(prev => prev ? prev.filter(p => p.id !== id) : (data?.reports as PostData[] ?? []).filter(p => p.id !== id));
  }

  const EMERALD = "#0268CE";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Missions Feed hero card ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0047A8 0%, #0268CE 60%, #1A80E0 100%)",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 4px 24px rgba(2,104,206,0.18)",
        }}
      >
        <svg aria-hidden className="pointer-events-none select-none absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 900 120" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.18 }}>
          <g fill="white">
            <path d="M 32,10 L 65,13 L 102,18 L 145,36 L 158,28 L 178,20 L 208,9 L 248,21 L 282,37 L 308,44 L 322,37 L 308,43 L 285,47 L 268,53 L 256,62 L 252,70 L 238,76 L 225,78 L 212,74 L 198,71 L 182,68 L 165,65 L 152,61 L 143,41 L 118,27 L 78,19 Z" />
            <path d="M 435,52 L 464,49 L 480,49 L 502,52 L 517,58 L 530,67 L 537,80 L 537,94 L 530,107 L 520,120 L 506,130 L 492,134 L 477,131 L 462,122 L 450,110 L 440,97 L 435,82 L 432,67 Z" />
            <path d="M 514,17 L 562,9 L 628,7 L 702,7 L 762,14 L 812,21 L 860,17 L 882,24 L 872,32 L 852,38 L 828,45 L 802,50 L 778,52 L 754,58 L 732,65 L 716,76 L 700,82 L 682,78 L 660,75 L 648,82 L 632,78 L 614,72 L 597,68 L 580,62 L 562,56 L 546,50 L 537,44 L 530,38 L 517,32 Z" />
          </g>
        </svg>
        <div className="relative z-10 px-8 pt-7 pb-7">
          <h1 className="font-bold leading-tight tracking-tight" style={{ fontSize: 30, color: "#fff" }}>Missions Feed</h1>
          <p className="mt-1" style={{ fontSize: 14, color: "rgba(255,255,255,0.78)" }}>Stay connected. Share what God is doing in the field.</p>
          <div className="flex gap-3 mt-5">
            <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.15)", minWidth: 140 }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(57,188,122,0.25)" }}>
                <PenSquare className="h-4 w-4" style={{ color: "#39BC7A" }} />
              </div>
              <div>
                <p className="font-black leading-none" style={{ fontSize: 22, color: "#fff" }}>{allPosts.length}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", marginTop: 2 }}>Posts Shared</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.15)", minWidth: 160 }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,214,0,0.18)" }}>
                <Star className="h-4 w-4" style={{ color: "#FFD600", fill: "#FFD600" }} />
              </div>
              <div>
                <p className="font-black leading-none" style={{ fontSize: 22, color: "#fff" }}>{missionMoments.length}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", marginTop: 2 }}>Mission Moments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Composer ── */}
      <PostComposer
        onPost={(newPost) => setPosts(prev => [newPost, ...(prev ?? (data?.reports as PostData[] ?? []))])}
      />

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-1" style={{ borderBottom: "1px solid #E9E9E9" }}>
        {[
          { id: "all" as TimelineTab, label: "All Posts", icon: <Send className="h-3.5 w-3.5" />, count: allPosts.length, activeColor: EMERALD, activeBg: "#EFF6FF" },
          { id: "moments" as TimelineTab, label: "Mission Moments", icon: <Star className="h-3.5 w-3.5" style={{ fill: activeTab === "moments" ? "#DB1C4F" : "none", color: activeTab === "moments" ? "#DB1C4F" : "currentColor" }} />, count: missionMoments.length, activeColor: "#DB1C4F", activeBg: "#FFF1F4" },
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
                  style={{ background: active ? tab.activeBg : "#F3F4F6", color: active ? tab.activeColor : "#6B7280" }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
        {!isLoading && (
          <span className="ml-auto pb-3 text-[13px]" style={{ color: "#9CA3AF" }}>
            {displayedPosts.length} result{displayedPosts.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Posts ── */}
      {isLoading && posts === null ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-border/50 overflow-hidden p-6 space-y-3">
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
      ) : isError ? (
        <div className="text-center py-16">
          <p className="text-destructive text-sm font-medium">Could not load posts.</p>
        </div>
      ) : displayedPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-border py-20 text-center">
          {activeTab === "moments" ? (
            <>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#EFF6FF" }}>
                <BookOpen className="h-6 w-6" style={{ color: EMERALD }} />
              </div>
              <p className="font-semibold text-[16px]" style={{ color: "#374151" }}>No Mission Moments yet</p>
              <p className="text-[14px] mt-1.5" style={{ color: "#9CA3AF" }}>Team members can mark posts as Mission Moments when sharing updates.</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#F3F4F6" }}>
                <MessageCircle className="h-6 w-6" style={{ color: "#9CA3AF" }} />
              </div>
              <p className="font-semibold text-[16px]" style={{ color: "#374151" }}>No posts yet</p>
              <p className="text-[14px] mt-1.5" style={{ color: "#9CA3AF" }}>Team updates will appear here once posted.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedPosts.map(post => (
            <PostCard key={post.id} post={post} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
