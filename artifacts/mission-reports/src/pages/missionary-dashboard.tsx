import React, { useState, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { useGetUserReports, getGetUserReportsQueryKey } from "@workspace/api-client-react";
import { Redirect, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard, type PostData } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { FileText, BookOpen, Rss, Star, User } from "lucide-react";

type FeedTab = "all" | "moments";

const EMERALD = "#374151";


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

  const firstName = user.name.split(" ")[0];

  return (
    <div style={{ display: "flex", gap: 0, margin: "0 -32px", minHeight: 600, background: "#fff" }}>

      {/* ── Render-style dark sidebar ── */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: "#fff",
        display: "flex", flexDirection: "column",
        padding: "24px 12px 20px",
        borderRight: "1px solid #F1F5F9",
      }}>
        {/* Workspace label */}
        <div style={{ marginBottom: 28, padding: "0 8px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#94A3B8", textTransform: "uppercase", margin: "0 0 6px" }}>
            Workspace
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#0f0f13", margin: 0, lineHeight: 1.3 }}>
            Missions Feed
          </p>
          <p style={{ fontSize: 12, color: "#94A3B8", margin: "2px 0 0" }}>
            {user.organization ?? "Field Team"}
          </p>
        </div>

        {/* Section label */}
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#94A3B8", textTransform: "uppercase", padding: "0 8px", margin: "0 0 4px" }}>
          Activity
        </p>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {([
            { id: "all",     label: "My Posts",        Icon: Rss },
            { id: "moments", label: "Mission Moments",  Icon: Star },
          ] as { id: FeedTab; label: string; Icon: React.ElementType }[]).map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", textAlign: "left",
                  padding: "9px 10px",
                  borderRadius: 8, border: "none",
                  background: active ? "#F4EEFF" : "transparent",
                  color: active ? "#4F0A90" : "#64748B",
                  fontSize: 13.5, fontWeight: active ? 600 : 400,
                  cursor: "pointer", transition: "all 0.12s",
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.color = "#0f0f13"; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748B"; } }}
              >
                <Icon style={{ width: 15, height: 15, flexShrink: 0 }} />
                {label}
              </button>
            );
          })}

          {/* Divider + Profile link */}
          <div style={{ height: 1, background: "#F1F5F9", margin: "8px 0" }} />
          <Link href="/profile">
            <button
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", textAlign: "left",
                padding: "9px 10px", borderRadius: 8, border: "none",
                background: "transparent", color: "#64748B",
                fontSize: 13.5, fontWeight: 400, cursor: "pointer", transition: "all 0.12s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.color = "#0f0f13"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748B"; }}
            >
              <User style={{ width: 15, height: 15, flexShrink: 0 }} />
              Profile
            </button>
          </Link>
        </nav>

        {/* User info at bottom */}
        <div style={{ borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: 10, padding: "14px 8px 0" }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#F4EEFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#4F0A90", flexShrink: 0 }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: "#0f0f13", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{firstName}</p>
            <p style={{ fontSize: 11, color: "#94A3B8", margin: 0 }}>Field User</p>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, minWidth: 0, padding: "28px 28px 28px 32px", display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Page header ── */}
      <div style={{ paddingBottom: 4 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 6 }}>
              {activeTab === "moments" ? "Mission Moments" : "My Posts"}
            </h1>
            <p style={{ fontSize: 14, color: "#000000", lineHeight: 1.5 }}>
              Stay connected. Share what God is doing in the field.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 mt-1">
            <span className="inline-flex items-center gap-1" style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 999, padding: "4px 12px" }}>
              {allPosts.length} <span style={{ fontWeight: 400, color: "#64748B" }}>posts</span>
            </span>
            {missionMoments.length > 0 && (
              <span className="inline-flex items-center gap-1" style={{ fontSize: 12, fontWeight: 700, color: "#111827", background: "#F5F5F5", border: "1px solid #F3F4F6", borderRadius: 999, padding: "4px 12px" }}>
                {missionMoments.length} <span style={{ fontWeight: 400, color: "#475569" }}>moments</span>
              </span>
            )}
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
      <div className="flex items-center" style={{ borderBottom: "2px solid #F1F5F9" }}>
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
                fontSize: 14,
                fontWeight: active ? 700 : 400,
                color: active ? "#111827" : "#94A3B8",
                border: "none",
                borderBottom: active ? "2px solid #111827" : "2px solid transparent",
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
                    background: active ? "#F5F5F5" : "transparent",
                    color: active ? "#111827" : "#94A3B8",
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
        <div className="bg-white rounded-2xl py-20 text-center" style={{ border: "1.5px dashed #CBD5E1" }}>
          {activeTab === "moments" ? (
            <>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#EBF5FF" }}>
                <BookOpen className="h-6 w-6" style={{ color: EMERALD }} />
              </div>
              <p className="font-semibold text-[16px]" style={{ color: "#111827" }}>No Mission Moments yet</p>
              <p className="text-[14px] mt-1.5" style={{ color: "#000000" }}>Mark a post as Mission Moments when you share an update.</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#F3F4F6" }}>
                <FileText className="h-6 w-6" style={{ color: "#9CA3AF" }} />
              </div>
              <p className="font-semibold text-[16px]" style={{ color: "#111827" }}>No posts yet</p>
              <p className="text-[14px] mt-1.5" style={{ color: "#000000" }}>Share your first update using the composer above.</p>
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
    </div>
  );
}
