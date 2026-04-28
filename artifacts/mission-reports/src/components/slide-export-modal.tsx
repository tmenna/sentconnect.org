import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { X, Download, Loader2, FileText, MapPin, Users, Calendar } from "lucide-react";
import type { PostData } from "./post-card";

interface SlideExportModalProps {
  post: PostData;
  orgName?: string;
  orgLogoUrl?: string;
  onClose: () => void;
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

function imageFormat(dataUrl: string): string {
  if (dataUrl.startsWith("data:image/jpeg") || dataUrl.startsWith("data:image/jpg")) return "JPEG";
  if (dataUrl.startsWith("data:image/webp")) return "WEBP";
  return "PNG";
}

async function getImageDimensions(dataUrl: string): Promise<{ w: number; h: number }> {
  return new Promise(resolve => {
    const img = new globalThis.Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 16, h: 9 });
    img.src = dataUrl;
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function SlideExportModal({ post, orgName, orgLogoUrl, onClose }: SlideExportModalProps) {
  const [exporting, setExporting] = useState(false);
  const [blobPhotoUrls, setBlobPhotoUrls] = useState<(string | null)[]>([]);
  const [blobLogoUrl, setBlobLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const photos = post.photos.filter(
    p => !p.mimeType?.startsWith("video/") && !/\.(mp4|webm|mov)$/i.test(p.url)
  );

  useEffect(() => {
    if (photos.length === 0) { setBlobPhotoUrls([]); return; }
    setLoading(true);
    Promise.all(photos.map(p => toDataUrl(p.url))).then(urls => {
      setBlobPhotoUrls(urls);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetch("/api/landing-page")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const url = data?.logoUrl || data?.headerLogoUrl || orgLogoUrl || null;
        if (url) {
          toDataUrl(url).then(blob => setBlobLogoUrl(blob ?? null));
        }
      })
      .catch(() => {
        if (orgLogoUrl) toDataUrl(orgLogoUrl).then(blob => setBlobLogoUrl(blob ?? null));
      });
  }, [orgLogoUrl]);

  async function generatePDF() {
    setExporting(true);
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210;
      const pageH = 297;
      const margin = 18;
      const contentW = pageW - margin * 2;
      const blue = [0, 71, 168] as [number, number, number];
      const accent = [26, 128, 224] as [number, number, number];
      const dark = [15, 23, 42] as [number, number, number];
      const gray = [100, 116, 139] as [number, number, number];
      const lightBlue = [239, 246, 255] as [number, number, number];
      const white = [255, 255, 255] as [number, number, number];
      const border = [220, 230, 245] as [number, number, number];

      const HEADER_H = 24;

      function drawHeader() {
        pdf.setFillColor(...white);
        pdf.rect(0, 0, pageW, HEADER_H, "F");

        pdf.setFillColor(...accent);
        pdf.rect(0, 0, pageW, 2, "F");

        let textX = margin;

        if (blobLogoUrl) {
          const logoH = 10;
          const logoW = 28;
          try {
            pdf.addImage(blobLogoUrl, imageFormat(blobLogoUrl), margin, 6, logoW, logoH);
          } catch {}
          textX = margin + logoW + 4;
        }

        pdf.setTextColor(...dark);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text(orgName || "Missionary Report", textX, 12);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(...gray);
        pdf.text("Missionary Report", textX, 18);

        pdf.setDrawColor(...border);
        pdf.line(0, HEADER_H, pageW, HEADER_H);
      }

      function drawFooter(pageNum: number, totalPages: number) {
        pdf.setFillColor(248, 251, 255);
        pdf.rect(0, pageH - 10, pageW, 10, "F");
        pdf.setDrawColor(220, 230, 245);
        pdf.line(0, pageH - 10, pageW, pageH - 10);
        pdf.setTextColor(...gray);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.text("sentconnect.org", pageW / 2, pageH - 3.5, { align: "center" });
        pdf.text(`${pageNum} / ${totalPages}`, pageW - margin, pageH - 3.5, { align: "right" });
      }

      drawHeader();

      let y = HEADER_H + 8;

      if (post.isMissionMoment) {
        pdf.setFillColor(...blue);
        pdf.roundedRect(margin, y, 40, 6, 1.5, 1.5, "F");
        pdf.setTextColor(...white);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.text("MISSION MOMENT", margin + 3, y + 4.2);
        y += 11;
      }

      pdf.setTextColor(...dark);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text(post.author.name, margin, y);
      y += 7;

      const metaParts: string[] = [];
      if (post.location) metaParts.push(post.location);
      metaParts.push(formatDate(post.createdAt));
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(...gray);
      pdf.text(metaParts.join("   ·   "), margin, y);
      y += 5;

      if (post.peopleReached) {
        pdf.setFillColor(...lightBlue);
        pdf.roundedRect(margin, y, 58, 7, 1.5, 1.5, "F");
        pdf.setTextColor(...accent);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text(`${post.peopleReached.toLocaleString()}  people reached`, margin + 3.5, y + 4.8);
        y += 11;
      }

      pdf.setDrawColor(220, 230, 245);
      pdf.line(margin, y, pageW - margin, y);
      y += 8;

      pdf.setTextColor(...dark);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setLineHeightFactor(1.55);
      const descLines = pdf.splitTextToSize(post.description ?? "", contentW);
      pdf.text(descLines, margin, y);
      y += descLines.length * 11 * 1.55 * 0.352778 + 8;

      const availPhotos = blobPhotoUrls.filter((u): u is string => !!u);
      let pageCount = 1;
      const totalPhotos = availPhotos.length;

      if (totalPhotos > 0) {
        pdf.setDrawColor(220, 230, 245);
        pdf.line(margin, y, pageW - margin, y);
        y += 6;
        pdf.setTextColor(...gray);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.text("PHOTOS", margin, y);
        y += 6;
      }

      for (let i = 0; i < availPhotos.length; i++) {
        const photoDataUrl = availPhotos[i];
        const dims = await getImageDimensions(photoDataUrl);
        const photoW = contentW;
        const photoH = Math.min(photoW * (dims.h / dims.w), 140);

        const caption = photos[i]?.caption;
        const captionH = caption ? 6 : 0;
        const blockH = photoH + captionH + 6;

        if (y + blockH > pageH - 14) {
          drawFooter(pageCount, 99);
          pdf.addPage();
          pageCount++;
          drawHeader();
          y = HEADER_H + 8;
        }

        try {
          pdf.addImage(photoDataUrl, imageFormat(photoDataUrl), margin, y, photoW, photoH);
        } catch {}

        if (caption) {
          pdf.setTextColor(...gray);
          pdf.setFont("helvetica", "italic");
          pdf.setFontSize(8);
          pdf.text(caption, margin, y + photoH + 4.5);
        }

        y += blockH + 2;
      }

      const pageCount2 = pdf.getNumberOfPages();
      for (let p = 1; p <= pageCount2; p++) {
        pdf.setPage(p);
        drawFooter(p, pageCount2);
      }

      pdf.save(`sentconnect-report-${post.id}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
      alert(`PDF generation failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setExporting(false);
    }
  }

  const firstPhoto = blobPhotoUrls.find(u => !!u) ?? null;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(10,20,40,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 24px 80px rgba(0,0,0,0.35)", display: "flex", flexDirection: "column", width: "100%", maxWidth: 860, maxHeight: "92vh", overflow: "hidden" }}>

        {/* Modal header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #F1F5F9", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "#EFF6FF", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText className="h-4 w-4" style={{ color: "#0268CE" }} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.02em" }}>Export as Report</h2>
              <p style={{ fontSize: 11, color: "#94A3B8", margin: "1px 0 0" }}>Generates a full-page PDF with photos and stats</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", display: "flex", padding: 4, borderRadius: 6 }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>

          {/* Preview */}
          <div style={{ flex: 1, background: "#F8FAFC", overflow: "auto", padding: 28, display: "flex", justifyContent: "center" }}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "#94A3B8", width: "100%" }}>
                <Loader2 className="h-7 w-7 animate-spin" />
                <span style={{ fontSize: 12 }}>Loading photos…</span>
              </div>
            ) : (
              <div style={{ width: "100%", maxWidth: 520, background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", border: "1px solid #E2E8F0", fontFamily: "'Inter', system-ui, sans-serif" }}>

                {/* Report header — plain white */}
                <div style={{ borderTop: "3px solid #1A80E0", padding: "12px 20px 10px", borderBottom: "1px solid #E2E8F0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {blobLogoUrl && (
                      <img src={blobLogoUrl} alt={orgName} style={{ height: 28, maxWidth: 80, objectFit: "contain", flexShrink: 0 }} />
                    )}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>{orgName || "Organization"}</div>
                      <div style={{ fontSize: 9, color: "#94A3B8", marginTop: 1 }}>Missionary Report</div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: "16px 20px" }}>
                  {post.isMissionMoment && (
                    <div style={{ display: "block", background: "#0047A8", color: "#fff", borderRadius: 4, padding: "3px 8px", fontSize: 8, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10, width: "fit-content" }}>
                      Mission Moment
                    </div>
                  )}

                  <div style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", marginBottom: 6, letterSpacing: "-0.02em" }}>{post.author.name}</div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                    {post.location && (
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, color: "#94A3B8" }}>
                        <MapPin className="h-2.5 w-2.5" /> {post.location}
                      </span>
                    )}
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, color: "#94A3B8" }}>
                      <Calendar className="h-2.5 w-2.5" /> {formatDate(post.createdAt)}
                    </span>
                    {post.peopleReached && (
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, color: "#0268CE", fontWeight: 700, background: "#EFF6FF", borderRadius: 3, padding: "1px 6px" }}>
                        <Users className="h-2.5 w-2.5" /> {post.peopleReached.toLocaleString()} people reached
                      </span>
                    )}
                  </div>

                  <div style={{ height: 1, background: "#F1F5F9", marginBottom: 10 }} />

                  <p style={{ fontSize: 10.5, color: "#1E293B", lineHeight: 1.65, margin: "0 0 12px", whiteSpace: "pre-wrap" }}>
                    {post.description}
                  </p>

                  {firstPhoto && (
                    <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #E2E8F0" }}>
                      <img src={firstPhoto} alt="" style={{ width: "100%", display: "block", objectFit: "cover", maxHeight: 240 }} />
                      {photos[0]?.caption && (
                        <div style={{ padding: "6px 10px", fontSize: 9, color: "#94A3B8", fontStyle: "italic" }}>{photos[0].caption}</div>
                      )}
                    </div>
                  )}

                  {photos.length > 1 && (
                    <p style={{ fontSize: 9, color: "#94A3B8", marginTop: 8, marginBottom: 0 }}>
                      + {photos.length - 1} more photo{photos.length > 2 ? "s" : ""} included in PDF
                    </p>
                  )}
                </div>

                <div style={{ background: "#F8FAFC", borderTop: "1px solid #E2E8F0", padding: "8px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 8, color: "#CBD5E1" }}>sentconnect.org</span>
                  <span style={{ fontSize: 8, color: "#CBD5E1" }}>Page 1 / …</span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ width: 220, borderLeft: "1px solid #F1F5F9", display: "flex", flexDirection: "column", padding: 20, gap: 16, flexShrink: 0 }}>

            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94A3B8", margin: "0 0 8px" }}>Includes</p>
              {[
                "Org logo & name",
                "Full post text",
                `${photos.length} photo${photos.length !== 1 ? "s" : ""}`,
                "Author & location",
                "Date & stats",
                "Auto page breaks",
              ].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#0268CE", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#374151" }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: "#F1F5F9" }} />

            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94A3B8", margin: "0 0 8px" }}>Format</p>
              <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>A4 portrait · PDF</p>
            </div>

            <div style={{ flex: 1 }} />

            <button
              onClick={generatePDF}
              disabled={exporting || loading}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                height: 44, borderRadius: 12, border: "none",
                cursor: exporting || loading ? "not-allowed" : "pointer",
                fontWeight: 700, fontSize: 14,
                background: exporting || loading ? "#93C5FD" : "linear-gradient(135deg, #0047A8, #0268CE)",
                color: "#fff",
                transition: "all .15s",
              }}
            >
              {exporting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
                : <><Download className="h-4 w-4" /> Download PDF</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
