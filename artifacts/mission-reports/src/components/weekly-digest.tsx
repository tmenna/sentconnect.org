import React, { useMemo, useState } from "react";
import { BookOpen, Link2, Check } from "lucide-react";
import { PostCard, type PostData } from "@/components/post-card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useOrg } from "@/providers/org-provider";

/**
 * Weekly Digest — groups posts into calendar weeks (Mon–Sun) and, within each
 * week, one accordion entry per author. Weeks with no posts are simply
 * omitted, and each post appears in exactly one week (no repeats).
 */

type DigestGroup = {
  key: string;
  authorId: number | string;
  authorName: string;
  avatarUrl?: string | null;
  weekLabel: string; // "Aug 10 – Aug 16"
  weekStart: number;
  posts: PostData[];
};

const ACCORDION_COLORS = [
  { accent: "#F54900", ink: "#C33A00", soft: "#FFF1EB" },
  { accent: "#F0D030", ink: "#735F00", soft: "#FFFBE5" },
  { accent: "#155DFC", ink: "#155DFC", soft: "#EFF6FF" },
  { accent: "#EC3A42", ink: "#C9272F", soft: "#FFF0F2" },
];

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
        authorId: post.author.id,
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

export function weekStartISO(weekStartMs: number): string {
  const d = new Date(weekStartMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function WeeklyDigest({ posts }: { posts: PostData[] }) {
  const groups = useMemo(() => buildGroups(posts), [posts]);
  const [open, setOpen] = useState<string | null>(groups[0]?.key ?? null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { prefix } = useOrg();

  function copyShareLink(group: DigestGroup) {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const url = `${window.location.origin}${base}${prefix(`/digest/${group.authorId}/${weekStartISO(group.weekStart)}`)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedKey(group.key);
      setTimeout(() => setCopiedKey(k => (k === group.key ? null : k)), 2000);
    });
  }

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
    <Accordion
      type="single"
      collapsible
      value={open ?? ""}
      onValueChange={value => setOpen(value || null)}
      className="flex flex-col gap-3"
    >
      {groups.map((group, index) => {
        const expanded = open === group.key;
        const color = ACCORDION_COLORS[index % ACCORDION_COLORS.length];
        return (
          <AccordionItem
            key={group.key}
            value={group.key}
            className="bg-white rounded-2xl overflow-hidden transition-colors duration-200"
            style={{ border: `1.5px solid ${expanded ? color.accent : "#E5E9F2"}` }}
          >
            <div
              className="flex items-center gap-1 sm:gap-2 [&>h3]:flex-1 [&>h3]:min-w-0"
              style={{
                padding: "0 8px 0 0",
                background: expanded ? color.soft : "#FFFFFF",
                borderLeft: `5px solid ${color.accent}`,
              }}
            >
              <AccordionTrigger
                className="min-w-0 gap-2 py-0 pr-1 text-left hover:no-underline [&>svg]:min-h-11 [&>svg]:min-w-5 [&>svg]:!text-current"
                style={{ minHeight: 72, paddingLeft: 13, color: color.ink }}
              >
                <div className="flex flex-1 min-w-0 items-center gap-3">
                  <Avatar name={group.authorName} url={group.avatarUrl} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "#0F172A", margin: 0 }}>{group.authorName}</p>
                    <p className="text-xs" style={{ color: "#64748B", margin: "2px 0 0" }}>{group.weekLabel}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: color.soft, color: color.ink, border: `1px solid ${color.accent}` }}>
                    {group.posts.length} update{group.posts.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </AccordionTrigger>
              <button
                type="button"
                title="Copy share link"
                aria-label="Copy share link"
                onClick={() => copyShareLink(group)}
                className="flex min-h-11 items-center gap-1 flex-shrink-0 px-2 py-1.5 rounded-full transition-colors"
                style={{ border: "none", background: "transparent", cursor: "pointer", color: copiedKey === group.key ? "#16A34A" : color.ink }}
              >
                {copiedKey === group.key ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                <span className="text-xs font-semibold hidden sm:inline">{copiedKey === group.key ? "Copied!" : "Share"}</span>
              </button>
            </div>

            <AccordionContent className="p-0" style={{ borderTop: `1px solid ${color.accent}` }}>
              <div>
                {group.posts.map(post => (
                  <PostCard key={post.id} post={post} hideViewPost flat />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
