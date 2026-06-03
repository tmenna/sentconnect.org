import React, { useState, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { useGetUserReports, getGetUserReportsQueryKey } from "@workspace/api-client-react";
import { Redirect, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard, type PostData } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { FileText, Star, CircleUser, PenSquare, BookOpen } from "lucide-react";

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
  const myPosts = allPosts;

  function handleDelete(id: number) {
    setPosts(prev => prev ? prev.filter(p => p.id !== id) : (data as PostData[] ?? []).filter(p => p.id !== id));
  }

  const displayedCount = allPosts.length;
  const firstName = user.name.split(" ")[0];

  const navItems: { id: FeedTab | "profile"; label: string; Icon: React.ElementType }[] = [
    { id: "all",     label: "My Posts",        Icon: FileText },
    { id: "moments", label: "Moments",          Icon: Star },
    { id: "profile", label: "Profile",          Icon: CircleUser },
  ];

  return (
    <div className="flex bg-white min-h-[600px] mx-auto w-full" style={{ maxWidth: 960 }}>

      {/* ── Sidebar — desktop only ── */}
      <aside className="hidden sm:flex flex-col flex-shrink-0"
        style={{ width: 240, padding: "28px 12px 20px", borderRight: "1px solid #e8eaed", fontFamily: "Inter, system-ui, sans-serif" }}>

        {/* Brand header */}
        <div style={{ padding: "0 10px", marginBottom: 32 }}>
          <p style={{ fontSize: 23, fontWeight: 800, color: "#000000", margin: 0, letterSpacing: "-0.03em", lineHeight: 1.25 }}>
            Missions Feed
          </p>
          <p style={{ fontSize: 15, fontWeight: 500, color: "#000000", margin: "4px 0 0" }}>
            {user.organization ?? "Field Team"}
          </p>
        </div>

        {/* Nav items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {([
            { id: "all" as FeedTab, label: "My Posts", Icon: FileText },
          ]).map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  width: "100%", textAlign: "left",
                  padding: "10px 14px",
                  borderRadius: 12, border: "none",
                  background: active ? "#EEF4FF" : "transparent",
                  color: "#111",
                  fontSize: 18, fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  transition: "background 0.15s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "#f1f3f5"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <Icon strokeWidth={active ? 2.2 : 1.8} style={{ width: 22, height: 22, flexShrink: 0 }} />
                {label}
              </button>
            );
          })}

          {/* Profile — navigates to profile page */}
          <Link href="/profile" style={{ textDecoration: "none" }}>
            <div
              role="button"
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px",
                borderRadius: 12,
                color: "#111",
                fontSize: 18, fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.15s",
                fontFamily: "inherit",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f1f3f5"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <CircleUser strokeWidth={1.8} style={{ width: 22, height: 22, flexShrink: 0 }} />
              Profile
            </div>
          </Link>
        </nav>

        {/* New Post button */}
        <button
          onClick={() => composerRef.current?.scrollIntoView({ behavior: "smooth" })}
          style={{
            width: "100%", height: 44,
            borderRadius: 999,
            background: "#1085FD",
            color: "#fff",
            fontSize: 15, fontWeight: 700,
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "inherit",
            marginBottom: 20,
            transition: "background 0.15s, transform 0.1s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1085FD"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#1085FD"; }}
          onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
          onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
        >
          <PenSquare style={{ width: 16, height: 16 }} />
          New Post
        </button>

        {/* User chip */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#EEF4FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#1085FD", flexShrink: 0 }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{firstName}</p>
            <p style={{ fontSize: 11.5, color: "#8899A6", margin: 0 }}>Field User</p>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      {/* pb-24 on mobile leaves room for the fixed bottom nav */}
      <main className="flex-1 min-w-0 flex flex-col px-4 sm:px-6 py-6 sm:py-7 pb-24 sm:pb-8">
      <div className="w-full max-w-[620px] flex flex-col gap-6 sm:gap-7">

        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight leading-tight mb-1.5" style={{ color: "#2B2B2B" }}>
              {activeTab === "moments" ? "Mission Moments" : "My Posts"}
            </h1>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Stay connected. Share what God is doing in the field.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 mt-1">
            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border"
              style={{ color: "#2B2B2B", background: "#F1F5F9", borderColor: "#E2E8F0" }}>
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
                  fontSize: 14, fontWeight: active ? 800 : 500,
                  color: active ? "#1085FD" : "#94A3B8",
                  border: "none",
                  borderBottom: active ? "2px solid #1085FD" : "2px solid transparent",
                  background: "transparent", cursor: "pointer",
                  letterSpacing: active ? "-0.01em" : "normal",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    marginLeft: 6, fontSize: 11, fontWeight: 600,
                    background: active ? "#EFF6FF" : "transparent",
                    color: active ? "#1085FD" : "#94A3B8",
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
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#F3F4F6" }}>
              <FileText className="h-6 w-6 text-slate-400" />
            </div>
            <p className="font-semibold text-base" style={{ color: "#2B2B2B" }}>No posts yet</p>
            <p className="text-sm mt-1.5 text-slate-500">Share your first update using the composer above.</p>
          </div>
        ) : (
          <div className="overflow-hidden" style={{ borderTop: "1px solid #E5E7EB" }}>
            {myPosts.map(post => (
              <PostCard key={post.id} post={post} hideViewPost onDelete={handleDelete} flat />
            ))}
          </div>
        )}
      </div>
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
              <Icon style={{ width: 20, height: 20, color: active ? "#1085FD" : "#94A3B8" }} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? "#1085FD" : "#94A3B8" }}>{label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
