import { useState, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { useGetUserReports, getGetUserReportsQueryKey } from "@workspace/api-client-react";
import { Redirect } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard, type PostData } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { FileText, BookOpen, Send, Star, Plus, PenSquare, Users } from "lucide-react";

type FeedTab = "all" | "moments";

const EMERALD = "#0268CE";

/* Reusable world-map SVG paths (same as admin banner) */
function WorldMapOverlay() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none select-none absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 900 120"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.18 }}
    >
      <g fill="white">
        <path d="M 32,10 L 65,13 L 102,18 L 145,36 L 158,28 L 178,20 L 208,9 L 248,21 L 282,37 L 308,44 L 322,37 L 308,43 L 285,47 L 268,53 L 256,62 L 252,70 L 238,76 L 225,78 L 212,74 L 198,71 L 182,68 L 165,65 L 152,61 L 143,41 L 118,27 L 78,19 Z" />
        <path d="M 296,7 L 322,4 L 350,7 L 360,14 L 350,21 L 325,24 L 305,19 Z" />
        <path d="M 256,84 L 278,78 L 302,78 L 322,84 L 364,98 L 356,108 L 342,118 L 318,128 L 304,133 L 293,138 L 283,149 L 280,156 L 276,149 L 268,136 L 258,122 L 250,110 L 247,98 L 248,90 Z" />
        <path d="M 428,28 L 448,20 L 470,16 L 494,18 L 512,13 L 522,19 L 514,27 L 502,31 L 492,37 L 507,41 L 512,48 L 502,52 L 488,52 L 474,50 L 458,52 L 448,50 L 438,47 L 430,41 Z" />
        <path d="M 435,52 L 464,49 L 480,49 L 502,52 L 517,58 L 530,67 L 537,80 L 537,94 L 530,107 L 520,120 L 506,130 L 492,134 L 477,131 L 462,122 L 450,110 L 440,97 L 435,82 L 432,67 Z" />
        <path d="M 518,110 L 526,106 L 531,112 L 529,121 L 521,123 L 516,117 Z" />
        <path d="M 514,17 L 562,9 L 628,7 L 702,7 L 762,14 L 812,21 L 860,17 L 882,24 L 872,32 L 852,38 L 828,45 L 802,50 L 778,52 L 754,58 L 732,65 L 716,76 L 700,82 L 682,78 L 660,75 L 648,82 L 632,78 L 614,72 L 597,68 L 580,62 L 562,56 L 546,50 L 537,44 L 530,38 L 517,32 Z" />
        <path d="M 557,65 L 572,62 L 588,64 L 595,72 L 590,80 L 578,82 L 565,78 L 558,72 Z" />
        <path d="M 622,72 L 642,68 L 657,72 L 657,83 L 646,89 L 635,86 L 624,80 Z" />
        <path d="M 700,80 L 722,75 L 740,78 L 744,86 L 734,91 L 716,89 L 705,85 Z" />
        <path d="M 800,44 L 810,41 L 820,45 L 817,52 L 810,54 L 801,50 Z" />
        <path d="M 736,102 L 760,97 L 780,97 L 802,100 L 820,105 L 834,113 L 837,123 L 829,131 L 813,136 L 790,137 L 768,133 L 750,126 L 738,116 Z" />
        <path d="M 848,120 L 856,115 L 862,119 L 860,128 L 853,130 L 848,125 Z" />
      </g>
    </svg>
  );
}

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
  const totalPeopleReached = allPosts.reduce((sum, p) => sum + (p.peopleReached ?? 0), 0);

  function handleDelete(id: number) {
    setPosts(prev => prev ? prev.filter(p => p.id !== id) : (data as PostData[] ?? []).filter(p => p.id !== id));
  }

  function handleNewPost() {
    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      composerRef.current?.querySelector("textarea")?.focus();
    }, 350);
  }

  const displayedCount = activeTab === "moments" ? missionMoments.length : allPosts.length;

  return (
    <div className="space-y-6">

      {/* ── Full-bleed "My Updates" banner ── */}
      <div
        className="relative -mx-4 sm:-mx-8 -mt-8 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0047A8 0%, #0268CE 60%, #1A80E0 100%)" }}
      >
        <WorldMapOverlay />

        <div className="relative z-10 px-6 sm:px-8 pt-7 pb-6">
          {/* Top row: title + New Post button */}
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              <h1 className="font-bold leading-tight tracking-tight" style={{ fontSize: 28, color: "#fff" }}>
                My Updates
              </h1>
              <p className="mt-1" style={{ fontSize: 14, color: "rgba(255,255,255,0.78)" }}>
                Stay connected. Share what God is doing.
              </p>
            </div>

            {/* New Post button */}
            <button
              onClick={handleNewPost}
              className="flex-shrink-0 flex items-center gap-2 font-semibold rounded-xl px-4 py-2.5 transition-all"
              style={{
                background: "#fff",
                color: "#0268CE",
                fontSize: 14,
                boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#EFF6FF"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
            >
              <Plus className="h-4 w-4" />
              New Post
            </button>
          </div>

          {/* Stat boxes */}
          <div className="flex gap-3 mt-5">
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.15)", minWidth: 140 }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.18)" }}>
                <PenSquare className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-black leading-none" style={{ fontSize: 22, color: "#fff" }}>{allPosts.length}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", marginTop: 2 }}>Posts Shared</p>
              </div>
            </div>

            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.15)", minWidth: 140 }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.18)" }}>
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-black leading-none" style={{ fontSize: 22, color: "#fff" }}>{totalPeopleReached}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", marginTop: 2 }}>People Reached</p>
              </div>
            </div>
          </div>
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
        <div className="space-y-3">
          {myPosts.map(post => (
            <PostCard key={post.id} post={post} hideViewPost onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
