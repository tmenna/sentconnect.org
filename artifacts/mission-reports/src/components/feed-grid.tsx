import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { ThumbsUp, MessageCircle, MapPin, Star, X, ChevronLeft, ChevronRight, ArrowRight, FileText } from "lucide-react";
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

// ─── Pastel thumbnail palettes per post type ─────────────────────────────────

const THUMB_MOMENT = {
  bg: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 60%, #6EE7B7 100%)",
  iconBg: "rgba(255,255,255,0.55)",
  icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
};
const THUMB_HIGHLIGHT = {
  bg: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 60%, #FCD34D 100%)",
  iconBg: "rgba(255,255,255,0.55)",
  icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
};
const THUMB_DEFAULT = {
  bg: "linear-gradient(135deg, #F3E8FF 0%, #DBEAFE 60%, #D8B4FE 100%)",
  iconBg: "rgba(255,255,255,0.55)",
  icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
};

// ─── Grid card ──────────────────────────────────────────────────────────────

export function FeedGridCard({
  post,
  onClick,
}: {
  post: PostData;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [coverImgError, setCoverImgError] = useState(false);
  const coverPhoto = post.photos.find(p => p.url);
  const extraPhotos = post.photos.length - 1;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  // Thumbnail palette when no photo
  const thumb = post.isMissionMoment ? THUMB_MOMENT : post.isHighlight ? THUMB_HIGHLIGHT : THUMB_DEFAULT;

  // Extract title + excerpt from description
  const lines = (post.description ?? "").split("\n").map(l => l.trim()).filter(Boolean);
  const title = lines[0] ? (lines[0].length > 90 ? lines[0].slice(0, 88) + "…" : lines[0]) : "";
  const excerpt = lines.slice(1).join(" ").trim();

  const dateLabel = format(new Date(post.createdAt), "MMM d, yyyy");

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: hovered ? "translateY(-3px)" : "translateY(0px)",
        boxShadow: hovered
          ? "0 16px 40px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)"
          : "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
        transition: "transform 180ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 180ms ease-out",
        cursor: "pointer",
      }}
      className="bg-white rounded-2xl overflow-hidden flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40"
    >
      {/* ── Thumbnail ── */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ aspectRatio: "3/2" }}>
        {(coverPhoto && !coverImgError) ? (
          <>
            <img
              src={coverPhoto.url}
              alt={coverPhoto.caption || ""}
              className="w-full h-full object-cover"
              style={{
                transform: hovered ? "scale(1.05)" : "scale(1)",
                transition: "transform 400ms cubic-bezier(0.25,0.46,0.45,0.94)",
              }}
              loading="lazy"
              onError={() => setCoverImgError(true)}
            />
            {/* Bottom gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.18) 38%, transparent 62%)" }}
            />
            {/* Date + photo count inside gradient */}
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-3 pb-2.5">
              <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.88)", letterSpacing: "0.02em" }}>
                {dateLabel}
              </span>
              {extraPhotos > 0 && (
                <span className="flex items-center gap-1 text-white/80" style={{ fontSize: 11, fontWeight: 600 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                  +{extraPhotos}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3" style={{ background: thumb.bg }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: thumb.iconBg, backdropFilter: "blur(6px)" }}>
              {thumb.icon}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: post.isMissionMoment ? "#065F46" : "#3730A3", letterSpacing: "0.03em", opacity: 0.75 }}>
              {dateLabel}
            </span>
          </div>
        )}

        {/* Category badge — top-left, on image */}
        {post.isMissionMoment && (
          <div className="absolute top-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full" style={{ background: "rgba(5,150,105,0.92)", color: "#fff", backdropFilter: "blur(4px)" }}>
              ★ Mission Moment
            </span>
          </div>
        )}
        {post.isHighlight && !post.isMissionMoment && (
          <div className="absolute top-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full" style={{ background: "rgba(180,83,9,0.88)", color: "#fff", backdropFilter: "blur(4px)" }}>
              ★ Highlight
            </span>
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 px-3.5 pt-3 pb-3.5">

        {/* Title */}
        <p className="font-semibold leading-snug mb-1" style={{ fontSize: 14, color: "#111827", lineHeight: 1.45 }}>
          {title || post.description?.slice(0, 90) || "Untitled update"}
        </p>

        {/* Excerpt */}
        {(title && (excerpt || post.description)) && (
          <p className="line-clamp-2 flex-1 mb-2.5" style={{ fontSize: 12.5, color: "#6B7280", lineHeight: 1.55 }}>
            {excerpt || post.description}
          </p>
        )}
        {!title && <div className="flex-1" />}

        {/* ── Footer ── */}
        <div className="flex items-center gap-2 pt-2.5" style={{ borderTop: "1px solid #F3F4F6" }}>
          <Avatar className="h-6 w-6 flex-shrink-0 ring-1 ring-white shadow-sm">
            <AvatarImage src={post.author.avatarUrl ?? undefined} />
            <AvatarFallback className="text-[9px] font-bold" style={{ background: "#EDE9FE", color: "#7C3AED" }}>
              {post.author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate" style={{ fontSize: 11, fontWeight: 600, color: "#374151", lineHeight: 1.2 }}>{post.author.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span style={{ fontSize: 10, color: "#9CA3AF" }}>{timeAgo}</span>
              {post.location && (
                <span className="hidden sm:flex items-center gap-0.5" style={{ color: "#9CA3AF" }}>
                  <span style={{ fontSize: 9 }}>·</span>
                  <MapPin className="h-2 w-2 flex-shrink-0" />
                  <span className="truncate max-w-[60px]" style={{ fontSize: 10 }}>{post.location}</span>
                </span>
              )}
              {(post.likeCount > 0 || post.commentCount > 0) && (
                <span className="flex items-center gap-1.5" style={{ color: "#9CA3AF" }}>
                  <span style={{ fontSize: 9 }}>·</span>
                  {post.likeCount > 0 && (
                    <span className="flex items-center gap-0.5" style={{ fontSize: 10 }}>
                      <ThumbsUp className={cn("h-2.5 w-2.5", post.likedByMe && "fill-violet-500 text-violet-500")} />
                      {post.likeCount}
                    </span>
                  )}
                  {post.commentCount > 0 && (
                    <span className="flex items-center gap-0.5" style={{ fontSize: 10 }}>
                      <MessageCircle className="h-2.5 w-2.5" />
                      {post.commentCount}
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
          <span
            className="flex items-center gap-0.5 flex-shrink-0 font-semibold transition-all duration-150"
            style={{ fontSize: 11, color: hovered ? "#7C3AED" : "#8705FA", opacity: hovered ? 1 : 0.7 }}
          >
            Open <ArrowRight className="h-2.5 w-2.5" />
          </span>
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasPrev = allPosts.length > 1 && postIndex > 0;
  const hasNext = allPosts.length > 1 && postIndex < allPosts.length - 1;

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Scroll panel back to top whenever the post changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [post.id]);

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
      ref={scrollRef}
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-modal="true"
      role="dialog"
    >
      {/* Fixed backdrop */}
      <div
        className="fixed inset-0 backdrop-blur-sm"
        style={{
          backgroundColor: isIn ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0)",
          transition: `background-color ${DURATION}ms ease`,
        }}
        onClick={handleClose}
      />

      {/* Scrollable page content */}
      <div className="relative min-h-full flex flex-col items-center py-8 px-4 sm:px-8">

        {/* Post panel — full natural height, page scrolls */}
        <div
          className="relative z-10 w-full bg-white rounded-2xl shadow-2xl"
          style={{
            maxWidth: 1020,
            opacity: isIn ? 1 : 0,
            transform: isIn ? "translateY(0px) scale(1)" : "translateY(20px) scale(0.97)",
            transition: `opacity ${DURATION}ms ease, transform ${DURATION}ms ease`,
          }}
          onTransitionEnd={(e) => {
            if (closing && e.propertyName === "opacity") onClose();
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticky top bar — stays pinned while scrolling */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 rounded-t-2xl">
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

          {/* Full post content */}
          <PostCard
            post={post}
            defaultShowComments
            hideViewPost
            onDelete={(id) => { onDelete?.(id); onClose(); }}
          />
        </div>

        {/* Prev / Next arrows float beside the panel */}
        {hasPrev && (
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="fixed left-3 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/20 transition-all"
            aria-label="Previous post"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {hasNext && (
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="fixed right-3 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/20 transition-all"
            aria-label="Next post"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
}
