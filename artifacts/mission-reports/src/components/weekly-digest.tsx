import React, { useMemo, useState } from "react";
import { ChevronDown, MapPin, BookOpen } from "lucide-react";
import type { PostData } from "@/components/post-card";

/**
 * Weekly Digest — groups posts into calendar weeks (Mon–Sun) and, within each
 * week, one accordion entry per author. Weeks with no posts are simply
 * omitted, and each post appears in exactly one week (no repeats).
 */

type DigestGroup = {
  key: string;
  authorName: string;
  avatarUrl?: string | null;
  weekLabel: string; // "Aug 10 – Aug 16"
  weekStart: number;
  posts: PostData[];
};

function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay(); // 0 = Sunday
  const diff = (day + 6) % 7; // days since Monday
  copy.setDate(copy.getDate() - diff);
  return copy;
}

function fmt(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildGroups(posts: PostData[]): DigestGroup[] {
  const map = new Map<string, DigestGroup>();
  for (const post of posts) {
    const created = new Date(post.createdAt);
    if (isNaN(created.getTime())) continue;
    const weekStart = startOfWeek(created);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const key = `${weekStart.getTime()}::${post.author.id}`;
    let group = map.get(key);
    if (!group) {
      group = {
        key,
        authorName: post.author.name,
        avatarUrl: post.author.avatarUrl,
        weekLabel: `${fmt(weekStart)} – ${fmt(weekEnd)}`,
        weekStart: weekStart.getTime(),
        posts: [],
      };
      map.set(key, group);
    }
    group.posts.push(post);
  }
  const groups = [...map.values()];
  groups.sort((a, b) => b.weekStart - a.weekStart || a.authorName.localeCompare(b.authorName));
  for (const g of groups) {
    g.posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return groups;
}

function Avatar({ name, url }: { name: string; url?: string | null }) {
  return url ? (
    <img src={url} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
  ) : (
    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
      style={{ background: "#EEF4FF", color: "#1085FD" }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function WeeklyDigest({ posts }: { posts: PostData[] }) {
  const groups = useMemo(() => buildGroups(posts), [posts]);
  const [open, setOpen] = useState<string | null>(groups[0]?.key ?? null);

  if (groups.length === 0) {
    return (
      <div className="bg-white rounded-2xl py-16 sm:py-20 text-center" style={{ border: "1.5px dashed #CBD5E1" }}>
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#F3F4F6" }}>
          <BookOpen className="h-6 w-6 text-slate-400" />
        </div>
        <p className="font-semibold text-base" style={{ color: "#2B2B2B" }}>No weekly summaries yet</p>
        <p className="text-sm mt-1.5 text-slate-500">Once updates are posted, they'll be summarized here week by week.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map(group => {
        const expanded = open === group.key;
        return (
          <div key={group.key} className="bg-white rounded-2xl overflow-hidden"
            style={{ border: expanded ? "1.5px solid #BFDBFE" : "1px solid #E5E9F2" }}>
            <button
              onClick={() => setOpen(expanded ? null : group.key)}
              className="w-full flex items-center gap-3 text-left"
              style={{ padding: "14px 18px", border: "none", background: expanded ? "#F8FAFF" : "#fff", cursor: "pointer" }}
            >
              <Avatar name={group.authorName} url={group.avatarUrl} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: "#0F172A", margin: 0 }}>{group.authorName}</p>
                <p className="text-xs" style={{ color: "#94A3B8", margin: "2px 0 0" }}>{group.weekLabel}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: "#EFF6FF", color: "#1085FD" }}>
                {group.posts.length} update{group.posts.length !== 1 ? "s" : ""}
              </span>
              <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                style={{ color: "#94A3B8", transform: expanded ? "rotate(180deg)" : "none" }} />
            </button>

            {expanded && (
              <div style={{ borderTop: "1px solid #EEF2F7" }}>
                {group.posts.map(post => {
                  const dateStr = new Date(post.createdAt).toLocaleDateString("en-US", {
                    weekday: "short", month: "short", day: "numeric",
                  });
                  const media = post.photos.filter(p => !(p.mimeType ?? "").startsWith("video/"));
                  return (
                    <div key={post.id} className="px-4 sm:px-5 py-4" style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold" style={{ color: "#1085FD" }}>{dateStr}</span>
                        {post.location && (
                          <span className="inline-flex items-center gap-1 text-xs" style={{ color: "#94A3B8" }}>
                            <MapPin className="w-3 h-3" /> {post.location}
                          </span>
                        )}
                      </div>
                      {post.description && (
                        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#475569", margin: 0 }}>
                          {post.description}
                        </p>
                      )}
                      {media.length > 0 && (
                        <div className={`mt-3 grid gap-2 ${media.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                          {media.slice(0, 4).map(p => (
                            <img key={p.id} src={p.url} alt={p.caption ?? ""}
                              className="w-full rounded-xl object-cover"
                              style={{ maxHeight: media.length === 1 ? 320 : 180 }} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
