import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, MapPin, Star, Users, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostCard, type PostData } from "@/components/post-card";
import { cn } from "@/lib/utils";

// ─── Grid card ──────────────────────────────────────────────────────────────

export function FeedGridCard({
  post,
  onClick,
}: {
  post: PostData;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const coverPhoto = post.photos[0];
  const extraPhotos = post.photos.length - 1;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: hovered ? "translateY(-4px)" : "translateY(0px)",
        boxShadow: hovered ? "0 12px 28px rgba(0,0,0,0.11)" : "0 1px 3px rgba(0,0,0,0.07)",
        transition: "transform 160ms ease-out, box-shadow 160ms ease-out",
        cursor: "pointer",
      }}
      className={cn(
        "bg-white rounded-2xl border overflow-hidden flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        post.isHighlight ? "border-amber-300" : "border-border/60"
      )}
    >
      {/* Cover image */}
      <div className="relative aspect-[4/3] bg-muted/30 overflow-hidden flex-shrink-0">
        {coverPhoto ? (
          <img
            src={coverPhoto.url}
            alt={coverPhoto.caption || ""}
            className="w-full h-full object-cover"
            style={{
              transform: hovered ? "scale(1.04)" : "scale(1)",
              transition: "transform 300ms ease-out",
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
            <MessageCircle className="h-10 w-10 text-primary/20" />
          </div>
        )}

        {/* Highlight badge */}
        {post.isHighlight && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-amber-400/90 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow">
            <Star className="h-3 w-3 fill-white" /> Highlight
          </div>
        )}

        {/* Extra photo count */}
        {extraPhotos > 0 && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/55 backdrop-blur-sm text-white text-[12px] font-semibold px-2 py-0.5 rounded-full">
            +{extraPhotos}
          </div>
        )}

        {/* People reached badge */}
        {post.peopleReached != null && post.peopleReached > 0 && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow">
            <Users className="h-3 w-3" />
            {post.peopleReached.toLocaleString()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5">
        {/* Author row */}
        <div className="flex items-center gap-2 mb-2.5">
          <Avatar className="h-7 w-7 flex-shrink-0">
            <AvatarImage src={post.author.avatarUrl ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
              {post.author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-foreground leading-tight truncate">{post.author.name}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">{timeAgo}</p>
          </div>
          {post.location && (
            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground flex-shrink-0 max-w-[80px]">
              <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
              <span className="truncate">{post.location}</span>
            </div>
          )}
        </div>

        {/* Post text preview */}
        {post.description && (
          <p className="text-[13px] text-foreground leading-snug line-clamp-3 flex-1 mb-3">
            {post.description}
          </p>
        )}

        {/* Footer stats */}
        <div className="flex items-center gap-3 mt-auto pt-2 border-t border-border/30">
          <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
            <Heart className={cn("h-3.5 w-3.5", post.likedByMe && "fill-red-500 text-red-500")} />
            <span>{post.likeCount > 0 ? post.likeCount : ""}</span>
          </div>
          <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>{post.commentCount > 0 ? post.commentCount : ""}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Post detail modal ───────────────────────────────────────────────────────

export function PostDetailModal({
  post,
  onClose,
  onDelete,
}: {
  post: PostData;
  onClose: () => void;
  onDelete?: (id: number) => void;
}) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = post.photos;

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && photos.length > 1) setPhotoIndex(i => (i + 1) % photos.length);
      if (e.key === "ArrowLeft" && photos.length > 1) setPhotoIndex(i => (i - 1 + photos.length) % photos.length);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, photos.length]);

  // Prevent body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-4xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image gallery panel */}
        {photos.length > 0 && (
          <div className="relative flex-shrink-0 w-full md:w-[55%] bg-black flex items-center justify-center">
            <img
              src={photos[photoIndex]?.url}
              alt={photos[photoIndex]?.caption || ""}
              className="w-full h-60 md:h-full max-h-[90vh] object-contain"
            />

            {/* Gallery nav */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setPhotoIndex(i => (i - 1 + photos.length) % photos.length); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setPhotoIndex(i => (i + 1) % photos.length); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setPhotoIndex(i); }}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all",
                        i === photoIndex ? "bg-white scale-125" : "bg-white/50"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Post card scroll panel */}
        <div
          className="flex-1 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <PostCard
            post={post}
            onDelete={(id) => { onDelete?.(id); onClose(); }}
          />
        </div>
      </div>
    </div>
  );
}
