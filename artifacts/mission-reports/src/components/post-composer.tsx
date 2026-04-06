import { useState, useRef } from "react";
import { Image, MapPin, X, Loader2, Users, Star, Navigation } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  const [isHighlight, setIsHighlight] = useState(false);
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [showLocation, setShowLocation] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const [posting, setPosting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          isHighlight,
        }),
      });
      if (!postRes.ok) throw new Error("Failed to create post");
      const newPost = await postRes.json();

      for (const objectPath of uploadedPaths) {
        await fetch(`/api/reports/${newPost.id}/photos`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: `/api/storage${objectPath}` }),
        });
      }

      const fullRes = await fetch(`/api/reports/${newPost.id}`, { credentials: "include" });
      const fullPost = await fullRes.json();
      onPost(fullPost);

      setText("");
      setLocation("");
      setPeopleReached("");
      setIsHighlight(false);
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
      className={cn(
        "bg-white rounded-xl border shadow-sm p-4 transition-colors",
        isHighlight ? "border-amber-300 bg-amber-50/30" : "border-border/60"
      )}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={user.avatarUrl ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
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
            className="w-full resize-none bg-transparent text-[15px] placeholder:text-muted-foreground outline-none leading-relaxed disabled:opacity-50"
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
                <div key={i} className={cn("relative group bg-black/5", files.length === 1 ? "aspect-[16/10]" : "aspect-square")}>
                  {isVideo(f) ? (
                    <video src={f.previewUrl} className="w-full h-full object-cover" />
                  ) : (
                    <img src={f.previewUrl} alt="" className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
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
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/40">
            {/* Media */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={posting || files.length >= 6}
              className="p-2 rounded-full text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
              title="Add photo or video"
            >
              <Image className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={e => addFiles(e.target.files)}
            />

            {/* Location */}
            <button
              onClick={() => setShowLocation(s => !s)}
              disabled={posting}
              className={cn(
                "p-2 rounded-full transition-colors",
                showLocation ? "text-primary bg-primary/10" : "text-primary hover:bg-primary/10"
              )}
              title="Add location"
            >
              <MapPin className="h-4 w-4" />
            </button>

            {/* Impact */}
            <button
              onClick={() => setShowImpact(s => !s)}
              disabled={posting}
              className={cn(
                "p-2 rounded-full transition-colors",
                showImpact ? "text-emerald-600 bg-emerald-50" : "text-primary hover:bg-primary/10"
              )}
              title="Add impact"
            >
              <Users className="h-4 w-4" />
            </button>

            {/* Highlight */}
            <button
              onClick={() => setIsHighlight(s => !s)}
              disabled={posting}
              className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded-full text-[12px] font-medium transition-colors",
                isHighlight
                  ? "text-amber-600 bg-amber-100 hover:bg-amber-200"
                  : "text-primary hover:bg-primary/10"
              )}
              title="Mark as highlight"
            >
              <Star className={cn("h-4 w-4", isHighlight && "fill-amber-500")} />
              <span className="hidden sm:inline">{isHighlight ? "Highlight" : "Highlight"}</span>
            </button>

            <div className="flex-1" />

            {posting && uploadProgress && (
              <span className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                {uploadProgress}
              </span>
            )}

            <Button
              size="sm"
              onClick={handlePost}
              disabled={!canPost}
              className="rounded-full px-5 bg-[#132272] hover:bg-[#0e1a5c] text-white font-semibold h-8 text-[13px]"
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
