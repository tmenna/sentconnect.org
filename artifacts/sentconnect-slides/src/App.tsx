/**
 * Platform contract file — do not restructure.
 *
 * This file is part of the contract between the slides artifact and
 * the surrounding workspace tooling (preview, thumbnails, exports).
 * Reorganizing it, swapping the router, or changing the structure
 * of `AllSlides` can quietly break that tooling even when the page
 * still looks correct in the preview.
 *
 * Agents: see the slides skill `<workspace_contract>` for the full
 * rules, and `references/visual_qa.md` → "Platform contract sanity
 * check" if this file has been hand-edited and needs repair.
 */

import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

import { slides } from "@/slideLoader";
import { SlideNav } from "@/components/SlideNav";
import HelpLanding from "@/pages/HelpLanding";

function getSlideIndex(pathname: string): number {
  const match = pathname.match(/^\/slide(\d+)$/);
  if (!match) return -1;
  const position = parseInt(match[1], 10);
  return slides.findIndex((s) => s.position === position);
}

function SlideEditor() {
  const [location, navigate] = useLocation();
  const currentIndex = getSlideIndex(location);

  // In the workspace, the slide iframe is nested inside another iframe,
  // so window.parent !== window.parent.parent. In the deployed SlideViewer,
  // the parent is the top-level window, so they're equal. Disable local
  // navigation only in the workspace — the parent owns it there.
  const navigationDisabledRef = useRef(window.parent !== window.parent.parent);
  const touchHandledRefStable = useRef(false);

  useEffect(() => {
    if (currentIndex === -1) return;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (navigationDisabledRef.current) return;
      if (event.key === " ") {
        event.preventDefault();
      }
      if ((event.key === "ArrowLeft" || event.key === "ArrowUp") && currentIndex > 0) {
        navigate(`/slide${slides[currentIndex - 1].position}`);
      }
      if (
        (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === " ") &&
        currentIndex < slides.length - 1
      ) {
        navigate(`/slide${slides[currentIndex + 1].position}`);
      }
    };

    const INTERACTIVE =
      "a,button,video,audio,input,select,textarea,details,summary,iframe,svg,canvas," +
      '[role="button"],[contenteditable="true"]';

    const isInteractive = (target: EventTarget | null) =>
      (target as HTMLElement | null)?.closest?.(INTERACTIVE);

    const touchHandledRef = touchHandledRefStable;

    const onClick = (event: MouseEvent) => {
      if (touchHandledRef.current) {
        touchHandledRef.current = false;
        return;
      }
      if (event.button !== 0 || event.metaKey || event.ctrlKey) return;
      if (isInteractive(event.target)) return;

      if (navigationDisabledRef.current) {
        window.parent.postMessage({ type: "advanceSlide" }, "*");
        return;
      }

      if (currentIndex < slides.length - 1) {
        navigate(`/slide${slides[currentIndex + 1].position}`);
      }
    };

    let touchStartX = 0;
    let touchStartY = 0;
    let touchTarget: EventTarget | null = null;

    const onTouchStart = (event: TouchEvent) => {
      touchHandledRef.current = false;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
      touchTarget = event.target;
    };

    const onTouchEnd = (event: TouchEvent) => {
      const dx = event.changedTouches[0].clientX - touchStartX;
      const dy = event.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) >= 10 || Math.abs(dy) >= 10) return;
      if (isInteractive(touchTarget)) return;
      touchHandledRef.current = true;

      if (navigationDisabledRef.current) {
        window.parent.postMessage({ type: "advanceSlide" }, "*");
        return;
      }

      const fraction = touchStartX / window.innerWidth;
      if (fraction < 0.4 && currentIndex > 0) {
        navigate(`/slide${slides[currentIndex - 1].position}`);
      } else if (fraction >= 0.4 && currentIndex < slides.length - 1) {
        navigate(`/slide${slides[currentIndex + 1].position}`);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("click", onClick);
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("click", onClick);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [currentIndex, navigate]);

  return (
    <div className="select-none">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          style={{ display: index === currentIndex ? "block" : "none" }}
        >
          <slide.Component />
        </div>
      ))}
      <SlideNav />
    </div>
  );
}

// Do not rewrite this component. Each slide must remain wrapped in
// `<div className="slide">` sized 1920×1080 — the class name and
// dimensions are part of the platform contract. See the file-level
// banner above for context.
function AllSlides() {
  return (
    <div className="bg-black">
      {slides.map((slide) => (
        <div
          key={slide.id}
          className="slide relative aspect-video overflow-hidden"
          style={{ width: "1920px", height: "1080px" }}
        >
          <div className="h-full w-full [&_.h-screen]:!h-full [&_.w-screen]:!w-full">
            <slide.Component />
          </div>
        </div>
      ))}
    </div>
  );
}

function getViewport() {
  return { w: window.innerWidth, h: window.innerHeight };
}

