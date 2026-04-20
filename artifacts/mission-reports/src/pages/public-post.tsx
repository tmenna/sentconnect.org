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

function MediaItem({ photo, single }: { photo: Photo; single?: boolean }) {
  const isVideo = photo.mimeType?.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(photo.url);
  if (isVideo) {
    return (
      <video
        src={photo.url}
        controls
        className="w-full object-contain bg-black"
        style={{ maxHeight: single ? 560 : 340, borderRadius: single ? "0 0 10px 10px" : 8 }}
      />
    );
  }
  return (
    <img
      src={photo.url}
      alt=""
      className="w-full object-cover"
      style={{ maxHeight: single ? 560 : 340, borderRadius: single ? "0 0 10px 10px" : 8 }}
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
      .then(r => { if (!r.ok) { setNotFound(true); return null; } return r.json(); })
      .then(data => { if (data) setPost(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [postId]);

  return (
    <div className="min-h-screen px-4 py-10 sm:py-14" style={{ background: "#F3F4F6" }}>
      <div className="mx-auto w-full" style={{ maxWidth: 720 }}>

        {/* ── Loading ── */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-7 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3.5 w-36" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
            <Skeleton className="h-64 w-full" style={{ borderRadius: "0 0 10px 10px" }} />
          </div>
        )}

        {/* ── Not found ── */}
        {!loading && (notFound || !post) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-24 text-center">
            <p className="font-semibold" style={{ color: "#111827" }}>Post not found</p>
            <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>This link may be invalid or the post may have been removed.</p>
          </div>
        )}

        {/* ── Post card ── */}
        {!loading && post && (
          <article
            className="bg-white overflow-hidden"
            style={{
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            }}
          >
            {/* Mission Moment / Highlight banner */}
            {post.isMissionMoment ? (
              <div className="flex items-center gap-2 px-6 py-2.5" style={{ background: "#EFF6FF", borderBottom: "1px solid #BFDBFE" }}>
                <BookOpen className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#005BBC" }} />
                <span className="text-[12px] font-semibold tracking-wide uppercase" style={{ color: "#0268CE" }}>Mission Moments</span>
                {post.isHighlight && <Star className="h-3 w-3 fill-amber-400 text-amber-400 ml-0.5" />}
                <div className="flex-1" />
                <Sparkles className="h-3 w-3" style={{ color: "#93C5FD" }} />
              </div>
            ) : post.isHighlight ? (
              <div className="flex items-center gap-1.5 px-6 py-2 bg-amber-50 text-[12px] font-semibold text-amber-700 uppercase tracking-wide" style={{ borderBottom: "1px solid #FDE68A" }}>
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                Highlight
              </div>
            ) : null}

            {/* Author header */}
            <div className="flex items-center gap-3.5 px-6 pt-6 pb-4">
              <Avatar className="h-11 w-11 flex-shrink-0" style={{ boxShadow: "0 0 0 2px #fff, 0 0 0 3px #E5E7EB" }}>
                <AvatarImage src={post.author.avatarUrl ?? undefined} />
                <AvatarFallback className="font-bold text-[14px]" style={{ background: "#EFF6FF", color: "#005BBC" }}>
                  {post.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[15px] leading-tight" style={{ color: "#111827" }}>
                  {post.author.name}
                </p>
                <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                  <span className="text-[13px]" style={{ color: "#9CA3AF" }}>
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </span>
                  {post.location && (
                    <>
                      <span style={{ color: "#D1D5DB" }}>·</span>
                      <span className="flex items-center gap-1 text-[13px]" style={{ color: "#9CA3AF" }}>
                        <MapPin className="h-3 w-3" />
                        {post.location}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "#F3F4F6", margin: "0 24px" }} />

            {/* Post text */}
            {post.description && (
              <div className="px-6 pt-5 pb-4">
                <p
                  className="whitespace-pre-wrap"
                  style={{
                    fontSize: 16,
                    lineHeight: 1.75,
                    color: "#1F2937",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {post.description}
                </p>
              </div>
            )}

            {/* People reached badge */}
            {post.peopleReached != null && post.peopleReached > 0 && (
              <div className="px-6 pb-5">
                <span
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full"
                  style={{ background: "#EFF6FF", color: "#005BBC", border: "1px solid #BFDBFE" }}
                >
                  <Users className="h-3.5 w-3.5" />
                  {post.peopleReached.toLocaleString()} people reached
                </span>
              </div>
            )}

            {/* Photos / Videos */}
            {post.photos.length > 0 && (
              <div
                className={post.photos.length === 1 ? "" : "grid grid-cols-2 gap-1 px-1 pb-1"}
                style={post.photos.length === 1 ? { marginTop: post.description ? 4 : 0 } : {}}
              >
                {post.photos.length === 1 ? (
                  <MediaItem photo={post.photos[0]} single />
                ) : (
                  post.photos.map(photo => (
                    <div key={photo.id} className="overflow-hidden" style={{ borderRadius: 8 }}>
                      <MediaItem photo={photo} />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Footer */}
            <div
              className="text-center py-4"
              style={{ borderTop: "1px solid #F3F4F6" }}
            >
              <span className="text-[11px] tracking-wide" style={{ color: "#D1D5DB" }}>
                www.sentconnect.org
              </span>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
