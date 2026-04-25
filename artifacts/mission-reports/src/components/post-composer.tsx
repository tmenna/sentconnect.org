import { useState, useRef } from "react";
import { Image, MapPin, X, Loader2, Users, Navigation, Star, Video, PlayCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";
import type { PostData } from "./post-card";

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
  const [peopleReached, setPeopleReached] = useState("");
  const [isMissionMoment, setIsMissionMoment] = useState(false);
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [showLocation, setShowLocation] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const [posting, setPosting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  function addFiles(picked: FileList | null) {
    if (!picked) return;
    const newFiles: LocalFile[] = Array.from(picked).slice(0, 6 - files.length).map(f => ({
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));
    setFiles(prev => [...prev, ...newFiles]);
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
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "";
            const country = data.address?.country || "";
            setLocation(city && country ? `${city}, ${country}` : data.display_name?.split(",").slice(0, 2).join(", ") || "");
          }
        } catch {
          // fallback: just show coords
          setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        } finally {
          setDetectingLocation(false);
        }
      },
      () => setDetectingLocation(false),
      { timeout: 8000 }
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
          peopleReached: peopleReached.trim() ? Number(peopleReached) : null,
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
      setPeopleReached("");
      setIsMissionMoment(false);
      setShowLocation(false);
      setShowImpact(false);
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
      className={cn("bg-white rounded-2xl p-5 transition-all duration-200")}
      style={{
        border: isMissionMoment ? "1px solid #A7F3D0" : "1px solid #BFDBFE",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        background: isMissionMoment ? "#F0FDF9" : "#FFFFFF",
      }}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={user.avatarUrl ?? undefined} />
          <AvatarFallback className="font-semibold text-[14px]" style={{ background: "#E5E7EB", color: "#374151" }}>
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

          {/* Impact / people reached */}
          {showImpact && (
            <div className="mt-2 flex items-center gap-2 bg-blue-50 rounded-full px-3 py-1.5 border border-blue-100">
              <Users className="h-3.5 w-3.5 text-[#0268CE] flex-shrink-0" />
              <input
                type="number"
                min="0"
                value={peopleReached}
                onChange={e => setPeopleReached(e.target.value)}
                placeholder="People reached…"
                className="flex-1 text-[13px] bg-transparent outline-none text-[#0268CE] placeholder:text-blue-300"
                disabled={posting}
                autoFocus
              />
              <button onClick={() => { setShowImpact(false); setPeopleReached(""); }}>
                <X className="h-3.5 w-3.5 text-blue-300 hover:text-[#0268CE] transition-colors" />
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center gap-1 mt-3 pt-3 flex-wrap" style={{ borderTop: "1px solid #F1F5F9" }}>
            {/* Photo */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={posting || files.length >= 6}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors disabled:opacity-40"
              style={{ color: "#6B7280" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#111827"; e.currentTarget.style.background = "#F3F4F6"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#6B7280"; e.currentTarget.style.background = ""; }}
              title="Add photo"
            >
              <Image className="h-4 w-4" />
              <span>Photo</span>
            </button>
            <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => addFiles(e.target.files)} />

            {/* Video */}
            <button
              onClick={() => videoInputRef.current?.click()}
              disabled={posting || files.length >= 6}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors disabled:opacity-40"
              style={{ color: files.some(f => isVideo(f)) ? "#111827" : "#6B7280", background: files.some(f => isVideo(f)) ? "#F3F4F6" : "" }}
              onMouseEnter={e => { if (!files.some(f => isVideo(f))) { e.currentTarget.style.color = "#111827"; e.currentTarget.style.background = "#F3F4F6"; } }}
              onMouseLeave={e => { if (!files.some(f => isVideo(f))) { e.currentTarget.style.color = "#6B7280"; e.currentTarget.style.background = ""; } }}
              title="Add short video"
            >
              <Video className="h-4 w-4" />
              <span>Video</span>
            </button>
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={e => addFiles(e.target.files)} />

            {/* Location */}
            <button
              onClick={() => setShowLocation(s => !s)}
              disabled={posting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors"
              style={{ color: showLocation ? "#111827" : "#6B7280", background: showLocation ? "#F3F4F6" : "" }}
              onMouseEnter={e => { if (!showLocation) { e.currentTarget.style.color = "#111827"; e.currentTarget.style.background = "#F3F4F6"; } }}
              onMouseLeave={e => { if (!showLocation) { e.currentTarget.style.color = "#6B7280"; e.currentTarget.style.background = ""; } }}
              title="Add location"
            >
              <MapPin className="h-4 w-4" />
              <span>Location</span>
            </button>

            {/* Mission Moment — labeled pill */}
            <button
              onClick={() => setIsMissionMoment(s => !s)}
              disabled={posting}
              title="A Mission Moment is a 3–5 minute story, video, or update that highlights God's work and connects people to the broader mission."
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200"
              style={{
                background: isMissionMoment ? "#EFF6FF" : "transparent",
                color: isMissionMoment ? "#0268CE" : "#6B7280",
                border: isMissionMoment ? "1px solid #BFDBFE" : "1px solid transparent",
              }}
              onMouseEnter={e => { if (!isMissionMoment) { e.currentTarget.style.color = "#111827"; e.currentTarget.style.background = "#F3F4F6"; } }}
              onMouseLeave={e => { if (!isMissionMoment) { e.currentTarget.style.color = "#6B7280"; e.currentTarget.style.background = ""; } }}
            >
              <Star className={cn("h-4 w-4", isMissionMoment ? "fill-[#0268CE] text-[#0268CE]" : "")} />
              <span>Mission Moment</span>
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
              className="px-5 font-semibold text-[13px] text-white rounded-xl transition-all duration-200 disabled:opacity-40"
              style={{ background: "#0268CE", height: "36px", boxShadow: canPost ? "0 2px 8px rgba(2,104,206,0.25)" : "none" }}
              onMouseEnter={e => { if (canPost) e.currentTarget.style.background = "#0155a5"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#0268CE"; }}
            >
              Post Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
