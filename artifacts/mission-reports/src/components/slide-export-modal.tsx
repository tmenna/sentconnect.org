import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  X, Download, Loader2, Image, Presentation, Smartphone,
  Sun, Moon, ChevronRight
} from "lucide-react";
import type { PostData } from "./post-card";

type Template = "social" | "slide" | "story";
type Theme = "light" | "dark";
type ExportFormat = "png" | "jpg" | "pdf";

interface SlideExportModalProps {
  post: PostData;
  orgName?: string;
  orgLogoUrl?: string;
  onClose: () => void;
}

const TEMPLATES: { id: Template; label: string; icon: React.ReactNode; dims: [number, number] }[] = [
  { id: "social", label: "Social Card",      icon: <Image className="h-4 w-4" />,        dims: [1080, 1080] },
  { id: "slide",  label: "Presentation",     icon: <Presentation className="h-4 w-4" />, dims: [1920, 1080] },
  { id: "story",  label: "Story / Portrait", icon: <Smartphone className="h-4 w-4" />,   dims: [1080, 1920] },
];

const PREVIEW_SCALE = 0.28;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function truncate(text: string, max: number) {
  return text.length <= max ? text : text.slice(0, max).trimEnd() + "…";
}

async function toDataUrl(src: string): Promise<string | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ── Shared brand strip at the bottom ──────────────────────────────────────────
function BrandStrip({ orgName, logoUrl, dark }: { orgName?: string; logoUrl?: string; dark: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 40px",
      height: 64,
      background: dark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.9)",
      borderTop: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,71,168,0.1)",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {logoUrl && <img src={logoUrl} alt="" style={{ height: 26, width: "auto", objectFit: "contain" }} />}
        {orgName && (
          <span style={{ fontSize: 17, fontWeight: 700, color: dark ? "rgba(255,255,255,0.9)" : "#0047A8", letterSpacing: "-0.02em" }}>
            {orgName}
          </span>
        )}
      </div>
      <span style={{ fontSize: 13, color: dark ? "rgba(255,255,255,0.45)" : "#9CA3AF", fontWeight: 500 }}>
        sentconnect.org
      </span>
    </div>
  );
}

// ── TEMPLATE 1: Social Card (1080×1080) ──────────────────────────────────────
function SocialCardTemplate({
  post, orgName, logoUrl, dark, photoUrl,
}: { post: PostData; orgName?: string; logoUrl?: string; dark: boolean; photoUrl: string | null }) {
  const bg = dark ? "#0F172A" : "#F8FBFF";
  const text = dark ? "#F1F5F9" : "#0F172A";
  const sub = dark ? "rgba(241,245,249,0.6)" : "#64748B";
  const accent = "#0268CE";
  const hasPhoto = !!photoUrl;

  return (
    <div style={{ width: 1080, height: 1080, background: bg, display: "flex", flexDirection: "column", fontFamily: "'Inter', 'system-ui', sans-serif", overflow: "hidden", position: "relative" }}>
      {/* Accent bar */}
      <div style={{ height: 6, background: `linear-gradient(90deg, #0047A8, #1A80E0)`, flexShrink: 0 }} />

      {/* Photo area */}
      {hasPhoto ? (
        <div style={{ flex: 1, overflow: "hidden", position: "relative", minHeight: 0 }}>
          <img src={photoUrl!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: dark ? "linear-gradient(to bottom, transparent 30%, rgba(15,23,42,0.92) 100%)" : "linear-gradient(to bottom, transparent 30%, rgba(248,251,255,0.97) 100%)" }} />
          {/* Text overlay on photo */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "40px 48px 32px" }}>
            {post.isMissionMoment && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: accent, color: "#fff", borderRadius: 999, padding: "5px 16px", fontSize: 15, fontWeight: 700, marginBottom: 16, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Mission Moment
              </div>
            )}
            <div style={{ fontSize: 15, color: dark ? "rgba(255,255,255,0.7)" : "rgba(15,23,42,0.7)", marginBottom: 10, fontWeight: 600 }}>
              {post.author.name}
              {post.location && <span style={{ fontWeight: 400 }}> · {post.location}</span>}
            </div>
            <p style={{ fontSize: 32, fontWeight: 800, color: dark ? "#F1F5F9" : "#0F172A", lineHeight: 1.25, letterSpacing: "-0.03em", margin: 0 }}>
              {truncate(post.description ?? "", 160)}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "56px 64px", minHeight: 0 }}>
          {post.isMissionMoment && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: accent, color: "#fff", borderRadius: 999, padding: "5px 16px", fontSize: 15, fontWeight: 700, marginBottom: 24, letterSpacing: "0.04em", textTransform: "uppercase", width: "fit-content" }}>
              Mission Moment
            </div>
          )}
          <p style={{ fontSize: 44, fontWeight: 900, color: text, lineHeight: 1.2, letterSpacing: "-0.04em", margin: "0 0 32px" }}>
            {truncate(post.description ?? "", 280)}
          </p>
          <div style={{ fontSize: 18, color: sub, fontWeight: 600 }}>
            {post.author.name}
            {post.location && ` · ${post.location}`}
          </div>
        </div>
      )}

      {/* Footer meta */}
      <div style={{ padding: "16px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, borderTop: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,71,168,0.08)" }}>
        <span style={{ fontSize: 14, color: sub }}>{formatDate(post.createdAt)}</span>
        {post.peopleReached && <span style={{ fontSize: 14, color: accent, fontWeight: 700 }}>{post.peopleReached.toLocaleString()} people reached</span>}
      </div>

      <BrandStrip orgName={orgName} logoUrl={logoUrl} dark={dark} />
    </div>
  );
}

