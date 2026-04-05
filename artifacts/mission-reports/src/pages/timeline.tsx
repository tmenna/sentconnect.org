import { useState } from "react";
import { useGetTimeline, getGetTimelineQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard, type PostData } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { useAuth } from "@/components/auth-provider";
import { formatDistanceToNow } from "date-fns";
import { Globe, Users, Rss } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function Sidebar({ posts }: { posts: PostData[] }) {
  const seen = new Set<number>();
  const authors = posts
    .map((p) => p.author)
    .filter((a) => { if (seen.has(a.id)) return false; seen.add(a.id); return true; });

  return (
    <aside className="hidden lg:block w-64 flex-shrink-0">
      <div className="sticky top-[72px] space-y-4 max-h-[calc(100vh-100px)] overflow-y-auto pr-1">

        {/* Who's here */}
        <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Who's Here
            </h3>
          </div>
          <div className="p-3 space-y-1">
            {authors.slice(0, 8).map((a) => (
              <Link key={a.id} href={`/missionaries/${a.id}`}>
                <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors group">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={a.avatarUrl ?? undefined} />
                    <AvatarFallback className="text-[11px] font-bold bg-primary/10 text-primary">
                      {a.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {a.name}
                  </span>
                </div>
              </Link>
            ))}
            {authors.length === 0 && (
              <p className="text-[12px] text-muted-foreground px-2 py-1">No posts yet.</p>
            )}
          </div>
        </div>

        {/* Recent posts */}
        <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2">
            <Rss className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Recent
            </h3>
          </div>
          <div className="divide-y divide-border/40">
            {posts.slice(0, 5).map((p) => {
              const firstPhoto = p.photos[0];
              return (
                <Link key={p.id} href={`/reports/${p.id}`}>
                  <div className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer group">
                    {firstPhoto ? (
                      <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 border border-border/40 bg-muted">
                        <img src={firstPhoto.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-lg flex-shrink-0 bg-primary/8 flex items-center justify-center border border-border/40">
                        <Globe className="h-4 w-4 text-primary/30" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {p.description?.slice(0, 60) || "…"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {p.author.name} · {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </aside>
  );
}

function PostSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border/60 shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}

export default function Feed() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<PostData[] | null>(null);
  const { data, isLoading, isError } = useGetTimeline(
    { limit: 40 },
    {
      query: {
        queryKey: getGetTimelineQueryKey({ limit: 40 }),
        onSuccess: (data: any) => {
          if (posts === null) setPosts(data?.reports ?? []);
        },
      },
    }
  );

  const allPosts: PostData[] = posts ?? (data?.reports ?? []) as PostData[];

  function handleDelete(id: number) {
    setPosts(prev => prev ? prev.filter(p => p.id !== id) : null);
  }

  if (isLoading) {
    return (
      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
        <div className="hidden lg:block w-64 space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive text-sm font-medium">Could not load posts.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 items-start">
      <Sidebar posts={allPosts} />
      <div className="flex-1 min-w-0 space-y-4">
        {isAuthenticated && (
          <PostComposer
            onPost={(newPost) => setPosts(prev => prev ? [newPost, ...prev] : [newPost])}
          />
        )}

        {allPosts.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-border py-20 text-center shadow-sm">
            <Globe className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
            <p className="font-semibold text-foreground text-sm">No posts yet</p>
            <p className="text-muted-foreground text-xs mt-1">Be the first to share an update.</p>
          </div>
        ) : (
          allPosts.map(post => (
            <PostCard key={post.id} post={post} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
}
