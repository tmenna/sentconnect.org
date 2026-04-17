import { useState, useEffect } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Heart, MessageCircle, MapPin, Star, Users, X, ChevronLeft, ChevronRight, ArrowRight, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostCard, type PostData } from "@/components/post-card";
import { cn } from "@/lib/utils";

// ─── Masonry helpers ─────────────────────────────────────────────────────────

function ordinalSuffix(d: number) {
  if (d >= 11 && d <= 13) return "th";
  switch (d % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

function formatPostDate(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.getDate();
  return `${format(d, "MMM")} ${day}${ordinalSuffix(day)}, ${format(d, "yyyy")}`;
}

function extractTitleAndExcerpt(description: string | null | undefined) {
  if (!description?.trim()) return { title: "", excerpt: "" };
  const lines = description.split("\n").map(l => l.trim()).filter(Boolean);
  const title = lines[0].length > 80 ? lines[0].slice(0, 78) + "…" : lines[0];
  const excerpt = lines.slice(1).join(" ").trim();
  return { title, excerpt };
}

function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|mov)$/i.test(url);
}

// ─── Masonry card ─────────────────────────────────────────────────────────────

export function MasonryCard({
  post,
  onClick,
}: {
  post: PostData;
  onClick: () => void;
}) {
  const cover = post.photos[0];
  const isVideo = cover && isVideoUrl(cover.url);
  const { title, excerpt } = extractTitleAndExcerpt(post.description);
  const dateLabel = formatPostDate(post.createdAt);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      className="bg-white rounded-xl overflow-hidden cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      style={{
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        transition: "transform 150ms ease-out, box-shadow 150ms ease-out",
        breakInside: "avoid",
        marginBottom: "16px",
        display: "block",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
      }}
    >
      {/* Media — natural height, no forced aspect ratio */}
      {cover && (
        <div className="w-full overflow-hidden bg-gray-100">
          {isVideo ? (
            <video
              src={cover.url}
              preload="metadata"
              muted
              className="w-full object-cover"
              style={{ display: "block" }}
            />
          ) : (
            <img
              src={cover.url}
              alt={cover.caption || ""}
              loading="lazy"
              className="w-full object-cover block group-hover:scale-[1.02] transition-transform duration-300"
            />
          )}
        </div>
      )}

      {/* Content */}
      <div className="px-4 pt-3.5 pb-3">
        {/* Mission Moment badge */}
        {post.isMissionMoment && (
          <span className="inline-block text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 mb-2">
            Mission Moment
          </span>
        )}

        {/* Title */}
        {title && (
          <p className="font-bold text-[15px] leading-snug text-gray-900 mb-1.5">
            {title}
          </p>
        )}

        {/* Excerpt */}
        {excerpt && (
          <p className="text-[13.5px] leading-relaxed text-gray-500 line-clamp-4 mb-3">
            {excerpt}
          </p>
        )}

        {/* No excerpt but description exists — show single-line description as excerpt */}
        {!excerpt && !title && post.description && (
          <p className="text-[13.5px] leading-relaxed text-gray-500 line-clamp-4 mb-3">
            {post.description}
          </p>
        )}

        {/* Footer: date + open */}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid #F3F4F6" }}>
          <span className="text-[12px] text-gray-400">{dateLabel}</span>
          <span className="text-[12px] font-medium text-blue-500 group-hover:text-blue-700 flex items-center gap-0.5 transition-colors">
            open <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Masonry feed ─────────────────────────────────────────────────────────────

export function MasonryFeed({
  posts,
  onDelete,
}: {
  posts: PostData[];
  onDelete?: (id: number) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const sorted = [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-2xl py-16 text-center" style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <FileText className="h-8 w-8 mx-auto mb-3" style={{ color: "#D1D5DB" }} />
        <p className="font-medium text-[15px]" style={{ color: "#374151" }}>No posts yet</p>
        <p className="text-[14px] mt-1" style={{ color: "#9CA3AF" }}>Share your first update above.</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ columns: "4 200px", columnGap: "16px" }}>
        {sorted.map((post, i) => (
          <MasonryCard key={post.id} post={post} onClick={() => setSelectedIndex(i)} />
        ))}
      </div>

      {selectedIndex !== null && (
        <PostDetailModal
          post={sorted[selectedIndex]}
          allPosts={sorted}
          postIndex={selectedIndex}
          onNavigate={setSelectedIndex}
          onClose={() => setSelectedIndex(null)}
          onDelete={(id) => {
            onDelete?.(id);
            setSelectedIndex(null);
          }}
        />
      )}
    </>
  );
}

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
  allPosts = [],
  postIndex = 0,
  onNavigate,
  onClose,
  onDelete,
}: {
  post: PostData;
  allPosts?: PostData[];
  postIndex?: number;
  onNavigate?: (index: number) => void;
  onClose: () => void;
  onDelete?: (id: number) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const hasPrev = allPosts.length > 1 && postIndex > 0;
  const hasNext = allPosts.length > 1 && postIndex < allPosts.length - 1;

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  function handleClose() { setClosing(true); }
  function goPrev() { if (hasPrev) onNavigate?.(postIndex - 1); }
  function goNext() { if (hasNext) onNavigate?.(postIndex + 1); }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [postIndex, hasPrev, hasNext]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const isIn = visible && !closing;
  const DURATION = 200;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-6 px-4"
      aria-modal="true"
      role="dialog"
      onTransitionEnd={(e) => {
        if (closing && e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 backdrop-blur-sm"
        style={{
          backgroundColor: isIn ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0)",
          transition: `background-color ${DURATION}ms ease`,
        }}
        onClick={handleClose}
      />

      {/* Prev post arrow */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="fixed left-3 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/20 transition-all"
          aria-label="Previous post"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Next post arrow */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="fixed right-3 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/20 transition-all"
          aria-label="Next post"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Post panel — wide, centered, full PostCard */}
      <div
        className="relative z-10 w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{
          maxWidth: 920,
          opacity: isIn ? 1 : 0,
          transform: isIn ? "translateY(0px) scale(1)" : "translateY(20px) scale(0.97)",
          transition: `opacity ${DURATION}ms ease, transform ${DURATION}ms ease`,
        }}
        onTransitionEnd={(e) => {
          if (closing && e.propertyName === "opacity") onClose();
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar: counter + close */}
        <div className="flex items-center justify-between px-5 pt-4 pb-0">
          {allPosts.length > 1 ? (
            <span className="text-[12px] font-medium text-gray-400">
              {postIndex + 1} / {allPosts.length}
            </span>
          ) : <span />}
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Close"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Full PostCard — comments open by default, no "View post" link */}
        <PostCard
          post={post}
          defaultShowComments
          hideViewPost
          onDelete={(id) => { onDelete?.(id); onClose(); }}
        />
      </div>
    </div>
  );
}