// ── TEMPLATE 2: Presentation Slide (1920×1080) ────────────────────────────────
function PresentationTemplate({
  post, orgName, logoUrl, dark, photoUrl,
}: { post: PostData; orgName?: string; logoUrl?: string; dark: boolean; photoUrl: string | null }) {
  const bg = dark ? "#0F172A" : "#FFFFFF";
  const text = dark ? "#F1F5F9" : "#0F172A";
  const sub = dark ? "rgba(241,245,249,0.55)" : "#64748B";
  const accent = "#0268CE";
  const panelBg = dark ? "rgba(255,255,255,0.05)" : "#F0F7FF";

  return (
    <div style={{ width: 1920, height: 1080, background: bg, display: "flex", flexDirection: "column", fontFamily: "'Inter', 'system-ui', sans-serif", overflow: "hidden" }}>
      {/* Top accent */}
      <div style={{ height: 8, background: `linear-gradient(90deg, #0047A8, #1A80E0, #0047A8)`, flexShrink: 0 }} />

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* Left: text panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "64px 80px", minWidth: 0 }}>
          {post.isMissionMoment && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: accent, color: "#fff", borderRadius: 999, padding: "6px 20px", fontSize: 16, fontWeight: 700, marginBottom: 32, letterSpacing: "0.06em", textTransform: "uppercase", width: "fit-content" }}>
              Mission Moment
            </div>
          )}
          <p style={{ fontSize: 52, fontWeight: 900, color: text, lineHeight: 1.2, letterSpacing: "-0.04em", margin: "0 0 32px" }}>
            {truncate(post.description ?? "", 320)}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: text }}>{post.author.name}</span>
            {post.location && <span style={{ fontSize: 18, color: sub }}>{post.location}</span>}
            <span style={{ fontSize: 16, color: sub }}>{formatDate(post.createdAt)}</span>
          </div>
          {post.peopleReached && (
            <div style={{ marginTop: 40, display: "inline-flex", alignItems: "center", gap: 12, background: panelBg, borderRadius: 16, padding: "16px 28px", width: "fit-content" }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: accent }}>{post.peopleReached.toLocaleString()}</span>
              <span style={{ fontSize: 16, color: sub, fontWeight: 600 }}>people reached</span>
            </div>
          )}
        </div>

        {/* Right: photo panel */}
        {photoUrl && (
          <div style={{ width: 760, flexShrink: 0, overflow: "hidden", position: "relative" }}>
            <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: dark ? "rgba(15,23,42,0.2)" : "rgba(248,251,255,0.08)" }} />
          </div>
        )}
      </div>

      <BrandStrip orgName={orgName} logoUrl={logoUrl} dark={dark} />
    </div>
  );
}

