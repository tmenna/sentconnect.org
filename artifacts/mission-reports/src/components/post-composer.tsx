import { useState, useRef } from "react";
import { Image, MapPin, X, Loader2, Users, Navigation, Star, Video, PlayCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";
import type { PostData } from "./post-card";

async function requestUploadUrl(file: File): Promise<{ uploadURL: string; objectPath: string }> {
  const res = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
  });
  if (!res.ok) throw new Error("Failed to get upload URL");
  return res.json();
}

async function uploadFileToGcs(file: File, uploadURL: string) {
  const res = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error("Upload failed");
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
      const uploadedPaths: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading ${i + 1}/${files.length}…`);
        const { uploadURL, objectPath } = await requestUploadUrl(files[i].file);
        await uploadFileToGcs(files[i].file, uploadURL);
        uploadedPaths.push(objectPath);
      }

      setUploadProgress("Saving…");
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

      for (let i = 0; i < uploadedPaths.length; i++) {
        await fetch(`/api/reports/${newPost.id}/photos`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: `/api/storage${uploadedPaths[i]}`,
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
        border: isMissionMoment ? "1px solid #A7F3D0" : "1px solid #E9E9E9",
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
            placeholder="What's happening?"
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
            <div className="mt-2 flex items-center gap-2 bg-emerald-50 rounded-full px-3 py-1.5 border border-emerald-100">
              <Users className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <input
                type="number"
                min="0"
                value={peopleReached}
                onChange={e => setPeopleReached(e.target.value)}
                placeholder="People reached…"
                className="flex-1 text-[13px] bg-transparent outline-none text-emerald-800 placeholder:text-emerald-400"
                disabled={posting}
                autoFocus
              />
              <button onClick={() => { setShowImpact(false); setPeopleReached(""); }}>
                <X className="h-3.5 w-3.5 text-emerald-400 hover:text-emerald-700 transition-colors" />
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center gap-0.5 mt-3 pt-3" style={{ borderTop: "1px solid #F1F5F9" }}>
            {/* Photo */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={posting || files.length >= 6}
              className="p-2 rounded-full transition-colors disabled:opacity-40"
              style={{ color: "#6B7280" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#111827"; e.currentTarget.style.background = "#F3F4F6"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#6B7280"; e.currentTarget.style.background = ""; }}
              title="Add photo"
            >
              <Image className="h-4 w-4" />
            </button>
            <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => addFiles(e.target.files)} />

            {/* Video */}
            <button
              onClick={() => videoInputRef.current?.click()}
              disabled={posting || files.length >= 6}
              className="p-2 rounded-full transition-colors disabled:opacity-40"
              style={{ color: files.some(f => isVideo(f)) ? "#111827" : "#6B7280", background: files.some(f => isVideo(f)) ? "#F3F4F6" : "" }}
              onMouseEnter={e => { if (!files.some(f => isVideo(f))) { e.currentTarget.style.color = "#111827"; e.currentTarget.style.background = "#F3F4F6"; } }}
              onMouseLeave={e => { if (!files.some(f => isVideo(f))) { e.currentTarget.style.color = "#6B7280"; e.currentTarget.style.background = ""; } }}
              title="Add short video"
            >
              <Video className="h-4 w-4" />
            </button>
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={e => addFiles(e.target.files)} />

            {/* Location */}
            <button
              onClick={() => setShowLocation(s => !s)}
              disabled={posting}
              className="p-2 rounded-full transition-colors"
              style={{ color: showLocation ? "#111827" : "#6B7280", background: showLocation ? "#F3F4F6" : "" }}
              onMouseEnter={e => { if (!showLocation) { e.currentTarget.style.color = "#111827"; e.currentTarget.style.background = "#F3F4F6"; } }}
              onMouseLeave={e => { if (!showLocation) { e.currentTarget.style.color = "#6B7280"; e.currentTarget.style.background = ""; } }}
              title="Add location"
            >
              <MapPin className="h-4 w-4" />
            </button>

            {/* Impact */}
            <button
              onClick={() => setShowImpact(s => !s)}
              disabled={posting}
              className="p-2 rounded-full transition-colors"
              style={{ color: showImpact ? "#10B981" : "#6B7280", background: showImpact ? "#ECFDF5" : "" }}
              onMouseEnter={e => { if (!showImpact) { e.currentTarget.style.color = "#111827"; e.currentTarget.style.background = "#F3F4F6"; } }}
              onMouseLeave={e => { if (!showImpact) { e.currentTarget.style.color = "#6B7280"; e.currentTarget.style.background = ""; } }}
              title="Add impact"
            >
              <Users className="h-4 w-4" />
            </button>

            {/* Mission Moment — soft blue pill */}
            <button
              onClick={() => setIsMissionMoment(s => !s)}
              disabled={posting}
              title="A Mission Moment is a 3–5 minute story, video, or update that highlights God's work and connects people to the broader mission."
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200"
              style={{
                background: isMissionMoment ? "#ECFDF5" : "transparent",
                color: isMissionMoment ? "#059669" : "#6B7280",
                border: isMissionMoment ? "1px solid #A7F3D0" : "1px solid transparent",
              }}
            >
              <Star className={cn("h-3.5 w-3.5", isMissionMoment ? "fill-emerald-500 text-emerald-500" : "")} />
              <span className="hidden sm:inline">Mission Moments</span>
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
              style={{ background: "#006BD5", height: "36px", boxShadow: canPost ? "0 2px 8px rgba(0,107,213,0.25)" : "none" }}
              onMouseEnter={e => { if (canPost) e.currentTarget.style.background = "#004FA8"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#006BD5"; }}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
