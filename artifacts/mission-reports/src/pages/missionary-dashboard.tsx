import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  useGetUserReports, getGetUserReportsQueryKey,
  useCreateReport, useAddReportPhoto
} from "@workspace/api-client-react";
import { Link, Redirect, useLocation } from "wouter";
import { MapPin, Building, Plus, Image, Video, X, ChevronRight, BookOpen, Send, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TEXT_LIMIT = 280;

function MyPostCard({ report, index }: { report: any; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [, navigate] = useLocation();
  const firstPhoto = report.photos?.[0];
  const isLong = report.description?.length > TEXT_LIMIT;
  const displayText =
    expanded || !isLong
      ? report.description
      : report.description?.slice(0, TEXT_LIMIT) + "…";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.06 }}
      className="bg-white rounded-xl border border-border shadow-sm overflow-hidden"
    >
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-3">
          <CalendarDays className="h-3 w-3" />
          {format(new Date(report.reportDate), "MMM d, yyyy")}
          {report.location && (
            <>
              <span>·</span>
              <MapPin className="h-3 w-3" />
              {report.location}
            </>
          )}
        </div>

        <h3
          className="font-semibold text-foreground text-[15px] leading-snug mb-2 cursor-pointer hover:text-primary transition-colors"
          onClick={() => navigate(`/reports/${report.id}`)}
        >
          {report.title}
        </h3>

        {report.description && (
          <div className="text-sm text-foreground/85 leading-relaxed">
            <p>{displayText}</p>
            {isLong && (
              <button
                className="text-primary text-[12.5px] font-medium mt-1 hover:underline"
                onClick={() => setExpanded(e => !e)}
              >
                {expanded ? "Show less" : "See more"}
              </button>
            )}
          </div>
        )}
      </div>

      {firstPhoto?.url && (
        <div
          className="cursor-pointer border-t border-border"
          onClick={() => navigate(`/reports/${report.id}`)}
        >
          {/\.(mp4|webm|ogg|mov)$/i.test(firstPhoto.url) ? (
            <video
              src={firstPhoto.url}
              controls
              className="w-full max-h-[340px] bg-black"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <img
              src={firstPhoto.url}
              alt={firstPhoto.caption || report.title}
              className="w-full object-cover max-h-[340px]"
              loading="lazy"
            />
          )}
          {firstPhoto.caption && (
            <p className="px-5 py-2 text-[11px] text-muted-foreground italic border-t border-border bg-muted/30">
              {firstPhoto.caption}
            </p>
          )}
        </div>
      )}

      <div className="px-5 py-3 border-t border-border">
        <Link href={`/reports/${report.id}`}>
          <span className="text-[12.5px] font-medium text-primary hover:underline inline-flex items-center gap-1">
            Read full report <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>
    </motion.div>
  );
}

