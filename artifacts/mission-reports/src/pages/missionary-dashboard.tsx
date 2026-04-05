import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useGetUserReports, getGetUserReportsQueryKey } from "@workspace/api-client-react";
import { Redirect } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard, type PostData } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { MapPin, Building2, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MissionaryDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [posts, setPosts] = useState<PostData[] | null>(null);

  const { data, isLoading: postsLoading } = useGetUserReports(
    { id: user?.id ?? 0 },
    {
      query: {
        enabled: !!user?.id,
        queryKey: getGetUserReportsQueryKey({ id: user?.id ?? 0 }),
        onSuccess: (data: any) => {
          if (posts === null) setPosts(data ?? []);
        },
      },
    }
  );

  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/login" />;
  if (user?.role === "admin") return <Redirect href="/admin" />;

  const myPosts: PostData[] = posts ?? ((data ?? []) as PostData[]);

  function handleDelete(id: number) {
    setPosts(prev => prev ? prev.filter(p => p.id !== id) : null);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Identity card */}
      <div className="bg-white rounded-xl border border-border/60 shadow-sm p-5 flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={user?.avatarUrl ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
            {user?.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[16px] text-foreground">{user?.name}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
            {user?.location && (
              <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                <MapPin className="h-3 w-3" />{user.location}
              </span>
            )}
            {user?.organization && (
              <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                <Building2 className="h-3 w-3" />{user.organization}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[22px] font-bold text-foreground leading-none">{myPosts.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1 justify-end">
            <FileText className="h-3 w-3" />posts
          </p>
        </div>
      </div>

      {/* Composer */}
      <PostComposer
        onPost={(newPost) => setPosts(prev => prev ? [newPost, ...prev] : [newPost])}
      />

      {/* Timeline */}
      {postsLoading && posts === null ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-xl border border-border/60 shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : myPosts.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-border py-16 text-center shadow-sm">
          <FileText className="h-8 w-8 mx-auto text-muted-foreground/20 mb-3" />
          <p className="font-semibold text-foreground text-sm">No posts yet</p>
          <p className="text-muted-foreground text-xs mt-1">Share your first update above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myPosts.map(post => (
            <PostCard key={post.id} post={post} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
