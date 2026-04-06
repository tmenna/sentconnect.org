import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Redirect, Link } from "wouter";
import {
  useGetStats, getGetStatsQueryKey,
  useListUsers, getListUsersQueryKey,
  useGetTimeline, getGetTimelineQueryKey,
} from "@workspace/api-client-react";
import {
  Users, FileText, Heart, MessageCircle,
  MapPin, Calendar, Sparkles, Globe,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard, type PostData } from "@/components/post-card";
import { formatDistanceToNow } from "date-fns";

function StatCard({
  label, value, icon, accent,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${accent ?? "bg-primary/10 text-primary"}`}>
        {icon}
      </div>
      <div>
        <p className="text-[28px] font-extrabold text-foreground leading-none">{value}</p>
        <p className="text-[12px] text-muted-foreground mt-1 font-medium">{label}</p>
      </div>
    </div>
  );
}

function UserCard({ u }: { u: any }) {
  return (
    <Link href={`/missionaries/${u.id}`}>
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={u.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-extrabold text-xl">
                {u.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white" title="Active" />
          </div>

          <div className="space-y-0.5 w-full">
            <p className="font-bold text-[14px] text-foreground group-hover:text-primary transition-colors leading-snug">
              {u.name}
            </p>
            {u.organization && (
              <p className="text-[11px] text-muted-foreground font-medium truncate">
                {u.organization}
              </p>
            )}
          </div>

          <div className="w-full space-y-1.5">
            {u.location && (
              <div className="flex items-center justify-center gap-1 text-[12px] text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{u.location}</span>
              </div>
            )}
            <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground/70">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span>Joined {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}</span>
            </div>
          </div>

          <div className="w-full pt-2 border-t border-border/40">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
              <Globe className="h-3 w-3" />
              Field Worker
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function UserCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"team" | "feed">("team");
  const [feedPosts, setFeedPosts] = useState<PostData[] | null>(null);
  const [filterUserId, setFilterUserId] = useState<string>("");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");

  const { data: stats, isLoading: statsLoading } = useGetStats({ query: { queryKey: getGetStatsQueryKey() } });
  const { data: users, isLoading: usersLoading } = useListUsers({}, { query: { queryKey: getListUsersQueryKey({}) } });
  const { data: timelineData, isLoading: feedLoading } = useGetTimeline(
    { limit: 50 },
    {
      query: {
        enabled: activeTab === "feed",
        queryKey: getGetTimelineQueryKey({ limit: 50 }),
        onSuccess: (data: any) => {
          if (feedPosts === null) setFeedPosts(data?.reports ?? []);
        },
      },
    }
  );

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Redirect href="/login" />;
  if (user.role !== "admin") return <Redirect href="/" />;

  const nonAdmins = users?.filter((u: any) => u.role !== "admin") ?? [];
  const rawFeedPosts: PostData[] = feedPosts ?? (timelineData?.reports ?? []) as PostData[];

  const allFeedPosts = rawFeedPosts.filter(post => {
    if (filterUserId && String(post.author.id) !== filterUserId) return false;
    if (filterDateFrom) {
      const from = new Date(filterDateFrom);
      from.setHours(0, 0, 0, 0);
      if (new Date(post.createdAt) < from) return false;
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(post.createdAt) > to) return false;
    }
    return true;
  });

  const hasFilters = filterUserId || filterDateFrom || filterDateTo;

  const firstName = user.name.split(" ")[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Welcome Banner */}
      <div
        className="rounded-2xl px-6 py-5 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, #132272 0%, #1e3a8a 100%)" }}
      >
        <div className="p-3 bg-white/15 rounded-xl">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-[20px] font-extrabold text-white tracking-tight">
            Welcome back, {firstName}!
          </h1>
          <p className="text-white/65 text-sm mt-0.5">
            Here's what your team has been up to.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Avatar className="h-10 w-10 ring-2 ring-white/30">
            <AvatarImage src={user.avatarUrl ?? undefined} />
            <AvatarFallback className="bg-white/20 text-white font-bold">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statsLoading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)
        ) : (
          <>
            <StatCard
              label="Total Posts"
              value={stats?.totalPosts ?? 0}
              icon={<FileText className="h-5 w-5" />}
              accent="bg-blue-50 text-blue-600"
            />
            <StatCard
              label="Team Members"
              value={nonAdmins.length}
              icon={<Users className="h-5 w-5" />}
              accent="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              label="Countries"
              value={
                new Set(
                  nonAdmins
                    .map((u: any) => u.location?.split(",").pop()?.trim())
                    .filter(Boolean)
                ).size || "—"
              }
              icon={<Globe className="h-5 w-5" />}
              accent="bg-violet-50 text-violet-600"
            />
            <StatCard
              label="Your Role"
              value="Admin"
              icon={<Sparkles className="h-5 w-5" />}
              accent="bg-amber-50 text-amber-600"
            />
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border/60">
        <button
          onClick={() => setActiveTab("team")}
          className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
            activeTab === "team"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            Your Team
            {!usersLoading && (
              <span className="ml-0.5 text-[11px] bg-muted px-1.5 py-0.5 rounded-full font-medium">
                {nonAdmins.length}
              </span>
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("feed")}
          className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
            activeTab === "feed"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Heart className="h-4 w-4" />
            Activity Feed
          </span>
        </button>
      </div>

      {/* Tab: Team */}
      {activeTab === "team" && (
        <>
          {usersLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => <UserCardSkeleton key={i} />)}
            </div>
          ) : nonAdmins.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-border py-16 text-center shadow-sm">
              <Users className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
              <p className="font-semibold text-sm text-foreground">No team members yet</p>
              <p className="text-muted-foreground text-xs mt-1">Users who sign up will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {nonAdmins.map((u: any) => (
                <UserCard key={u.id} u={u} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: Activity Feed */}
      {activeTab === "feed" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white border border-border/60 rounded-xl px-4 py-3 shadow-sm">
            <div className="flex flex-wrap items-end gap-3">
              {/* Filter by user */}
              <div className="flex-1 min-w-[160px]">
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Team member</label>
                <select
                  value={filterUserId}
                  onChange={e => setFilterUserId(e.target.value)}
                  className="w-full text-[13px] border border-border/60 rounded-lg px-3 py-1.5 bg-background outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All members</option>
                  {nonAdmins.map((u: any) => (
                    <option key={u.id} value={String(u.id)}>{u.name}</option>
                  ))}
                </select>
              </div>
              {/* From date */}
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">From</label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={e => setFilterDateFrom(e.target.value)}
                  className="w-full text-[13px] border border-border/60 rounded-lg px-3 py-1.5 bg-background outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {/* To date */}
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">To</label>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={e => setFilterDateTo(e.target.value)}
                  className="w-full text-[13px] border border-border/60 rounded-lg px-3 py-1.5 bg-background outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {/* Clear filters */}
              {hasFilters && (
                <button
                  onClick={() => { setFilterUserId(""); setFilterDateFrom(""); setFilterDateTo(""); }}
                  className="text-[12px] font-semibold text-muted-foreground hover:text-foreground underline underline-offset-2 whitespace-nowrap pb-1.5"
                >
                  Clear filters
                </button>
              )}
            </div>
            {hasFilters && (
              <p className="text-[12px] text-muted-foreground mt-2">
                Showing {allFeedPosts.length} of {rawFeedPosts.length} posts
              </p>
            )}
          </div>

          {feedLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl border border-border/60 shadow-sm p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-2.5 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              ))}
            </div>
          ) : allFeedPosts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-border py-16 text-center shadow-sm">
              <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
              <p className="font-semibold text-sm text-foreground">{hasFilters ? "No posts match your filters" : "No posts yet"}</p>
              <p className="text-muted-foreground text-xs mt-1">{hasFilters ? "Try adjusting your filters above." : "Team updates will appear here once posted."}</p>
            </div>
          ) : (
            allFeedPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={(id) => setFeedPosts(prev => prev ? prev.filter(p => p.id !== id) : null)}
              />
            ))
          )}
        </div>
      )}

    </div>
  );
}