function PostComposer({ user, onPosted }: { user: any; onPosted: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<{ url: string; caption: string }[]>([]);
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("");
  const [pendingCaption, setPendingCaption] = useState("");
  const [error, setError] = useState("");

  const createReport = useCreateReport();
  const addPhoto = useAddReportPhoto();

  const canSubmit = title.trim().length > 0 && description.trim().length > 0;
  const isPending = createReport.isPending;

  function addMedia() {
    if (!pendingUrl.trim()) return;
    setMedia(m => [...m, { url: pendingUrl.trim(), caption: pendingCaption.trim() }]);
    setPendingUrl("");
    setPendingCaption("");
    setShowMediaInput(false);
  }

  async function handlePost() {
    if (!canSubmit) return;
    setError("");
    try {
      const report = await createReport.mutateAsync({
        body: {
          title: title.trim(),
          description: description.trim(),
          category: "other",
          reportDate: new Date().toISOString().split("T")[0],
          location: user.location ?? null,
        }
      });
      for (const m of media) {
        await addPhoto.mutateAsync({ params: { id: report.id }, body: { url: m.url, caption: m.caption || null } });
      }
      setTitle("");
      setDescription("");
      setMedia([]);
      setShowMediaInput(false);
      setExpanded(false);
      onPosted();
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      {!expanded ? (
        <button
          className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
          onClick={() => setExpanded(true)}
        >
          <Avatar className="h-9 w-9 border border-border flex-shrink-0">
            <AvatarImage src={user.avatarUrl || undefined} />
            <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground flex-1">
            Share a field update, {user.name.split(" ")[0]}…
          </span>
          <Send className="h-4 w-4 text-muted-foreground/40" />
        </button>
      ) : (
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <Avatar className="h-9 w-9 border border-border flex-shrink-0">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground">{user.name}</p>
              {user.location && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                  <MapPin className="h-2.5 w-2.5" />{user.location}
                </p>
              )}
            </div>
          </div>

          <input
            type="text"
            placeholder="Report title…"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 border-b border-border bg-transparent pb-2 outline-none focus:border-primary transition-colors"
          />

          <textarea
            placeholder="What's happening in your field? Share an update, story, or prayer request…"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="w-full text-sm text-foreground placeholder:text-muted-foreground/60 resize-none bg-transparent outline-none leading-relaxed"
          />

          {media.length > 0 && (
            <div className="space-y-1.5">
              {media.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-xs bg-muted/50 rounded-lg px-3 py-2">
                  <Image className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 truncate text-muted-foreground">{m.url}</span>
                  {m.caption && <span className="text-muted-foreground/60 truncate max-w-[120px]">"{m.caption}"</span>}
                  <button onClick={() => setMedia(prev => prev.filter((_, j) => j !== i))}>
                    <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <AnimatePresence>
            {showMediaInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-border rounded-xl p-3 space-y-2 bg-muted/20"
              >
                <input
                  type="text"
                  placeholder="Paste photo or video URL…"
                  value={pendingUrl}
                  onChange={e => setPendingUrl(e.target.value)}
                  className="w-full text-xs bg-white border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors"
                />
                <input
                  type="text"
                  placeholder="Caption (optional)"
                  value={pendingCaption}
                  onChange={e => setPendingCaption(e.target.value)}
                  className="w-full text-xs bg-white border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowMediaInput(false)}
                    className="text-xs text-muted-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addMedia}
                    disabled={!pendingUrl.trim()}
                    className="text-xs font-medium bg-primary text-white px-3 py-1.5 rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity"
                  >
                    Attach
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex items-center justify-between pt-1 border-t border-border">
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setShowMediaInput(true); setPendingUrl(""); setPendingCaption(""); }}
                className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg hover:bg-muted/60 transition-colors"
              >
                <Image className="h-3.5 w-3.5" /> Photo
              </button>
              <button
                onClick={() => { setShowMediaInput(true); setPendingUrl(""); setPendingCaption(""); }}
                className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg hover:bg-muted/60 transition-colors"
              >
                <Video className="h-3.5 w-3.5" /> Video
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setExpanded(false); setTitle(""); setDescription(""); setMedia([]); setShowMediaInput(false); }}
                className="text-xs text-muted-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={!canSubmit || isPending}
                className="text-xs font-semibold bg-primary text-white px-4 py-1.5 rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <Send className="h-3 w-3" />
                {isPending ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MissionaryDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: reports, refetch } = useGetUserReports(user?.id ?? 0, {
    query: { enabled: !!user?.id, queryKey: getGetUserReportsQueryKey(user?.id ?? 0) }
  });

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Redirect href="/login" />;
  if (user.role !== "missionary") return <Redirect href="/admin" />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  function handlePosted() {
    queryClient.invalidateQueries({ queryKey: getGetUserReportsQueryKey(user!.id) });
    refetch();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Identity bar */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-xl border border-border p-5 flex items-start gap-4 shadow-sm"
      >
        <Avatar className="h-11 w-11 border border-border flex-shrink-0">
          <AvatarImage src={user.avatarUrl || undefined} />
          <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{greeting}</p>
          <h1 className="text-lg font-semibold text-foreground mt-0.5 tracking-tight">{user.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            {user.location ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Serving in <strong className="text-foreground font-medium ml-0.5">{user.location}</strong>
              </span>
            ) : (
              <Link href="/profile">
                <span className="inline-flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer">
                  <Plus className="h-3 w-3" /> Add field location
                </span>
              </Link>
            )}
            {user.organization ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building className="h-3.5 w-3.5 text-primary" />
                Sent from <strong className="text-foreground font-medium ml-0.5">{user.organization}</strong>
              </span>
            ) : (
              <Link href="/profile">
                <span className="inline-flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer">
                  <Plus className="h-3 w-3" /> Add sending church
                </span>
              </Link>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 text-right hidden sm:block">
          <p className="text-2xl font-bold text-foreground">{reports?.length ?? 0}</p>
          <p className="text-[11px] text-muted-foreground">Reports</p>
        </div>
      </motion.div>

      {/* Post composer */}
      <PostComposer user={user} onPosted={handlePosted} />

      {/* Personal timeline */}
      {!reports || reports.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-border py-16 text-center shadow-sm">
          <BookOpen className="h-9 w-9 mx-auto text-muted-foreground/25 mb-3" />
          <p className="font-semibold text-foreground text-sm">No updates yet</p>
          <p className="text-muted-foreground text-xs mt-1">Use the box above to share your first field update.</p>
        </div>
      ) : (
        reports.map((report, index) => (
          <MyPostCard key={report.id} report={report} index={index} />
        ))
      )}
    </div>
  );
}
