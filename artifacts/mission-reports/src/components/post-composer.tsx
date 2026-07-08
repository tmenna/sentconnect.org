import { useState, useRef } from "react";
import { Image, MapPin, X, Loader2, Navigation, Video, PlayCircle, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";
import type { PostData } from "./post-card";

// ── Video constraints (aligned with Bluesky / common social platforms) ──
const VIDEO_MAX_BYTES = 50 * 1024 * 1024;   // 50 MB
const VIDEO_MAX_SECONDS = 60;                 // 60 s
const ACCEPTED_VIDEO_TYPES = "video/mp4,video/quicktime,video/webm,video/x-m4v";

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const vid = document.createElement("video");
    vid.preload = "metadata";
    vid.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(vid.duration); };
    vid.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read video")); };
    vid.src = url;
  });
}

interface UploadResult {
  objectKey: string;
  objectPath: string;
}

/**
 * Upload a file directly to Cloudflare R2 using a presigned PUT URL.
 *
 * Flow:
 *   1. POST /api/storage/upload-url  → get a 5-minute presigned PUT URL
 *   2. PUT {uploadUrl}               → file goes straight to R2 (browser → R2)
 *
 * Bytes never touch our API server. CORS is already enabled on the R2 bucket
 * for sentconnect.org and *.sentconnect.org.
 */
async function uploadFileDirect(
  file: File,
  orgId?: number | null,
  postId?: number | null
): Promise<UploadResult> {
  // Step 1 — get a presigned PUT URL from our API
  const urlRes = await fetch("/api/storage/upload-url", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
      orgId: orgId ?? undefined,
      postId: postId ?? undefined,
    }),
  });
  if (!urlRes.ok) {
    const err = await urlRes.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to get upload URL");
  }
  const { uploadUrl, objectKey, objectPath } = await urlRes.json();

  // Step 2 — PUT the file directly to R2 (no auth headers — it's presigned)
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!putRes.ok) throw new Error("Upload to R2 failed");

  return { objectKey, objectPath };
}

type LocalFile = { file: File; previewUrl: string };

