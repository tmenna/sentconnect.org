import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow, format } from "date-fns";
import {
  MessageCircle, MapPin, Star, X, ChevronLeft, ChevronRight,
  FileText, Heart,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostCard, type PostData } from "@/components/post-card";

// ─── helpers ──────────────────────────────────────────────────────────────────

function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|mov)$/i.test(url);
}

function extractTitleAndExcerpt(description: string | null | undefined) {
  if (!description?.trim()) return { title: "", excerpt: "" };
  const lines = description.split("\n").map(l => l.trim()).filter(Boolean);
  const title = lines[0].length > 80 ? lines[0].slice(0, 78) + "…" : lines[0];
  const excerpt = lines.slice(1).join(" ").trim();
  return { title, excerpt };
}

// Derive a category label + pill colors from post content
function getCategoryInfo(post: PostData): { label: string; bg: string; color: string } {
  if (post.isMissionMoment) return { label: "Mission Moment", bg: "#D1FAE5", color: "#065F46" };
  if (post.isHighlight) return { label: "Highlight", bg: "#FEF3C7", color: "#92400E" };
  const text = (post.description ?? "").toLowerCase();
  if (/graduat/.test(text)) return { label: "Graduation", bg: "#CFFAFE", color: "#0E7490" };
  if (/church|worship|service/.test(text)) return { label: "Church Visit", bg: "#D1FAE5", color: "#065F46" };
  if (/outreach/.test(text)) return { label: "Outreach", bg: "#FEF3C7", color: "#B45309" };
  if (/discipl/.test(text)) return { label: "Discipleship", bg: "#EDE9FE", color: "#5B21B6" };
  if (/persecut/.test(text)) return { label: "Persecution", bg: "#FEE2E2", color: "#991B1B" };
  if (/train/.test(text)) return { label: "Training", bg: "#DBEAFE", color: "#1D4ED8" };
  if (/pray|prayer/.test(text)) return { label: "Prayer", bg: "#FCE7F3", color: "#9D174D" };
  if (/bapti/.test(text)) return { label: "Baptism", bg: "#E0F2FE", color: "#0369A1" };
  if (/evangel/.test(text)) return { label: "Evangelism", bg: "#D1FAE5", color: "#065F46" };
  if (/visit/.test(text)) return { label: "Field Visit", bg: "#FEF3C7", color: "#B45309" };
  const palettes = [
    { label: "Team Update", bg: "#DBEAFE", color: "#1D4ED8" },
    { label: "Field Report", bg: "#D1FAE5", color: "#065F46" },
    { label: "Community", bg: "#EDE9FE", color: "#5B21B6" },
    { label: "Outreach", bg: "#FEF3C7", color: "#B45309" },
    { label: "Ministry", bg: "#FCE7F3", color: "#9D174D" },
    { label: "Update", bg: "#CFFAFE", color: "#0E7490" },
  ];
  return palettes[post.id % palettes.length];
}

// Placeholder gradients when no image
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

// ─── MasonryCard — Instagram/LinkedIn style ───────────────────────────────────