// This component is used for the deployed view at `/features` and `/guide`
function SlideViewer({ startPosition, maxPosition }: { startPosition?: number; maxPosition?: number }) {
  const [, navigate] = useLocation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [vp, setVp] = useState(getViewport);

  useEffect(() => {
    const update = () => setVp(getViewport());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== " ") return;
      if (event.key === " ") event.preventDefault();
      iframeRef.current?.contentWindow?.dispatchEvent(
        new KeyboardEvent("keydown", { key: event.key, code: event.code, bubbles: true }),
      );
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const firstPosition = startPosition ?? (slides.length > 0 ? slides[0].position : 1);
  const boundsQuery = maxPosition !== undefined ? `?max=${maxPosition}` : "";

  const isPortrait = vp.h > vp.w * 1.1;

  const font = "'Inter', system-ui, -apple-system, sans-serif";

  // ── Mobile / portrait layout ──────────────────────────────────────────────
  if (isPortrait) {
    const slideW = vp.w;
    const slideH = Math.round(vp.w * (9 / 16));
    const remainingH = vp.h - 52 - slideH; // 52 = header bar

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100dvh", width: "100vw", background: "#05112A", fontFamily: font, overflow: "hidden" }}>

        {/* Header bar */}
        <div style={{ height: 52, minHeight: 52, background: "#5A0097", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0 }}>
          <button
            onClick={() => navigate("/")}
            style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#FFFFFF", fontSize: 14, fontWeight: 600 }}
          >
            <span style={{ fontSize: 16 }}>←</span> Help Home
          </button>
          <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: 500 }}>SentConnect Help</span>
        </div>

        {/* Slide iframe — full width, aspect-ratio height */}
        <div style={{ width: slideW, height: slideH, flexShrink: 0 }} onClick={() => iframeRef.current?.focus()}>
          <iframe
            ref={iframeRef}
            src={`${base}/slide${firstPosition}${boundsQuery}`}
            style={{ width: slideW, height: slideH, border: "none", display: "block" }}
            onLoad={() => iframeRef.current?.focus()}
            title="Slide viewer"
          />
        </div>

        {/* Below-slide area */}
        {remainingH > 40 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", borderRadius: 50, padding: "8px 18px" }}>
              <span style={{ fontSize: 18 }}>↻</span>
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 500 }}>Rotate for the best experience</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 12, margin: 0, textAlign: "center", lineHeight: 1.5 }}>
              Use the arrows inside the slide to navigate
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Desktop / landscape layout ────────────────────────────────────────────
  const deskW = Math.min(vp.w, vp.h * (16 / 9));
  const deskH = Math.min(vp.h, vp.w * (9 / 16));

  return (
    <div
      className="slide-viewer h-screen w-screen overflow-hidden bg-black flex items-center justify-center"
      style={{ position: "relative" }}
      onClick={() => iframeRef.current?.focus()}
    >
      <iframe
        ref={iframeRef}
        src={`${base}/slide${firstPosition}${boundsQuery}`}
        style={{ width: deskW, height: deskH, border: "none" }}
        onLoad={() => iframeRef.current?.focus()}
        title="Slide viewer"
      />

      {/* Back to Help Home — floating pill */}
      <button
        onClick={(e) => { e.stopPropagation(); navigate("/"); }}
        style={{
          position: "fixed", top: 14, left: 14, zIndex: 9999,
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(90, 0, 151, 0.88)",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 50, padding: "7px 14px 7px 10px",
          fontSize: 13, fontWeight: 600, fontFamily: font,
          cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.35)",
          transition: "background 0.15s, transform 0.15s",
          letterSpacing: "0.01em", lineHeight: 1,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(90, 0, 151, 1)";
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.04)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(90, 0, 151, 0.88)";
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        }}
      >
        <span style={{ fontSize: 15, lineHeight: 1 }}>←</span>
        Help Home
      </button>
    </div>
  );
}

export default function App() {
  const [location, navigate] = useLocation();

  // DO NOT edit this useEffect - redirects unknown routes to the first slide.
  // The "/", "/features", "/guide", and "/allslides" routes are handled separately below.
  useEffect(() => {
    if (
      location !== "/" &&
      location !== "/features" &&
      location !== "/guide" &&
      location !== "/allslides" &&
      getSlideIndex(location) === -1
    ) {
      if (slides.length > 0) {
        navigate(`/slide${slides[0].position}`, { replace: true });
      }
    }
  }, [location, navigate]);

  // DO NOT edit this useEffect - allows the parent frame to navigate
  // between slides via postMessage so it can avoid changing the iframe
  // src (which causes a white flash).
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.data?.type === "navigateToSlide" &&
        typeof event.data.position === "number" &&
        slides.some((s) => s.position === event.data.position)
      ) {
        navigate(`/slide${event.data.position}`);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [navigate]);

  if (location === "/") return <HelpLanding />;
  if (location === "/features") return <SlideViewer startPosition={1} maxPosition={6} />;
  if (location === "/guide") return <SlideViewer startPosition={7} />;
  if (location === "/allslides") return <AllSlides />;
  return <SlideEditor />;
}