export function PostComposer({ onPost }: { onPost: (post: PostData) => void }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [location, setLocation] = useState("");
  const [isMissionMoment, setIsMissionMoment] = useState(false);
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [showLocation, setShowLocation] = useState(false);
  const [posting, setPosting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  async function addFiles(picked: FileList | null) {
    if (!picked) return;
    setMediaError(null);
    const incoming = Array.from(picked).slice(0, 6 - files.length);
    const accepted: LocalFile[] = [];

    for (const f of incoming) {
      const isVid = f.type.startsWith("video/");

      if (isVid) {
        // ── Size check (instant) ──────────────────────────────────────────
        if (f.size > VIDEO_MAX_BYTES) {
          setMediaError(`"${f.name}" is too large. Videos must be under 50 MB.`);
          continue;
        }
        // ── Duration check (async — reads metadata from the local file) ───
        try {
          const dur = await getVideoDuration(f);
          if (dur > VIDEO_MAX_SECONDS) {
            setMediaError(`"${f.name}" is ${Math.round(dur)}s. Videos must be 60 seconds or shorter.`);
            continue;
          }
        } catch {
          setMediaError(`Could not read "${f.name}". Make sure it's a valid MP4, MOV, WebM, or M4V file.`);
          continue;
        }
      }

      accepted.push({ file: f, previewUrl: URL.createObjectURL(f) });
    }

    if (accepted.length > 0) setFiles(prev => [...prev, ...accepted]);
  }

  function removeFile(index: number) {
    setFiles(prev => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  }

  function detectLocation() {
    if (!navigator.geolocation) return;
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&zoom=14&addressdetails=1&lat=${latitude}&lon=${longitude}`,
            { headers: { Accept: "application/json" } }
          );
          if (res.ok) {
            const data = await res.json();
            const a = data.address ?? {};
            const city =
              a.city || a.town || a.village || a.municipality || a.suburb || a.county || "";
            const region = a.state || a.province || a.region || "";
            const country = a.country || "";
            const parts = [city, region, country].filter(Boolean);
            // Avoid duplicates like "New York, New York, United States"
            const deduped = parts.filter((p, i) => parts.indexOf(p) === i);
            setLocation(
              deduped.length > 0
                ? deduped.join(", ")
                : data.display_name?.split(",").slice(0, 3).map((s: string) => s.trim()).join(", ") || ""
            );
          } else {
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch {
          // fallback: just show coords
          setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        } finally {
          setDetectingLocation(false);
        }
      },
      () => setDetectingLocation(false),
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
    );
  }

  async function handlePost() {
    if (posting) return;
    if (!text.trim() && files.length === 0) return;
    setPosting(true);
    try {
      // Step 1 — Create the post first so we have a postId for the object key
      setUploadProgress("Saving post…");
      const postRes = await fetch("/api/reports", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: text.trim() || null,
          location: location.trim() || null,
          isMissionMoment,
        }),
      });
      if (!postRes.ok) throw new Error("Failed to create post");
      const newPost = await postRes.json();

      // Step 2 — Upload each file directly to R2 (browser → R2, presigned PUT)
      // Key: organizations/{orgId}/posts/{postId}/{uuid}.ext
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading ${i + 1}/${files.length}…`);
        const { objectPath } = await uploadFileDirect(
          files[i].file,
          user.organizationId ?? null,
          newPost.id
        );

        // Step 3 — Register the uploaded file against the post
        await fetch(`/api/reports/${newPost.id}/photos`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: `/api/storage${objectPath}`,
            mimeType: files[i].file.type,
          }),
        });
      }

      const fullRes = await fetch(`/api/reports/${newPost.id}`, { credentials: "include" });
      const fullPost = await fullRes.json();
      onPost(fullPost);

      setText("");
      setLocation("");
      setIsMissionMoment(false);
      setShowLocation(false);
      files.forEach(f => URL.revokeObjectURL(f.previewUrl));
      setFiles([]);
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
      setUploadProgress("");
    }
  }

  const canPost = (text.trim().length > 0 || files.length > 0) && !posting;
  const isVideo = (f: LocalFile) => f.file.type.startsWith("video/");

  return (
    <div
      className={cn("bg-white rounded-2xl overflow-hidden")}
      style={{
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        background: "#ffffff",
        padding: "16px 16px 14px",
      }}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="flex gap-3.5">
        <Avatar className="h-11 w-11 flex-shrink-0" style={{ border: "1.5px solid #F3F4F6" }}>
          <AvatarImage src={user.avatarUrl ?? undefined} />
          <AvatarFallback style={{ background: "#2B92FD", color: "#fff", fontWeight: 700, fontSize: 15 }}>
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Share an update with your church or field team…"
            disabled={posting}
            rows={text.length > 80 ? 4 : 2}
            className="w-full resize-none bg-transparent text-[16px] outline-none leading-relaxed disabled:opacity-50 placeholder:text-[#9CA3AF]"
            onPaste={e => {
              const items = e.clipboardData.items;
              const imageItems = Array.from(items).filter(i => i.kind === "file");
              if (imageItems.length > 0) {
                const dt = new DataTransfer();
                imageItems.forEach(i => { const f = i.getAsFile(); if (f) dt.items.add(f); });
                addFiles(dt.files);
              }
            }}
          />

          {/* Media previews */}
          {files.length > 0 && (
            <div className={cn("mt-2 gap-1 rounded-lg overflow-hidden", files.length === 1 ? "block" : "grid grid-cols-2")}>
              {files.map((f, i) => (
                <div
                  key={i}
                  className={cn(
                    "relative group bg-black overflow-hidden",
                    files.length === 1
                      ? isVideo(f) ? "aspect-video" : "aspect-[16/10]"
                      : "aspect-square"
                  )}
                >
                  {isVideo(f) ? (
                    <>
                      <video src={f.previewUrl} playsInline preload="metadata" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/50 rounded-full p-2">
                          <PlayCircle className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img src={f.previewUrl} alt="" className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Location input */}
          {showLocation && (
            <div className="mt-2 flex items-center gap-2 bg-muted/40 rounded-full px-3 py-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Add location…"
                className="flex-1 text-[13px] bg-transparent outline-none"
                disabled={posting}
                autoFocus
              />
              <button
                onClick={detectLocation}
                disabled={detectingLocation || posting}
                title="Auto-detect location"
                className="text-primary hover:text-primary/70 transition-colors disabled:opacity-40"
              >
                {detectingLocation ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
              </button>
              <button onClick={() => { setShowLocation(false); setLocation(""); }}>
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            </div>
          )}

          {/* Media error */}
          {mediaError && (
            <div className="mt-2 flex items-start gap-2 rounded-lg px-3 py-2" style={{ background: "#FFF1F2", border: "1px solid #FECDD3" }}>
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: "#E11D48" }} />
              <p className="text-[12px] leading-relaxed" style={{ color: "#9F1239" }}>{mediaError}</p>
              <button onClick={() => setMediaError(null)} className="ml-auto flex-shrink-0">
                <X className="h-3 w-3" style={{ color: "#E11D48" }} />
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center gap-0.5 sm:gap-1 mt-3 pt-3 flex-wrap" style={{ borderTop: "1px solid #F1F5F9" }}>
            {/* Photo */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={posting || files.length >= 6}
              className="flex items-center gap-1.5 px-3 py-2.5 sm:py-1.5 sm:px-3 rounded-full text-[13px] font-medium transition-all duration-150 disabled:opacity-40 min-h-[40px] sm:min-h-0"
              style={{ color: "#0085FF" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#E8F4FF"; }}
              onMouseLeave={e => { e.currentTarget.style.background = ""; }}
              title="Add photo"
            >
              <Image className="h-[18px] w-[18px] sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Photo</span>
            </button>
            <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => addFiles(e.target.files)} />

            {/* Video */}
            <button
              onClick={() => videoInputRef.current?.click()}
              disabled={posting || files.length >= 6}
              className="flex items-center gap-1.5 px-3 py-2.5 sm:py-1.5 sm:px-3 rounded-full text-[13px] font-medium transition-all duration-150 disabled:opacity-40 min-h-[40px] sm:min-h-0"
              style={{ color: "#0085FF", background: files.some(f => isVideo(f)) ? "#E8F4FF" : "" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#E8F4FF"; }}
              onMouseLeave={e => { if (!files.some(f => isVideo(f))) e.currentTarget.style.background = ""; }}
              title="Add video — MP4, MOV, WebM, M4V · max 50 MB · max 60 s"
            >
              <Video className="h-[18px] w-[18px] sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Video</span>
            </button>
            <input ref={videoInputRef} type="file" accept={ACCEPTED_VIDEO_TYPES} className="hidden" onChange={e => addFiles(e.target.files)} />

            {/* Location */}
            <button
              onClick={() => setShowLocation(s => !s)}
              disabled={posting}
              className="flex items-center gap-1.5 px-3 py-2.5 sm:py-1.5 sm:px-3 rounded-full text-[13px] font-medium transition-all duration-150 min-h-[40px] sm:min-h-0"
              style={{ color: "#0085FF", background: showLocation ? "#E8F4FF" : "" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#E8F4FF"; }}
              onMouseLeave={e => { if (!showLocation) e.currentTarget.style.background = ""; }}
              title="Add location"
            >
              <MapPin className="h-[18px] w-[18px] sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Location</span>
            </button>

            <div className="flex-1" />

            {posting && uploadProgress && (
              <span className="text-[12px] flex items-center gap-1.5" style={{ color: "#9CA3AF" }}>
                <Loader2 className="h-3 w-3 animate-spin" />
                {uploadProgress}
              </span>
            )}

            <button
              onClick={handlePost}
              disabled={!canPost}
              className="px-4 sm:px-5 font-semibold text-[14px] text-white rounded-xl transition-all duration-200 disabled:opacity-40 whitespace-nowrap min-h-[40px] sm:min-h-[36px]"
              style={{ background: "#1085FD", letterSpacing: "-0.01em" }}
              onMouseEnter={e => { if (canPost) e.currentTarget.style.background = "#0059D6"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#1085FD"; }}
            >
              <span className="hidden sm:inline">Post Update</span>
              <span className="sm:hidden">Post</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
