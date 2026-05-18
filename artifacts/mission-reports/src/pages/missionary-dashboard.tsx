import React, { useState, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { useGetUserReports, getGetUserReportsQueryKey } from "@workspace/api-client-react";
import { Redirect, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard, type PostData } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { FileText, BookOpen, Rss, Star, User } from "lucide-react";

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
  const firstName = user.name.split(" ")[0];

  const navItems: { id: FeedTab | "profile"; label: string; Icon: React.ElementType }[] = [
    { id: "all",     label: "My Posts",       Icon: Rss },
    { id: "moments", label: "Moments",        Icon: Star },
    { id: "profile", label: "Profile",        Icon: User },
  ];

  return (
    <div className="flex bg-white -mx-4 sm:-mx-8 min-h-[600px]">

      {/* ── Sidebar — desktop only ── */}
      <aside className="hidden sm:flex flex-col flex-shrink-0 border-r border-slate-100"
        style={{ width: 220, padding: "24px 12px 20px" }}>

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
            { id: "all",     label: "My Posts",       Icon: Rss },
            { id: "moments", label: "Mission Moments", Icon: Star },
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
                  background: active ? "#8705FA" : "transparent",
                  color: active ? "#ffffff" : "#64748B",
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

        {/* User info */}
        <div style={{ borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: 10, padding: "14px 8px 0" }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#F0E0FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#8705FA", flexShrink: 0 }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: "#0f0f13", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{firstName}</p>
            <p style={{ fontSize: 11, color: "#94A3B8", margin: 0 }}>Field User</p>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      {/* pb-24 on mobile leaves room for the fixed bottom nav */}
      <main className="flex-1 min-w-0 flex flex-col gap-6 sm:gap-7 px-4 sm:px-8 py-6 sm:py-7 pb-24 sm:pb-8">

        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight leading-tight mb-1.5" style={{ color: "#111827" }}>
              {activeTab === "moments" ? "Mission Moments" : "My Posts"}
            </h1>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Stay connected. Share what God is doing in the field.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 mt-1">
            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border"
              style={{ color: "#0F172A", background: "#F1F5F9", borderColor: "#E2E8F0" }}>
              {allPosts.length} <span className="font-normal text-slate-400">posts</span>
            </span>
          </div>
        </div>

        {/* Composer */}
        <div ref={composerRef}>
          <PostComposer
            onPost={(newPost) => setPosts(prev => [newPost, ...(prev ?? (data as PostData[] ?? []))])}
          />
        </div>

        {/* Filter tabs */}
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
                  paddingBottom: 12, paddingTop: 4,
                  marginRight: 24, marginBottom: -1,
                  fontSize: 14, fontWeight: active ? 700 : 400,
                  color: active ? "#111827" : "#94A3B8",
                  border: "none",
                  borderBottom: active ? "2px solid #111827" : "2px solid transparent",
                  background: "transparent", cursor: "pointer",
                  letterSpacing: active ? "-0.01em" : "normal",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    marginLeft: 6, fontSize: 11, fontWeight: 600,
                    background: active ? "#F5F5F5" : "transparent",
                    color: active ? "#111827" : "#94A3B8",
                    borderRadius: 999, padding: "1px 7px",
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
          {!postsLoading && (
            <span className="ml-auto pb-3 text-[12px]" style={{ color: "#94A3B8" }}>
              {displayedCount} result{displayedCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Posts */}
        {postsLoading && posts === null ? (
          <div className="bg-white rounded-2xl border border-border/50 overflow-hidden divide-y divide-border/40">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-5 sm:p-6 space-y-3">
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
          <div className="bg-white rounded-2xl py-16 sm:py-20 text-center" style={{ border: "1.5px dashed #CBD5E1" }}>
            {activeTab === "moments" ? (
              <>
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#EBF5FF" }}>
                  <BookOpen className="h-6 w-6 text-slate-500" />
                </div>
                <p className="font-semibold text-base" style={{ color: "#111827" }}>No Mission Moments yet</p>
                <p className="text-sm mt-1.5 text-slate-500">Mark a post as Mission Moments when you share an update.</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#F3F4F6" }}>
                  <FileText className="h-6 w-6 text-slate-400" />
                </div>
                <p className="font-semibold text-base" style={{ color: "#111827" }}>No posts yet</p>
                <p className="text-sm mt-1.5 text-slate-500">Share your first update using the composer above.</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {myPosts.map(post => (
              <PostCard key={post.id} post={post} hideViewPost onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      {/* ── Mobile bottom nav — hidden on sm+ ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 flex items-stretch"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {navItems.map(({ id, label, Icon }) => {
          const isProfile = id === "profile";
          const active = isProfile ? false : activeTab === id;
          return isProfile ? (
            <Link key={id} href="/profile" className="flex-1">
              <button className="flex flex-col items-center justify-center gap-1 w-full py-2.5"
                style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                <Icon style={{ width: 20, height: 20, color: "#94A3B8" }} />
                <span style={{ fontSize: 10, fontWeight: 500, color: "#94A3B8" }}>{label}</span>
              </button>
            </Link>
          ) : (
            <button
              key={id}
              onClick={() => setActiveTab(id as FeedTab)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
              style={{ border: "none", background: "transparent", cursor: "pointer" }}
            >
              <Icon style={{ width: 20, height: 20, color: active ? "#8705FA" : "#94A3B8" }} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? "#8705FA" : "#94A3B8" }}>{label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
