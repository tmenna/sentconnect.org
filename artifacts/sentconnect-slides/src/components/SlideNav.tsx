import { useState } from "react";
import { useLocation } from "wouter";
import { slides } from "@/slideLoader";

export function SlideNav() {
  const [location, navigate] = useLocation();
  const match = location.match(/^\/slide(\d+)$/);
  const currentPosition = match ? parseInt(match[1], 10) : -1;
  const [menuOpen, setMenuOpen] = useState(false);

  // Read optional ?max= bound set by the parent SlideViewer
  const urlParams = new URLSearchParams(window.location.search);
  const maxBound = urlParams.has("max") ? parseInt(urlParams.get("max")!, 10) : null;
  const boundsQuery = maxBound !== null ? `?max=${maxBound}` : "";

  // Only show slides within the section bound
  const visibleSlides = maxBound !== null
    ? slides.filter(s => s.position <= maxBound)
    : slides;

  const currentIndex = visibleSlides.findIndex(s => s.position === currentPosition);

  if (currentIndex === -1) return null;

  const total = visibleSlides.length;
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < total - 1;

  function goTo(index: number) {
    navigate(`/slide${visibleSlides[index].position}${boundsQuery}`);
    setMenuOpen(false);
  }

  return (
    <>
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 998,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(3px)",
          }}
        />
      )}

      {menuOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "9vh",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999,
            background: "#FFFFFF",
            borderRadius: 16,
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            padding: "12px 8px",
            minWidth: "min(92vw, 520px)",
            maxHeight: "72vh",
            overflowY: "auto",
          }}
        >
          <div style={{ padding: "6px 14px 10px", borderBottom: "1px solid #F1F5F9", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", fontFamily: "system-ui, sans-serif" }}>
              JUMP TO SLIDE
            </span>
          </div>
          {visibleSlides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => goTo(idx)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "10px 14px",
                background: idx === currentIndex ? "#F3E8FF" : "transparent",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (idx !== currentIndex) (e.currentTarget as HTMLButtonElement).style.background = "#F5F0FF"; }}
              onMouseLeave={e => { if (idx !== currentIndex) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <span style={{
                minWidth: 26, height: 26, borderRadius: 6,
                background: idx === currentIndex ? "#8705FA" : "#F1F5F9",
                color: idx === currentIndex ? "#FFFFFF" : "#64748B",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, fontFamily: "system-ui, sans-serif", flexShrink: 0,
              }}>
                {slide.position}
              </span>
              <span style={{
                fontSize: 13.5, fontWeight: idx === currentIndex ? 600 : 500,
                color: idx === currentIndex ? "#5A0097" : "#1E293B",
                fontFamily: "system-ui, sans-serif", lineHeight: 1.35,
              }}>
                {slide.title}
              </span>
            </button>
          ))}
        </div>
      )}

      <div
        style={{
          position: "fixed",
          bottom: "3vh",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(15, 23, 42, 0.82)",
          backdropFilter: "blur(12px)",
          borderRadius: 50,
          padding: "8px 16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        }}
      >
        <button
          onClick={e => { e.stopPropagation(); if (canPrev) goTo(currentIndex - 1); }}
          disabled={!canPrev}
          style={{
            background: "none", border: "none", cursor: canPrev ? "pointer" : "default",
            color: canPrev ? "#FFFFFF" : "rgba(255,255,255,0.25)",
            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "50%", fontSize: 18, transition: "background 0.15s",
          }}
          onMouseEnter={e => { if (canPrev) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
          title="Previous slide"
        >
          ‹
        </button>

        <button
          onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
          style={{
            background: menuOpen ? "rgba(255,255,255,0.18)" : "none",
            border: "none", cursor: "pointer",
            color: "#FFFFFF", borderRadius: 20,
            padding: "4px 14px",
            display: "flex", alignItems: "center", gap: 7,
            fontSize: 12.5, fontWeight: 600, fontFamily: "system-ui, sans-serif",
            letterSpacing: "0.02em", transition: "background 0.15s", whiteSpace: "nowrap",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = menuOpen ? "rgba(255,255,255,0.18)" : "none"; }}
          title="All slides"
        >
          <span style={{ fontSize: 15, lineHeight: 1 }}>☰</span>
          <span>{currentIndex + 1} / {total}</span>
        </button>

        <button
          onClick={e => { e.stopPropagation(); if (canNext) goTo(currentIndex + 1); }}
          disabled={!canNext}
          style={{
            background: "none", border: "none", cursor: canNext ? "pointer" : "default",
            color: canNext ? "#FFFFFF" : "rgba(255,255,255,0.25)",
            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "50%", fontSize: 18, transition: "background 0.15s",
          }}
          onMouseEnter={e => { if (canNext) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
          title="Next slide"
        >
          ›
        </button>
      </div>
    </>
  );
}
