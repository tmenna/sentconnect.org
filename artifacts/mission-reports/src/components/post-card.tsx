import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import {
  Heart, ThumbsUp, MessageCircle, MapPin, MoreHorizontal, Trash2, Pencil,
  Send, Star, X, Loader2, Check, Navigation, BookOpen, Sparkles, PlayCircle,
  Link2, ImageDown, ChevronLeft, ChevronRight, ZoomIn
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { useOrg } from "@/providers/org-provider";
import { cn } from "@/lib/utils";
import { SlideExportModal } from "./slide-export-modal";

export type PostData = {
  id: number;
  description?: string | null;
  location?: string | null;
  visibility: string;
  isHighlight?: boolean;
  isMissionMoment?: boolean;
  createdAt: string;
  likeCount: number;
  loveCount: number;
  commentCount: number;
  likedByMe: boolean;
  lovedByMe: boolean;
  author: {
    id: number;
    name: string;
    avatarUrl?: string | null;
    role?: string;
    bio?: string | null;
  };
  photos: { id: number; url: string; caption?: string | null; mimeType?: string | null }[];
};

type Comment = {
  id: number;
  text: string;
  createdAt: string;
  author: { id: number; name: string; avatarUrl?: string | null };
};

function isVideoItem(p: PostData["photos"][number]) {
  if (p.mimeType) return p.mimeType.startsWith("video/");
  return /\.(mp4|webm|ogg|mov)$/i.test(p.url);
}

function PhotoLightbox({
  photos,
  initialIndex,
  onClose,
}: {
  photos: PostData["photos"];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const current = photos[index];
  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) setIndex(i => i - 1);
      if (e.key === "ArrowRight" && hasNext) setIndex(i => i + 1);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [hasPrev, hasNext, onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/92"
      onClick={onClose}
    >
      {/* Counter */}
      {photos.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-[13px] font-medium z-10 pointer-events-none select-none">
          {index + 1} / {photos.length}
        </div>
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors z-10"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Prev arrow */}
      {hasPrev && (
        <button
          onClick={e => { e.stopPropagation(); setIndex(i => i - 1); }}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors z-10"
          aria-label="Previous photo"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
      )}

      {/* Media */}
      <div
        className="flex items-center justify-center px-16 sm:px-20 max-w-[100vw] max-h-[100vh] w-full h-full"
        onClick={e => e.stopPropagation()}
      >
        {isVideoItem(current) ? (
          <video
            key={current.url}
            src={current.url}
            controls
            autoPlay
            playsInline
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
          />
        ) : (
          <img
            key={current.url}
            src={current.url}
            alt={current.caption || ""}
            className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl select-none"
            draggable={false}
          />
        )}
      </div>

      {/* Caption */}
      {current.caption && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-[13px] text-center bg-black/40 px-4 py-1.5 rounded-full pointer-events-none max-w-[80vw] truncate">
          {current.caption}
        </div>
      )}

      {/* Next arrow */}
      {hasNext && (
        <button
          onClick={e => { e.stopPropagation(); setIndex(i => i + 1); }}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors z-10"
          aria-label="Next photo"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      )}
    </div>,
    document.body,
  );
}

function MediaItem({ p, controls = false, className = "", contain = false }: { p: PostData["photos"][number]; controls?: boolean; className?: string; contain?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (isVideoItem(p)) {
    return (
      <div className={cn("relative w-full h-full bg-black", className)}>
        <video
          src={p.url}
          controls={controls}
          playsInline
          preload="metadata"
          className="w-full h-full object-contain"
        />
        {!controls && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/50 rounded-full p-2">
              <PlayCircle className="h-8 w-8 text-white" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Shared error fallback — shown when the image URL fails to load
  const errorFallback = (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gray-100">
      <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 18h16.5M21 12V6.75A2.25 2.25 0 0 0 18.75 4.5H5.25A2.25 2.25 0 0 0 3 6.75V12" />
      </svg>
      <span className="text-[11px] text-gray-400">Image unavailable</span>
    </div>
  );

  if (contain) {
    return (
      <div className={cn("w-full bg-black/5 flex justify-center items-start relative", (!loaded || errored) && "min-h-[180px]", className)}>
        {!loaded && !errored && <div className="absolute inset-0 bg-gray-100 animate-pulse" />}
        {errored ? errorFallback : (
          <img
            src={p.url}
            alt={p.caption || ""}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            className={cn(
              "block max-w-full w-auto h-auto max-h-[420px] transition-opacity duration-300",
              loaded ? "opacity-100" : "opacity-0"
            )}
          />
        )}
      </div>
    );
  }

  // Cover mode: fills the container (used in grid thumbnails — parent must be positioned)
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {!loaded && !errored && <div className="absolute inset-0 bg-gray-100 animate-pulse" />}
      {errored ? errorFallback : (
        <img
          src={p.url}
          alt={p.caption || ""}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
}

function MediaGrid({ photos }: { photos: PostData["photos"] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const count = photos.length;
  if (count === 0) return null;

  const openAt = (i: number) => { if (!isVideoItem(photos[i])) setLightboxIndex(i); };

  if (count === 1) {
    const p = photos[0];
    if (isVideoItem(p)) {
      return (
        <div className="w-full overflow-hidden bg-black aspect-video">
          <MediaItem p={p} controls className="w-full h-full" />
        </div>
      );
    }
    return (
      <>
        {lightboxIndex !== null && (
          <PhotoLightbox photos={photos} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
        )}
        <div
          className="cursor-zoom-in group relative"
          onClick={() => openAt(0)}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === "Enter") openAt(0); }}
          aria-label="View full photo"
        >
          <MediaItem p={p} contain />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full p-1.5 pointer-events-none">
            <ZoomIn className="h-4 w-4 text-white" />
          </div>
        </div>
      </>
    );
  }

  // 2+ photos: show ALL in a 2-column responsive grid.
  // Odd count → first photo spans both columns so the grid closes evenly.
  const isOdd = count % 2 !== 0;
  return (
    <>
      {lightboxIndex !== null && (
        <PhotoLightbox photos={photos} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
      <div className="grid grid-cols-2 gap-[2px]">
        {photos.map((p, i) => {
          const spanFull = isOdd && i === 0;
          const isVideo = isVideoItem(p);
          return (
            <div
              key={p.id}
              className={cn(
                "relative overflow-hidden bg-black/5 group",
                spanFull && "col-span-2",
                !isVideo && "cursor-zoom-in",
              )}
              style={{ aspectRatio: spanFull ? "16/9" : "4/3" }}
              onClick={() => !isVideo && openAt(i)}
              role={isVideo ? undefined : "button"}
              tabIndex={isVideo ? undefined : 0}
              onKeyDown={e => { if (e.key === "Enter" && !isVideo) openAt(i); }}
              aria-label={isVideo ? undefined : "View full photo"}
            >
              <MediaItem p={p} controls={false} />
              {!isVideo && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full p-1.5 pointer-events-none">
                  <ZoomIn className="h-3.5 w-3.5 text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, { credentials: "include", ...options });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

function EditForm({
  post,
  onSave,
  onCancel,
}: {
  post: PostData;
  onSave: (updated: PostData) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(post.description ?? "");
  const [location, setLocation] = useState(post.location ?? "");
  const [isHighlight, setIsHighlight] = useState(post.isHighlight ?? false);
  const [isMissionMoment, setIsMissionMoment] = useState(post.isMissionMoment ?? false);
  const [saving, setSaving] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [showLocation, setShowLocation] = useState(!!post.location);

  function detectLocation() {
    if (!navigator.geolocation) return;
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "";
            const country = data.address?.country || "";
            setLocation(city && country ? `${city}, ${country}` : data.display_name?.split(",").slice(0, 2).join(", ") || "");
          }
        } catch {
          setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        } finally {
          setDetectingLocation(false);
        }
      },
      () => setDetectingLocation(false),
      { timeout: 8000 }
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await apiFetch(`/api/reports/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: text.trim() || null,
          location: showLocation ? location.trim() || null : null,
          isHighlight,
          isMissionMoment,
        }),
      });
      if (updated) onSave(updated as PostData);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4 py-3 space-y-3">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={4}
        disabled={saving}
        className="w-full resize-none text-[14.5px] leading-relaxed outline-none border border-border/60 rounded-lg px-3 py-2 bg-muted/20 focus:bg-white focus:border-primary/40 transition-colors disabled:opacity-50"
        placeholder="What's happening?"
      />

      {/* Location */}
      {showLocation ? (
        <div className="flex items-center gap-2 bg-muted/40 rounded-full px-3 py-1.5">
          <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Location…"
            className="flex-1 text-[13px] bg-transparent outline-none"
            disabled={saving}
          />
          <button
            onClick={detectLocation}
            disabled={detectingLocation || saving}
            title="Auto-detect"
            className="text-primary hover:text-primary/70 transition-colors disabled:opacity-40"
          >
            {detectingLocation ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
          </button>
          <button onClick={() => { setShowLocation(false); setLocation(""); }}>
            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowLocation(true)}
          className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-primary transition-colors"
        >
          <MapPin className="h-3.5 w-3.5" /> Add location
        </button>
      )}

      {/* Highlight toggle */}
      <button
        onClick={() => setIsHighlight(h => !h)}
        disabled={saving}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors",
          isHighlight
            ? "text-gray-700 bg-gray-100 hover:bg-gray-200"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )}
      >
        <Star className={cn("h-3.5 w-3.5", isHighlight && "fill-amber-500 text-gray-500")} />
        {isHighlight ? "Highlighted" : "Mark as highlight"}
      </button>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/30">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving} className="h-8 text-[13px]">
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving}
          className="h-8 px-4 text-[13px] bg-[#0F172A] hover:bg-[#1E293B] text-white"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Check className="h-3.5 w-3.5 mr-1" />Save</>}
        </Button>
      </div>
    </div>
  );
}

export function PostCard({
  post: initialPost,
  onDelete,
  defaultShowComments = false,
  hideViewPost = false,
  flat = false,
}: {
  post: PostData;
  onDelete?: (id: number) => void;
  defaultShowComments?: boolean;
  hideViewPost?: boolean;
  flat?: boolean;
}) {
  const { user } = useAuth();
  const { orgSlug, prefix } = useOrg();
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const COMMENT_PREVIEW = 5;
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showSlideExport, setShowSlideExport] = useState(false);
  const [hovered, setHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = user?.id === post.author.id;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const canManage = isOwner || isAdmin;

  const COLLAPSE_THRESHOLD = 300;
  const isLongPost = (post.description?.length ?? 0) > COLLAPSE_THRESHOLD;
  const [textCollapsed, setTextCollapsed] = useState(isLongPost);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  async function toggleLike() {
    if (!user) return;
    const prev = { liked: post.likedByMe, count: post.likeCount };
    setPost(p => ({ ...p, likedByMe: !p.likedByMe, likeCount: p.likedByMe ? p.likeCount - 1 : p.likeCount + 1 }));
    try {
      const data = await apiFetch(`/api/reports/${post.id}/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "like" }),
      });
      if (data) setPost(p => ({ ...p, likedByMe: data.liked, likeCount: data.likeCount }));
    } catch {
      setPost(p => ({ ...p, likedByMe: prev.liked, likeCount: prev.count }));
    }
  }

  async function toggleLove() {
    if (!user) return;
    const prev = { loved: post.lovedByMe, count: post.loveCount };
    setPost(p => ({ ...p, lovedByMe: !p.lovedByMe, loveCount: p.lovedByMe ? p.loveCount - 1 : p.loveCount + 1 }));
    try {
      const data = await apiFetch(`/api/reports/${post.id}/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "love" }),
      });
      if (data) setPost(p => ({ ...p, lovedByMe: data.loved, loveCount: data.loveCount }));
    } catch {
      setPost(p => ({ ...p, lovedByMe: prev.loved, loveCount: prev.count }));
    }
  }

  // Auto-load comments on mount if post has any, or when opened in modal
  useEffect(() => {
    if (post.commentCount > 0 || defaultShowComments) {
      loadComments().then(() => {
        if (defaultShowComments) {
          setTimeout(() => commentInputRef.current?.focus({ preventScroll: true }), 80);
        }
      });
    }
  }, []);

  async function loadComments() {
    if (loadingComments) return;
    setLoadingComments(true);
    try {
      const data = await apiFetch(`/api/reports/${post.id}/comments`);
      setComments(data ?? []);
    } finally {
      setLoadingComments(false);
    }
  }

  async function toggleComments() {
    if (!showComments && comments.length === 0) await loadComments();
    setShowComments(s => !s);
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const data = await apiFetch(`/api/reports/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText.trim() }),
      });
      if (data) {
        setComments(c => [...c, data]);
        setPost(p => ({ ...p, commentCount: p.commentCount + 1 }));
        setCommentText("");
      }
    } finally {
      setSubmittingComment(false);
    }
  }

  async function deleteComment(id: number) {
    setDeletingCommentId(id);
    try {
      await apiFetch(`/api/comments/${id}`, { method: "DELETE" });
      setComments(prev => prev.filter(c => c.id !== id));
      setPost(p => ({ ...p, commentCount: Math.max(0, p.commentCount - 1) }));
    } finally {
      setDeletingCommentId(null);
    }
  }

  function startEditComment(c: Comment) {
    setEditingCommentId(c.id);
    setEditingText(c.text);
  }

  async function saveEditComment(id: number) {
    const trimmed = editingText.trim();
    if (!trimmed) return;
    const updated = await apiFetch(`/api/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed }),
    });
    if (updated) {
      setComments(prev => prev.map(c => c.id === id ? { ...c, text: trimmed } : c));
    }
    setEditingCommentId(null);
    setEditingText("");
  }

  async function deletePost() {
    if (!confirm("Delete this post?")) return;
    await apiFetch(`/api/reports/${post.id}`, { method: "DELETE" });
    onDelete?.(post.id);
  }

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  function copyShareLink() {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const url = `${window.location.origin}${base}${prefix(`/post/${post.id}`)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="transition-colors duration-150"
      style={{
        background: hovered ? "rgba(15,20,25,0.02)" : "#ffffff",
        borderBottom: "1px solid #dfe3e8",
        borderLeft: post.isHighlight ? "3px solid #F59E0B" : "none",
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 px-4 sm:px-5 pt-3 pb-2">
        <Avatar className="h-9 w-9 flex-shrink-0 mt-0.5" style={{ border: "1px solid #E5E7EB" }}>
          <AvatarImage src={post.author.avatarUrl ?? undefined} />
          <AvatarFallback style={{ background: "#2B92FD", color: "#fff", fontWeight: 700, fontSize: 12 }}>
            {post.author.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="leading-snug" style={{ fontSize: 15, fontWeight: 700, color: "#0F1419" }}>
              {post.author.name}
            </span>
            <span style={{ fontSize: 13, color: "#536471" }}>·</span>
            <span style={{ fontSize: 13, color: "#536471", fontWeight: 400 }}>{timeAgo}</span>
            {post.location && (
              <span className="flex items-center gap-1" style={{ fontSize: 13, color: "#536471" }}>
                <span>·</span>
                <MapPin className="h-3 w-3 flex-shrink-0" />
                {post.location}
              </span>
            )}
          </div>
        </div>
        {editing && (
          <button
            onClick={() => setEditing(false)}
            className="p-1 rounded-full hover:bg-muted/60 transition-colors text-muted-foreground flex-shrink-0"
            title="Cancel edit"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Inline edit form */}
      {editing ? (
        <EditForm
          post={post}
          onSave={updated => { setPost(updated); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          {/* Text */}
          {post.description && (
            <div className="px-4 sm:px-5 pb-2.5">
              <p style={{
                fontSize: 15,
                color: "#0F1419",
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
                overflow: textCollapsed ? "hidden" : undefined,
                display: textCollapsed ? "-webkit-box" : undefined,
                WebkitLineClamp: textCollapsed ? 5 : undefined,
                WebkitBoxOrient: textCollapsed ? "vertical" : undefined,
              } as React.CSSProperties}>
                {post.description}
              </p>
              {isLongPost && (
                <button
                  onClick={() => setTextCollapsed(c => !c)}
                  className="mt-1 text-[14px] font-semibold transition-colors"
                  style={{ color: "#0085FF" }}
                >
                  {textCollapsed ? "Show more" : "Show less"}
                </button>
              )}
            </div>
          )}

          {/* Media — no horizontal padding for a clean full-bleed look */}
          {post.photos.length > 0 && (
            <div className="pb-1">
              <MediaGrid photos={post.photos} />
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-1 sm:py-2" style={{ borderTop: "1px solid #E5E7EB" }}>
            <div className="flex items-center gap-0 sm:gap-1">
              {/* Love */}
              <button
                onClick={toggleLove}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 sm:px-2 min-h-[44px] sm:min-h-0 py-2 sm:py-1.5 rounded-full text-[13px] font-medium transition-all duration-150",
                  post.lovedByMe ? "text-[#E0245E]" : "text-[#536471] hover:text-[#E0245E] hover:bg-[#FFF0F4]"
                )}
              >
                <Heart className={cn("h-[18px] w-[18px]", post.lovedByMe ? "fill-[#E0245E] text-[#E0245E]" : "")} />
                {post.loveCount > 0 && <span>{post.loveCount}</span>}
              </button>

              {/* Like */}
              <button
                onClick={toggleLike}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 sm:px-2 min-h-[44px] sm:min-h-0 py-2 sm:py-1.5 rounded-full text-[13px] font-medium transition-all duration-150",
                  post.likedByMe ? "text-[#0085FF]" : "text-[#536471] hover:text-[#0085FF] hover:bg-[#E8F4FF]"
                )}
              >
                <ThumbsUp className={cn("h-[18px] w-[18px]", post.likedByMe ? "fill-[#0085FF] text-[#0085FF]" : "")} />
                {post.likeCount > 0 && <span>{post.likeCount}</span>}
              </button>

              {/* Comment */}
              <button
                onClick={toggleComments}
                className="flex items-center gap-1.5 px-2.5 sm:px-2 min-h-[44px] sm:min-h-0 py-2 sm:py-1.5 rounded-full text-[13px] font-medium text-[#536471] hover:text-[#0085FF] hover:bg-[#E8F4FF] transition-all duration-150"
              >
                <MessageCircle className="h-[18px] w-[18px]" />
                {post.commentCount > 0 && <span>{post.commentCount}</span>}
              </button>
            </div>

            {/* MoreHorizontal menu — far right */}
            {canManage && !editing && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(s => !s)}
                  className="p-1.5 rounded-lg hover:bg-[#E8F4FF] transition-colors text-[#0085FF]"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-white border border-border shadow-md rounded-lg z-50 min-w-[140px] py-1">
                    {isOwner && (
                      <button
                        onClick={() => { setShowMenu(false); setEditing(true); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-foreground hover:bg-muted/60 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => { setShowMenu(false); copyShareLink(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      {copied ? "Copied!" : "Copy link"}
                    </button>
                    {canManage && (
                      <button
                        onClick={() => { setShowMenu(false); setShowSlideExport(true); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-foreground hover:bg-muted/60 transition-colors"
                      >
                        <ImageDown className="h-3.5 w-3.5" />
                        Export
                      </button>
                    )}
                    <button
                      onClick={() => { setShowMenu(false); deletePost(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comments */}
          {(comments.length > 0 || loadingComments || !!user) && (
            <div className="px-4 sm:px-5 pb-3 pt-1 space-y-2.5" style={{ borderTop: "1px solid #E5E7EB" }}>
              {loadingComments ? (
                <p className="text-[13px] pt-2" style={{ color: "#536471" }}>Loading…</p>
              ) : comments.length > 0 ? (
                <div className="space-y-2 pt-2">
                  {(showAllComments ? comments : comments.slice(0, COMMENT_PREVIEW)).map(c => {
                    const isOwn = user?.id === c.author.id;
                    const isDeleting = deletingCommentId === c.id;
                    const isEditing = editingCommentId === c.id;
                    return (
                      <div key={c.id} className="flex gap-2.5 group">
                        <Avatar className="h-8 w-8 flex-shrink-0 mt-0.5" style={{ border: "1px solid #E5E7EB" }}>
                          <AvatarImage src={c.author.avatarUrl ?? undefined} />
                          <AvatarFallback style={{ background: "#2B92FD", color: "#fff", fontWeight: 700, fontSize: 11 }}>
                            {c.author.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#0F1419" }}>{c.author.name}</span>
                            <span style={{ fontSize: 13, color: "#536471" }}>·</span>
                            <span style={{ fontSize: 13, color: "#536471" }}>
                              {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                            </span>
                            {isOwn && !isEditing && (
                              <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEditComment(c)}
                                  className="p-1 rounded transition-colors hover:bg-gray-100"
                                  title="Edit comment"
                                >
                                  <Pencil className="h-3 w-3" style={{ color: "#6B7280" }} />
                                </button>
                                <button
                                  onClick={() => deleteComment(c.id)}
                                  disabled={isDeleting}
                                  className="p-1 rounded transition-colors hover:bg-red-50 disabled:opacity-40"
                                  title="Delete comment"
                                >
                                  {isDeleting
                                    ? <Loader2 className="h-3 w-3 animate-spin" style={{ color: "#EF4444" }} />
                                    : <Trash2 className="h-3 w-3" style={{ color: "#EF4444" }} />}
                                </button>
                              </div>
                            )}
                          </div>
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 mt-1">
                              <input
                                autoFocus
                                value={editingText}
                                onChange={e => setEditingText(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEditComment(c.id); }
                                  if (e.key === "Escape") { setEditingCommentId(null); setEditingText(""); }
                                }}
                                maxLength={500}
                                className="flex-1 rounded-full px-3 py-1 outline-none text-[14px]"
                                style={{ background: "#F7F9F9", border: "1px solid #E5E7EB", color: "#0F1419" }}
                              />
                              <button
                                onClick={() => saveEditComment(c.id)}
                                disabled={!editingText.trim()}
                                className="p-1.5 rounded-full transition-colors hover:bg-blue-50 disabled:opacity-30"
                                title="Save"
                              >
                                <Check className="h-3.5 w-3.5" style={{ color: "#0085FF" }} />
                              </button>
                              <button
                                onClick={() => { setEditingCommentId(null); setEditingText(""); }}
                                className="p-1.5 rounded-full transition-colors hover:bg-gray-100"
                                title="Cancel"
                              >
                                <X className="h-3.5 w-3.5" style={{ color: "#6B7280" }} />
                              </button>
                            </div>
                          ) : (
                            <p style={{ fontSize: 14, color: "#0F1419", lineHeight: 1.45, marginTop: 1 }}>{c.text}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {comments.length > COMMENT_PREVIEW && (
                    <button
                      onClick={() => setShowAllComments(s => !s)}
                      style={{ fontSize: 13, fontWeight: 600, color: "#0085FF", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      {showAllComments
                        ? "Show less"
                        : `Show ${comments.length - COMMENT_PREVIEW} more comment${comments.length - COMMENT_PREVIEW === 1 ? "" : "s"}`}
                    </button>
                  )}
                </div>
              ) : null}

              {user && (
                <form onSubmit={submitComment} className="flex gap-2.5 items-center pt-1">
                  <Avatar className="h-8 w-8 flex-shrink-0" style={{ border: "1px solid #E5E7EB" }}>
                    <AvatarImage src={user.avatarUrl ?? undefined} />
                    <AvatarFallback style={{ background: "#2B92FD", color: "#fff", fontWeight: 700, fontSize: 11 }}>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex items-center gap-2 rounded-full px-3.5 py-2" style={{ background: "#F7F9F9", border: "1px solid #E5E7EB" }}>
                    <input
                      ref={commentInputRef}
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Write a comment…"
                      className="flex-1 bg-transparent outline-none"
                      style={{ fontSize: 14, color: "#0F1419" }}
                      maxLength={500}
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim() || submittingComment}
                      className="transition-opacity disabled:opacity-30"
                      style={{ color: "#0085FF" }}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </>
      )}
    </div>

    {showSlideExport && (
      <SlideExportModal
        post={post}
        orgName={user?.organization ?? undefined}
        orgLogoUrl={undefined}
        onClose={() => setShowSlideExport(false)}
      />
    )}
  </>
  );
}