// ── TEMPLATE 3: Story / Portrait (1080×1920) ──────────────────────────────────
function StoryTemplate({
  post, orgName, logoUrl, dark, photoUrl,
}: { post: PostData; orgName?: string; logoUrl?: string; dark: boolean; photoUrl: string | null }) {
  const bg = dark ? "#0F172A" : "#F8FBFF";
  const text = dark ? "#F1F5F9" : "#0F172A";
  const sub = dark ? "rgba(241,245,249,0.6)" : "#64748B";
  const accent = "#0268CE";

  return (
    <div style={{ width: 1080, height: 1920, background: bg, display: "flex", flexDirection: "column", fontFamily: "'Inter', 'system-ui', sans-serif", overflow: "hidden" }}>
      {/* Top accent */}
      <div style={{ height: 8, background: `linear-gradient(90deg, #0047A8, #1A80E0)`, flexShrink: 0 }} />

      {/* Header brand */}
      <div style={{ padding: "32px 48px 24px", display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
        {logoUrl && <img src={logoUrl} alt="" style={{ height: 36, width: "auto", objectFit: "contain" }} />}
        {orgName && <span style={{ fontSize: 22, fontWeight: 800, color: dark ? "#fff" : "#0047A8", letterSpacing: "-0.02em" }}>{orgName}</span>}
      </div>

      {/* Photo */}
      {photoUrl && (
        <div style={{ height: 840, flexShrink: 0, overflow: "hidden", position: "relative" }}>
          <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 60%, rgba(15,23,42,0.6) 100%)" }} />
        </div>
      )}

      {/* Text body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 64px", minHeight: 0 }}>
        {post.isMissionMoment && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: accent, color: "#fff", borderRadius: 999, padding: "6px 20px", fontSize: 18, fontWeight: 700, marginBottom: 28, letterSpacing: "0.04em", textTransform: "uppercase", width: "fit-content" }}>
            Mission Moment
          </div>
        )}
        <p style={{ fontSize: 46, fontWeight: 900, color: text, lineHeight: 1.25, letterSpacing: "-0.04em", margin: "0 0 32px" }}>
          {truncate(post.description ?? "", 260)}
        </p>
        <div style={{ fontSize: 20, color: sub, fontWeight: 600 }}>
          {post.author.name}
          {post.location && <span style={{ fontWeight: 400 }}> · {post.location}</span>}
        </div>
        <div style={{ fontSize: 18, color: sub, marginTop: 8 }}>{formatDate(post.createdAt)}</div>
        {post.peopleReached && (
          <div style={{ marginTop: 32, fontSize: 22, fontWeight: 700, color: accent }}>
            {post.peopleReached.toLocaleString()} people reached
          </div>
        )}
      </div>

      <BrandStrip orgName={orgName} logoUrl={logoUrl} dark={dark} />
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────────
export function SlideExportModal({ post, orgName, orgLogoUrl, onClose }: SlideExportModalProps) {
  const [template, setTemplate] = useState<Template>("social");
  const [theme, setTheme] = useState<Theme>("light");
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [blobPhotoUrl, setBlobPhotoUrl] = useState<string | null>(null);
  const [blobLogoUrl, setBlobLogoUrl] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);

  const firstPhoto = post.photos.find(p => !p.mimeType?.startsWith("video/") && !/\.(mp4|webm|mov)$/i.test(p.url));

  // Pre-fetch photo as data URL to avoid canvas CORS block
  useEffect(() => {
    if (!firstPhoto?.url) { setBlobPhotoUrl(null); return; }
    setPhotoLoading(true);
    toDataUrl(firstPhoto.url).then(url => {
      setBlobPhotoUrl(url);
      setPhotoLoading(false);
    });
  }, [firstPhoto?.url]);

  // Pre-fetch logo as data URL too
  useEffect(() => {
    if (!orgLogoUrl) { setBlobLogoUrl(null); return; }
    toDataUrl(orgLogoUrl).then(url => setBlobLogoUrl(url ?? orgLogoUrl ?? null));
  }, [orgLogoUrl]);

  const dims = TEMPLATES.find(t => t.id === template)!.dims;
  const [W, H] = dims;
  const scale = PREVIEW_SCALE;

  const templateProps = { post, orgName, dark: theme === "dark", photoUrl: blobPhotoUrl, logoUrl: blobLogoUrl ?? orgLogoUrl };

  const renderSlide = useCallback(() => {
    if (template === "social") return <SocialCardTemplate {...templateProps} />;
    if (template === "slide")  return <PresentationTemplate {...templateProps} />;
    return <StoryTemplate {...templateProps} />;
  }, [template, theme, blobPhotoUrl, blobLogoUrl, post, orgName, orgLogoUrl]);

  async function doExport(format: ExportFormat) {
    if (!slideRef.current) return;
    setExporting(format);
    try {
      const canvas = await html2canvas(slideRef.current, {
        useCORS: true,
        allowTaint: true,
        width: W,
        height: H,
        scale: 1,
        logging: false,
        backgroundColor: null,
      });

      const filename = `sentconnect-post-${post.id}`;

      if (format === "pdf") {
        const dataUrl = canvas.toDataURL("image/png");
        const orientation = W > H ? "landscape" : "portrait";
        const pdf = new jsPDF({ orientation, unit: "px", format: [W, H], compress: true });
        pdf.addImage(dataUrl, "PNG", 0, 0, W, H);
        pdf.save(`${filename}.pdf`);
      } else {
        const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
        const quality = format === "jpg" ? 0.95 : undefined;
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob returned null")), mimeType, quality);
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
    } catch (err) {
      console.error("Export failed", err);
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setExporting(null);
    }
  }

  return (
    <>
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(10,20,40,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 24px 80px rgba(0,0,0,0.35)", display: "flex", flexDirection: "column", width: "100%", maxWidth: 1000, maxHeight: "95vh", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #F1F5F9", flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.02em" }}>Export as Slide</h2>
            <p style={{ fontSize: 12, color: "#94A3B8", margin: "2px 0 0" }}>Choose a template, then download your image</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", display: "flex", padding: 4 }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>

          {/* Preview pane */}
          <div style={{ flex: 1, background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflow: "auto", minWidth: 0 }}>
            {photoLoading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "#94A3B8" }}>
                <Loader2 className="h-8 w-8 animate-spin" />
                <span style={{ fontSize: 13 }}>Loading photo…</span>
              </div>
            ) : (
              <div style={{
                width: W * scale,
                height: H * scale,
                overflow: "hidden",
                borderRadius: 12,
                boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
                flexShrink: 0,
                position: "relative",
              }}>
                {/* Scaled preview wrapper */}
                <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: W, height: H, pointerEvents: "none" }}>
                  {renderSlide()}
                </div>
              </div>
            )}
          </div>

          {/* Controls pane */}
          <div style={{ width: 240, borderLeft: "1px solid #F1F5F9", display: "flex", flexDirection: "column", overflow: "auto", flexShrink: 0 }}>

            {/* Template picker */}
            <div style={{ padding: "20px 16px 12px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94A3B8", marginBottom: 10 }}>Template</p>
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                    borderRadius: 10, border: template === t.id ? "2px solid #0268CE" : "2px solid transparent",
                    background: template === t.id ? "#EFF6FF" : "transparent",
                    cursor: "pointer", marginBottom: 4, color: template === t.id ? "#0268CE" : "#374151",
                    fontSize: 13, fontWeight: 600, transition: "all .12s",
                  }}
                >
                  {t.icon}
                  <span style={{ flex: 1, textAlign: "left" }}>{t.label}</span>
                  {template === t.id && <ChevronRight className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>

            <div style={{ height: 1, background: "#F1F5F9", margin: "0 16px" }} />

            {/* Theme toggle */}
            <div style={{ padding: "16px 16px 12px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94A3B8", marginBottom: 10 }}>Theme</p>
              <div style={{ display: "flex", gap: 8 }}>
                {(["light", "dark"] as Theme[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    style={{
                      flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                      padding: "10px 8px", borderRadius: 10,
                      border: theme === t ? "2px solid #0268CE" : "2px solid #E5E7EB",
                      background: theme === t ? "#EFF6FF" : (t === "dark" ? "#1E293B" : "#FFFFFF"),
                      cursor: "pointer",
                    }}
                  >
                    {t === "light"
                      ? <Sun className="h-4 w-4" style={{ color: theme === "light" ? "#0268CE" : "#94A3B8" }} />
                      : <Moon className="h-4 w-4" style={{ color: theme === "dark" ? "#60A5FA" : "#9CA3AF" }} />}
                    <span style={{ fontSize: 11, fontWeight: 600, color: theme === t ? "#0268CE" : "#6B7280", textTransform: "capitalize" }}>{t}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: "#F1F5F9", margin: "0 16px" }} />

            {/* Slide dimensions info */}
            <div style={{ padding: "12px 16px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94A3B8", marginBottom: 6 }}>Output Size</p>
              <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>{W} × {H} px · High resolution</p>
            </div>

            <div style={{ flex: 1 }} />

            {/* Export buttons */}
            <div style={{ padding: "16px", borderTop: "1px solid #F1F5F9", display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94A3B8", marginBottom: 4 }}>Download</p>
              {(["png", "jpg", "pdf"] as ExportFormat[]).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => doExport(fmt)}
                  disabled={!!exporting || photoLoading}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    height: 40, borderRadius: 10, border: "none", cursor: exporting || photoLoading ? "not-allowed" : "pointer",
                    fontWeight: 700, fontSize: 13, transition: "all .12s",
                    background: fmt === "png" ? "#0047A8" : fmt === "jpg" ? "#0268CE" : "#1A80E0",
                    color: "#fff",
                    opacity: exporting && exporting !== fmt ? 0.5 : 1,
                  }}
                >
                  {exporting === fmt
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Exporting…</>
                    : <><Download className="h-3.5 w-3.5" /> {fmt.toUpperCase()}</>
                  }
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>

    {createPortal(
      <div
        ref={slideRef}
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: -(W + 200),
          width: W,
          height: H,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {renderSlide()}
      </div>,
      document.body
    )}
    </>
  );
}
