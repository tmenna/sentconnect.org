import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { MapPin, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Photo = { id: number; url: string; mimeType?: string; caption?: string | null };
type Post = {
  id: number;
  description?: string | null;
  location?: string | null;
  createdAt: string;
  photos: Photo[];
  author: { id: number; name: string; avatarUrl?: string | null; organization?: string | null };
};

function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  return copy;
}

function isoLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fmt(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function PublicDigest() {
  const params = useParams<{ userId: string; week: string }>();
  const userId = Number(params.userId);
  const week = params.week ?? "";

  const [posts, setPosts] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!userId || !/^\d{4}-\d{2}-\d{2}$/.test(week)) { setNotFound(true); setLoading(false); return; }
    fetch(`/api/reports/digest/${userId}/public?week=${week}`)
      .then(r => { if (!r.ok) { setNotFound(true); return null; } return r.json(); })
      .then(data => { if (data) setPosts(data.reports as Post[]); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [userId, week]);

  // Keep only posts that fall in the shared Mon–Sun week (viewer-local dates).
  const weekPosts = (posts ?? []).filter(p => isoLocal(startOfWeek(new Date(p.createdAt))) === week);
  const author = weekPosts[0]?.author ?? posts?.[0]?.author;
  const weekStart = /^\d{4}-\d{2}-\d{2}$/.test(week) ? new Date(`${week}T00:00:00`) : null;
  const weekEnd = weekStart ? new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000) : null;
  const empty = !loading && !notFound && weekPosts.length === 0;

  return (
    <div className="min-h-screen px-4 py-10 sm:py-14" style={{ background: "#F3F4F6", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="mx-auto w-full" style={{ maxWidth: 720 }}>

        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-7 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-2.5 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        )}

        {(notFound || empty) && !loading && (
          <div className="bg-white rounded-2xl py-16 text-center" style={{ border: "1.5px dashed #CBD5E1" }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#F3F4F6" }}>
              <BookOpen className="h-6 w-6 text-slate-400" />
            </div>
            <p className="font-semibold text-base" style={{ color: "#2B2B2B" }}>
              {notFound ? "This weekly digest link isn't valid." : "No updates were shared this week."}
            </p>
          </div>
        )}

        {!loading && !notFound && weekPosts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: "1px solid #E5E9F2" }}>
            {/* Header */}
            <div className="px-6 sm:px-7 py-6" style={{ background: "linear-gradient(115deg, #003B94 0%, #0059D6 45%, #1085FD 100%)" }}>
              <div className="flex items-center gap-3">
                {author?.avatarUrl ? (
                  <img src={author.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" style={{ border: "2px solid rgba(255,255,255,0.6)" }} />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold"
                    style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)" }}>
                    {(author?.name ?? "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white font-bold text-lg truncate" style={{ margin: 0 }}>{author?.name}</p>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.85)", margin: "2px 0 0" }}>
                    Weekly Digest · {weekStart && weekEnd ? `${fmt(weekStart)} – ${fmt(weekEnd)}` : week}
                  </p>
                </div>
                <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.16)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
                  {weekPosts.length} update{weekPosts.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Posts */}
            {weekPosts.map(post => {
              const dateStr = new Date(post.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
              const media = post.photos ?? [];
              return (
                <div key={post.id} className="px-6 sm:px-7 py-5" style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold" style={{ color: "#1085FD" }}>{dateStr}</span>
                    {post.location && (
                      <span className="inline-flex items-center gap-1 text-xs" style={{ color: "#94A3B8" }}>
                        <MapPin className="w-3 h-3" /> {post.location}
                      </span>
                    )}
                  </div>
                  {post.description && (
                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#475569", margin: 0 }}>{post.description}</p>
                  )}
                  {media.length > 0 && (
                    <div className={`mt-3 grid gap-2 ${media.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                      {media.map(p => {
                        const isVideo = (p.mimeType ?? "").startsWith("video/") || /\.(mp4|webm|mov)$/i.test(p.url);
                        return isVideo ? (
                          <video key={p.id} src={p.url} controls className="w-full rounded-xl bg-black" style={{ maxHeight: 320 }} />
                        ) : (
                          <img key={p.id} src={p.url} alt={p.caption ?? ""} loading="lazy"
                            className="w-full rounded-xl object-cover"
                            style={{ maxHeight: media.length === 1 ? 360 : 200 }} />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="px-6 py-4 text-center">
              <p className="text-xs" style={{ color: "#94A3B8", margin: 0 }}>
                Shared via SentConnect{author?.organization ? ` · ${author.organization}` : ""}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