export function MasonryCard({
  post,
  onClick,
}: {
  post: PostData;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [coverImgError, setCoverImgError] = useState(false);

  const coverPhoto = post.photos.find(p => p.url) || null;
  const isVideo = coverPhoto ? isVideoUrl(coverPhoto.url) : false;
  const hasImage = !!coverPhoto && !coverImgError && !isVideo;
  const hasVideo = !!coverPhoto && !coverImgError && isVideo;
  const extraPhotos = post.photos.length > 1 ? post.photos.length - 1 : 0;

  const { title, excerpt } = extractTitleAndExcerpt(post.description);
  const displayTitle = title || (post.description ? post.description.slice(0, 80) : "");
  const displayExcerpt = excerpt;

  const dateLabel = format(new Date(post.createdAt), "MMM d, yyyy");
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  const category = getCategoryInfo(post);
  const thumb = post.isMissionMoment ? THUMB_MOMENT : post.isHighlight ? THUMB_HIGHLIGHT : THUMB_DEFAULT;

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
        boxShadow: hovered
          ? "0 16px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.07)"
          : "0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)",
        transition: "transform 220ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 220ms ease-out",
        cursor: "pointer",
      }}
      className="bg-white rounded-2xl overflow-hidden flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40"
    >
      {/* ── Image / placeholder zone ── */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ aspectRatio: "16/9" }}>
        {hasImage && (
          <img
            src={coverPhoto!.url}
            alt={coverPhoto!.caption || ""}
            className="w-full h-full object-cover"
            style={{
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 420ms cubic-bezier(0.25,0.46,0.45,0.94)",
            }}
            loading="lazy"
            onError={() => setCoverImgError(true)}
          />
        )}
        {hasVideo && (
          <video
            src={coverPhoto!.url}
            preload="metadata"
            muted
            className="w-full h-full object-cover"
            style={{
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 420ms ease",
            }}
          />
        )}
        {!hasImage && !hasVideo && (
          <div className="w-full h-full flex items-center justify-center" style={{ background: thumb.bg }}>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: thumb.iconBg, backdropFilter: "blur(6px)" }}
            >
              {thumb.icon}
            </div>
          </div>
        )}

        {/* Bottom-up gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0) 15%, rgba(0,0,0,0.18) 48%, rgba(0,0,0,0.82) 100%)",
          }}
        />

        {/* Top pills row */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              background: category.bg,
              color: category.color,
              borderRadius: 999,
              padding: "3px 10px",
              maxWidth: "58%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.6,
            }}
          >
            {category.label}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              background: "rgba(0,0,0,0.48)",
              color: "rgba(255,255,255,0.95)",
              borderRadius: 999,
              padding: "3px 10px",
              backdropFilter: "blur(6px)",
              flexShrink: 0,
              lineHeight: 1.6,
            }}
          >
            {dateLabel}
          </span>
        </div>

        {/* Bottom overlay content */}
        <div className="absolute bottom-0 left-0 right-0 px-3.5 pb-3.5 pt-10">
          {/* Title */}
          {displayTitle && (
            <p
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.35,
                letterSpacing: "-0.01em",
                marginBottom: 7,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              } as React.CSSProperties}
            >
              {displayTitle}
            </p>
          )}

          {/* Reaction / meta row */}
          <div
            className="flex items-center gap-3"
            style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", flexWrap: "wrap" }}
          >
            <span className="flex items-center gap-1">
              <Heart
                className="h-3 w-3"
                style={{
                  fill: post.likedByMe ? "#FCA5A5" : "none",
                  color: post.likedByMe ? "#FCA5A5" : "rgba(255,255,255,0.78)",
                }}
              />
              {post.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {post.commentCount}
            </span>
            {post.location && (
              <span className="flex items-center gap-1 min-w-0">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span
                  className="truncate"
                  style={{ maxWidth: 80 }}
                >
                  {post.location}
                </span>
              </span>
            )}
            {extraPhotos > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
                +{extraPhotos} photos
              </span>
            )}
            <span className="ml-auto flex-shrink-0" style={{ fontSize: 11 }}>{timeAgo}</span>
          </div>
        </div>
      </div>

      {/* ── Content below image ── */}
      <div className="flex flex-col flex-1 px-3.5 pt-3 pb-3">
        {/* Excerpt */}
        {displayExcerpt ? (
          <p
            className="line-clamp-2 mb-3"
            style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.55, flexGrow: 1 }}
          >
            {displayExcerpt}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        {/* Author + Open button row */}
        <div
          className="flex items-center gap-2 pt-2.5"
          style={{ borderTop: "1px solid #F3F4F6" }}
        >
          <Avatar className="h-7 w-7 flex-shrink-0 ring-1 ring-white shadow-sm">
            <AvatarImage src={post.author.avatarUrl ?? undefined} />
            <AvatarFallback
              className="text-[10px] font-bold"
              style={{ background: "#F3E8FF", color: "#9A27FF" }}
            >
              {post.author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate" style={{ fontSize: 12, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
              {post.author.name}
            </p>
            <p style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1.2 }}>Team Member</p>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#8705FA",
              border: "1px solid #E9D5FF",
              borderRadius: 999,
              padding: "4px 13px",
              background: hovered ? "#F9F0FF" : "white",
              transition: "background 150ms ease",
              flexShrink: 0,
            }}
          >
            Open
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── MasonryFeed (used on report detail page etc.) ────────────────────────────

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
      <div
        className="bg-white rounded-2xl py-16 text-center"
        style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        <FileText className="h-8 w-8 mx-auto mb-3" style={{ color: "#D1D5DB" }} />
        <p className="font-medium text-[15px]" style={{ color: "#374151" }}>No posts yet</p>
        <p className="text-[14px] mt-1" style={{ color: "#9CA3AF" }}>Share your first update above.</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ columns: "3 280px", columnGap: "20px" }}>
        {sorted.map((post, i) => (
          <div
            key={post.id}
            style={{ breakInside: "avoid", display: "inline-block", width: "100%", marginBottom: 20 }}
          >
            <MasonryCard post={post} onClick={() => setSelectedIndex(i)} />
          </div>
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

// ─── FeedGridCard (legacy — kept for compatibility) ───────────────────────────

export function FeedGridCard({
  post,
  onClick,
}: {
  post: PostData;
  onClick: () => void;
}) {
  return <MasonryCard post={post} onClick={onClick} />;
}

// ─── PostDetailModal ──────────────────────────────────────────────────────────

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
      {/* Backdrop */}
      <div
        className="fixed inset-0 backdrop-blur-sm"
        style={{
          backgroundColor: isIn ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0)",
          transition: `background-color ${DURATION}ms ease`,
        }}
        onClick={handleClose}
      />

      {/* Scrollable page */}
      <div className="relative min-h-full flex flex-col items-center py-8 px-4 sm:px-8">

        {/* Panel */}
        <div
          className="relative z-10 w-full bg-white rounded-2xl shadow-2xl"
          style={{
            maxWidth: 960,
            opacity: isIn ? 1 : 0,
            transform: isIn ? "translateY(0px) scale(1)" : "translateY(20px) scale(0.97)",
            transition: `opacity ${DURATION}ms ease, transform ${DURATION}ms ease`,
          }}
          onTransitionEnd={(e) => {
            if (closing && e.propertyName === "opacity") onClose();
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticky header bar */}
          <div
            className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 rounded-t-2xl"
          >
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

          {/* Post content */}
          <PostCard
            post={post}
            defaultShowComments
            hideViewPost
            onDelete={(id) => { onDelete?.(id); onClose(); }}
          />
        </div>

        {/* Prev / Next arrows */}
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
