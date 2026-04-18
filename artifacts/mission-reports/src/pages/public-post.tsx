import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { MapPin, BookOpen, Sparkles, Star, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

type Photo = { id: number; url: string; mimeType?: string };
type Post = {
  id: number;
  description?: string | null;
  location?: string | null;
  peopleReached?: number | null;
  isMissionMoment?: boolean;
  isHighlight?: boolean;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  photos: Photo[];
  author: { id: number; name: string; avatarUrl?: string | null; location?: string | null; organization?: string | null };
};

function MediaItem({ photo }: { photo: Photo }) {
  const isVideo = photo.mimeType?.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(photo.url);
  if (isVideo) {
    return (
      <video
        src={photo.url}
        controls
        className="w-full max-h-[600px] object-contain bg-black"
      />
    );
  }
  return (
    <img
      src={photo.url}
      alt=""
      className="w-full object-cover"
      style={{ maxHeight: 600 }}
    />
  );
}

export default function PublicPost() {
  const params = useParams<{ id: string }>();
  const postId = Number(params.id);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!postId) { setNotFound(true); setLoading(false); return; }
    fetch(`/api/reports/${postId}/public`)
      .then(r => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then(data => { if (data) setPost(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [postId]);

  return (
    <div className="min-h-screen bg-white">
      {loading ? (
        <div className="max-w-2xl mx-auto px-5 py-8 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      ) : notFound || !post ? (
        <div className="max-w-2xl mx-auto px-5 py-24 text-center">
          <p className="font-semibold text-foreground">Post not found</p>
          <p className="text-muted-foreground text-sm mt-1">This link may be invalid or the post may have been removed.</p>
        </div>
      ) : (
        <div className="w-full">
          {/* Mission Moment / Highlight banner */}
          {post.isMissionMoment ? (
            <div className="flex items-center gap-2 px-5 py-2.5 border-b" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
              <BookOpen className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#005BBC" }} />
              <span className="text-[12px] font-semibold" style={{ color: "#004699" }}>Mission Moments</span>
              {post.isHighlight && <Star className="h-3 w-3 fill-amber-400 text-amber-400 ml-0.5" />}
              <div className="flex-1" />
              <Sparkles className="h-3 w-3" style={{ color: "#93C5FD" }} />
            </div>
          ) : post.isHighlight ? (
            <div className="flex items-center gap-1.5 px-5 py-2 bg-amber-50 border-b border-amber-100 text-[12px] font-medium text-amber-700">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              Highlight
            </div>
          ) : null}

          {/* Author header */}
          <div className="flex items-start gap-3 px-5 pt-5 pb-3">
            <Avatar className="h-11 w-11 flex-shrink-0 ring-2 ring-white shadow-sm">
              <AvatarImage src={post.author.avatarUrl ?? undefined} />
              <AvatarFallback className="font-semibold text-[14px]" style={{ background: "#E5E7EB", color: "#374151" }}>
                {post.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[15px]" style={{ color: "#111827" }}>{post.author.name}</p>
              <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                <span className="text-[12.5px]" style={{ color: "#6B7280" }}>
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
                {post.location && (
                  <>
                    <span style={{ color: "#D1D5DB", fontSize: 10 }}>•</span>
                    <span className="flex items-center gap-1 text-[12.5px]" style={{ color: "#6B7280" }}>
                      <MapPin className="h-3 w-3" style={{ color: "#9CA3AF" }} />
                      {post.location}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Text */}
          {post.description && (
            <div className="px-5 pb-4">
              <p className="text-[17px] leading-[1.8] tracking-[-0.01em] whitespace-pre-wrap" style={{ color: "#111827" }}>
                {post.description}
              </p>
            </div>
          )}

          {/* People reached */}
          {post.peopleReached != null && post.peopleReached > 0 && (
            <div className="px-5 pb-4">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#005BBC] bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                <Users className="h-3.5 w-3.5" />
                {post.peopleReached.toLocaleString()} people reached
              </span>
            </div>
          )}

          {/* Photos */}
          {post.photos.length > 0 && (
            <div className={post.photos.length === 1 ? "" : "grid grid-cols-2 gap-1"}>
              {post.photos.length === 1 ? (
                <MediaItem photo={post.photos[0]} />
              ) : (
                post.photos.map(photo => (
                  <div key={photo.id} className="overflow-hidden">
                    <MediaItem photo={photo} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
