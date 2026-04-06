import { useState, useRef } from "react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, MapPin, MoreHorizontal, Trash2, Globe, Lock, Send, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

export type PostData = {
  id: number;
  description?: string | null;
  location?: string | null;
  visibility: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  peopleReached?: number | null;
  author: {
    id: number;
    name: string;
    avatarUrl?: string | null;
    role?: string;
  };
  photos: { id: number; url: string; caption?: string | null }[];
};

type Comment = {
  id: number;
  text: string;
  createdAt: string;
  author: { id: number; name: string; avatarUrl?: string | null };
};

function MediaGrid({ photos }: { photos: PostData["photos"] }) {
  const count = photos.length;
  if (count === 0) return null;
  const isVideo = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url);

  if (count === 1) {
    const p = photos[0];
    return (
      <div className="w-full aspect-[16/10] overflow-hidden bg-black/5 rounded-lg">
        {isVideo(p.url) ? (
          <video src={p.url} controls className="w-full h-full object-cover" />
        ) : (
          <img src={p.url} alt={p.caption || ""} className="w-full h-full object-cover" />
        )}
      </div>
    );
  }
  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
        {photos.map(p => (
          <div key={p.id} className="aspect-square bg-black/5">
            {isVideo(p.url) ? (
              <video src={p.url} className="w-full h-full object-cover" />
            ) : (
              <img src={p.url} alt={p.caption || ""} className="w-full h-full object-cover" />
            )}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
      <div className="aspect-square bg-black/5 row-span-2 col-span-1">
        {isVideo(photos[0].url) ? (
          <video src={photos[0].url} className="w-full h-full object-cover" />
        ) : (
          <img src={photos[0].url} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      {photos.slice(1, 3).map((p, i) => (
        <div key={p.id} className={cn("bg-black/5", i === 0 ? "aspect-square" : "aspect-square relative")}>
          {isVideo(p.url) ? (
            <video src={p.url} className="w-full h-full object-cover" />
          ) : (
            <img src={p.url} alt="" className="w-full h-full object-cover" />
          )}
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

export function PostCard({ post: initialPost, onDelete }: { post: PostData; onDelete?: (id: number) => void }) {
  const { user } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = user?.id === post.author.id;
  const isAdmin = user?.role === "admin";

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

  return (
    <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-2">
        <Link href={`/missionaries/${post.author.id}`}>
          <Avatar className="h-10 w-10 cursor-pointer flex-shrink-0">
            <AvatarImage src={post.author.avatarUrl ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {post.author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/missionaries/${post.author.id}`}>
              <span className="font-semibold text-[14px] text-foreground hover:text-primary transition-colors cursor-pointer leading-tight">
                {post.author.name}
              </span>
            </Link>
            {post.visibility === "private" ? (
              <Lock className="h-3 w-3 text-muted-foreground" />
            ) : (
              <Globe className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground mt-0.5">
            <span>{timeAgo}</span>
            {post.location && (
              <>
                <span>·</span>
                <MapPin className="h-3 w-3" />
                <span>{post.location}</span>
              </>
            )}
          </div>
        </div>
        {(isOwner || isAdmin) && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(s => !s)}
              className="p-1 rounded-full hover:bg-muted/60 transition-colors text-muted-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-7 bg-white border border-border shadow-md rounded-lg z-10 min-w-[120px] py-1">
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

      {/* Text */}
      {post.description && (
        <div className="px-4 pb-3">
          <p className="text-[14.5px] text-foreground leading-relaxed whitespace-pre-wrap">{post.description}</p>
        </div>
      )}

      {/* People Reached */}
      {post.peopleReached != null && post.peopleReached > 0 && (
        <div className="px-4 pb-3">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
            <Users className="h-3.5 w-3.5" />
            {post.peopleReached.toLocaleString()} people reached
          </span>
        </div>
      )}

      {/* Media */}
      {post.photos.length > 0 && (
        <div className="px-4 pb-3">
          <MediaGrid photos={post.photos} />
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-1 px-3 pb-2 pt-1 border-t border-border/40">
        <button
          onClick={toggleLike}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all",
            post.likedByMe
              ? "text-red-500 bg-red-50 hover:bg-red-100"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          )}
        >
          <Heart className={cn("h-4 w-4", post.likedByMe && "fill-red-500")} />
          {post.likeCount > 0 && <span>{post.likeCount}</span>}
        </button>
        <button
          onClick={toggleComments}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all"
        >
          <MessageCircle className="h-4 w-4" />
          {post.commentCount > 0 && <span>{post.commentCount}</span>}
        </button>
        <div className="flex-1" />
        <Link href={`/reports/${post.id}`}>
          <span className="text-[12px] text-muted-foreground hover:text-primary transition-colors cursor-pointer">
            View post
          </span>
        </Link>
      </div>

      {/* Comments section */}
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
    </div>
  );
}
