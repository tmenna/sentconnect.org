import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import {
  ThumbsUp, MessageCircle, MapPin, MoreHorizontal, Trash2, Pencil,
  Send, Star, X, Loader2, Check, Navigation, BookOpen, Sparkles, PlayCircle,
  Link2, Share2, ImageDown
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
  commentCount: number;
  likedByMe: boolean;
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

function MediaItem({ p, controls = false, className = "" }: { p: PostData["photos"][number]; controls?: boolean; className?: string }) {
  const [loaded, setLoaded] = useState(false);

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

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!loaded && <div className="absolute inset-0 bg-gray-100 animate-pulse" />}
      <img
        src={p.url}
        alt={p.caption || ""}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}

function MediaGrid({ photos }: { photos: PostData["photos"] }) {
  const count = photos.length;
  if (count === 0) return null;

  if (count === 1) {
    const p = photos[0];
    return (
      <div className={cn("w-full overflow-hidden bg-black/5", isVideoItem(p) ? "aspect-video" : "aspect-[16/10]")}>
        <MediaItem p={p} controls={isVideoItem(p)} className="w-full h-full" />
      </div>
    );
  }
  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-[2px] overflow-hidden">
        {photos.map(p => (
          <div key={p.id} className="aspect-square bg-black/5 relative overflow-hidden">
            <MediaItem p={p} controls={false} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-[2px] overflow-hidden">
      <div className="aspect-square bg-black/5 row-span-2 relative overflow-hidden">
        <MediaItem p={photos[0]} controls={false} />
      </div>
      {photos.slice(1, 3).map((p, i) => (
        <div key={p.id} className={cn("bg-black/5 aspect-square relative overflow-hidden")}>
          <MediaItem p={p} controls={false} />
          {i === 1 && count > 3 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xl font-bold">+{count - 3}</span>
            </div>
          )}
        </div>
      ))}
    </div>
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
            ? "text-amber-700 bg-amber-100 hover:bg-amber-200"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )}
      >
        <Star className={cn("h-3.5 w-3.5", isHighlight && "fill-amber-500 text-amber-500")} />
        {isHighlight ? "Highlighted" : "Mark as highlight"}
      </button>

      {/* Mission Moment toggle */}
      <button
        onClick={() => setIsMissionMoment(m => !m)}
        disabled={saving}
        title="A 3–5 minute story or update that celebrates and connects people to God's work in the world."
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors",
          isMissionMoment
            ? "text-[#0F172A] bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0]"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )}
      >
        <BookOpen className={cn("h-3.5 w-3.5", isMissionMoment && "text-[#0F172A]")} />
        {isMissionMoment ? "Mission Moments" : "Mark as Mission Moments"}
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
  const [showComments, setShowComments] = useState(defaultShowComments);
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showSlideExport, setShowSlideExport] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = user?.id === post.author.id;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const canManage = isOwner || isAdmin;

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
      const data = await apiFetch(`/api/reports/${post.id}/likes`, { method: "POST" });
      if (data) setPost(p => ({ ...p, likedByMe: data.liked, likeCount: data.likeCount }));
    } catch {
      setPost(p => ({ ...p, likedByMe: prev.liked, likeCount: prev.count }));
    }
  }

  // Auto-load comments when opened in modal (defaultShowComments=true)
  useEffect(() => {
    if (defaultShowComments) {
      loadComments().then(() => {
        // Small delay so the DOM has rendered the input
        setTimeout(() => commentInputRef.current?.focus({ preventScroll: true }), 80);
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
      className={flat
        ? "bg-white overflow-hidden"
        : "bg-white rounded-2xl overflow-hidden transition-shadow duration-200"}
      style={flat
        ? { borderBottom: "1px solid #E2E8F0" }
        : { border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.05)" }}
      onMouseEnter={e => { if (!flat) (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(15,23,42,0.10), 0 12px 32px rgba(15,23,42,0.07)"; }}
      onMouseLeave={e => { if (!flat) (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.05)"; }}
    >
      {/* Mission Moment banner */}
      {post.isMissionMoment && (
        <div className="flex items-center gap-2.5 px-5 py-3" style={{ background: "#ffffff", borderBottom: "1px solid #E2E8F0" }}>
          <BookOpen className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#0F172A" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#0F172A", letterSpacing: "0.09em", textTransform: "uppercase", flexGrow: 1 }}>
            Mission Moment
          </span>
          <Sparkles className="h-3.5 w-3.5" style={{ color: "#94A3B8" }} />
        </div>
      )}

      {/* Highlight banner (only when not mission moment) */}
      {!post.isMissionMoment && post.isHighlight && (
        <div className="flex items-center gap-1.5 px-6 py-2 bg-amber-50 border-b border-amber-100 text-[12px] font-medium text-amber-700">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          Highlight
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3.5 px-4 sm:px-6 pt-5 pb-3">
        <Link href={`/missionaries/${post.author.id}`}>
          <Avatar className="h-12 w-12 cursor-pointer flex-shrink-0" style={{ border: "1.5px solid #E8EEF8" }}>
            <AvatarImage src={post.author.avatarUrl ?? undefined} />
            <AvatarFallback style={{ background: "#F3E8FF", color: "#9A27FF", fontWeight: 700, fontSize: 15 }}>
              {post.author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/missionaries/${post.author.id}`}
            className="transition-colors leading-tight block" style={{ fontSize: 16, fontWeight: 700, color: "#9A27FF", letterSpacing: "-0.02em" }}
          >
            {post.author.name}
          </Link>
          <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-1">
            <span style={{ fontSize: 13, color: "#94A3B8" }}>{timeAgo}</span>
            {post.location && (
              <>
                <span style={{ color: "#CBD5E1", fontSize: 10 }}>•</span>
                <span className="flex items-center gap-1" style={{ fontSize: 13, color: "#94A3B8" }}>
                  <MapPin className="h-3 w-3" />
                  {post.location}
                </span>
              </>
            )}
          </div>
        </div>
        {canManage && !editing && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(s => !s)}
              className="p-1 rounded-full hover:bg-muted/60 transition-colors text-muted-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-7 bg-white border border-border shadow-md rounded-lg z-10 min-w-[130px] py-1">
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
        {editing && (
          <button
            onClick={() => setEditing(false)}
            className="p-1 rounded-full hover:bg-muted/60 transition-colors text-muted-foreground"
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
            <div className="px-4 sm:px-6 pb-5">
              <p style={{ fontSize: 16, color: "#000000", lineHeight: 1.7, letterSpacing: "-0.01em", whiteSpace: "pre-wrap" }}>{post.description}</p>
            </div>
          )}

          {/* Media — no horizontal padding for a clean full-bleed look */}
          {post.photos.length > 0 && (
            <div className="pb-1">
              <MediaGrid photos={post.photos} />
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center mx-1 sm:mx-2" style={{ borderTop: "1px solid #F1F5F9" }}>
            {/* Like */}
            <button
              onClick={toggleLike}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-semibold transition-all duration-150 rounded-xl my-1",
                post.likedByMe
                  ? "text-[#9A27FF] bg-[#F3E8FF]"
                  : "text-[#64748B] hover:bg-[#F3E8FF] hover:text-[#9A27FF]"
              )}
            >
              <ThumbsUp className={cn("h-4 w-4", post.likedByMe && "fill-[#9A27FF] text-[#9A27FF]")} />
              <span className="hidden sm:inline">Like</span>
              {post.likeCount > 0 && <span className="hidden sm:inline">· {post.likeCount}</span>}
              {post.likeCount > 0 && <span className="sm:hidden text-[11px]">{post.likeCount}</span>}
            </button>

            {/* Comment */}
            <button
              onClick={toggleComments}
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-semibold text-[#64748B] hover:bg-[#F3E8FF] hover:text-[#9A27FF] transition-all duration-150 rounded-xl my-1"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Comment</span>
              {post.commentCount > 0 && <span className="hidden sm:inline">· {post.commentCount}</span>}
              {post.commentCount > 0 && <span className="sm:hidden text-[11px]">{post.commentCount}</span>}
            </button>

            {/* Share */}
            <button
              onClick={copyShareLink}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-semibold transition-all duration-150 rounded-xl my-1",
                copied
                  ? "text-[#9A27FF] bg-[#F3E8FF]"
                  : "text-[#64748B] hover:bg-[#F3E8FF] hover:text-[#9A27FF]"
              )}
            >
              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
            </button>

            {/* Export as Report — visible to admins/owners */}
            {canManage && (
              <button
                onClick={() => setShowSlideExport(true)}
                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-semibold text-[#64748B] hover:bg-[#F3E8FF] hover:text-[#9A27FF] transition-all duration-150 rounded-xl my-1"
              >
                <ImageDown className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
          </div>

          {/* Comments */}
          {showComments && (
            <div className="border-t border-border/40 px-4 py-3 bg-muted/20 space-y-3">
              {loadingComments ? (
                <p className="text-[12px] text-muted-foreground">Loading…</p>
              ) : comments.length === 0 ? (
                <p className="text-[12px] text-muted-foreground">No comments yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {comments.map(c => (
                    <div key={c.id} className="flex gap-2.5">
                      <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarImage src={c.author.avatarUrl ?? undefined} />
                        <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                          {c.author.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-white rounded-xl px-3 py-2 border border-border/40">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-[12px] text-foreground">{c.author.name}</span>
                          <span className="text-[11px] text-muted-foreground">
                            {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-[13px] text-foreground mt-0.5">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {user && (
                <form onSubmit={submitComment} className="flex gap-2 items-center">
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarImage src={user.avatarUrl ?? undefined} />
                    <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex items-center gap-2 bg-white border border-border/60 rounded-full px-3 py-1.5">
                    <input
                      ref={commentInputRef}
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Write a comment…"
                      className="flex-1 text-[13px] bg-transparent outline-none placeholder:text-muted-foreground"
                      maxLength={500}
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim() || submittingComment}
                      className="text-primary disabled:opacity-40 transition-opacity"
                    >
                      <Send className="h-3.5 w-3.5" />
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
