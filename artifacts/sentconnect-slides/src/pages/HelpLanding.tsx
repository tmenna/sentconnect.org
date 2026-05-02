import { useLocation } from "wouter";

export default function HelpLanding() {
  const [, navigate] = useLocation();

  const paths = [
    {
      route: "/features",
      icon: "🚀",
      badge: "PLATFORM OVERVIEW",
      badgeColor: "#0268CE",
      badgeBg: "#EFF6FF",
      title: "Features & Sign-Up",
      subtitle: "New to SentConnect?",
      desc: "Get a quick tour of what the platform does — the mission feed, your private portal, PDF reports, and admin tools. Includes sign-up and account setup information.",
      slides: "Slides 1 – 6",
      slideColor: "#0268CE",
      slideBg: "#EFF6FF",
      bullets: [
        "What SentConnect does",
        "Mission Feed features",
        "PDF export & sharing",
        "Admin controls & roles",
      ],
      gradient: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
      border: "#BFDBFE",
      buttonBg: "#0268CE",
    },
    {
      route: "/guide",
      icon: "📖",
      badge: "NEW MEMBER GUIDE",
      badgeColor: "#059669",
      badgeBg: "#ECFDF5",
      title: "Getting Started",
      subtitle: "Already have an account?",
      desc: "Step-by-step instructions built for new organization members — from your first login to writing your first post and sharing it with supporters.",
      slides: "Slides 7 – 11",
      slideColor: "#059669",
      slideBg: "#ECFDF5",
      bullets: [
        "How to log in to your portal",
        "Creating your first post",
        "Adding photos & location",
        "Sharing your report",
      ],
      gradient: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
      border: "#A7F3D0",
      buttonBg: "#059669",
    },
  ];

  const font = "'Inter', system-ui, -apple-system, sans-serif";

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#F4F7FF",
        fontFamily: font,
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(145deg, #003A8C 0%, #0268CE 55%, #1A80E0 100%)",
          padding: "clamp(24px, 5vw, 64px) clamp(20px, 6vw, 100px) clamp(28px, 5vw, 64px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: "-15%", right: "-5%", width: "clamp(160px,40vw,420px)", height: "clamp(160px,40vw,420px)", borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-20%", left: "-8%", width: "clamp(120px,30vw,320px)", height: "clamp(120px,30vw,320px)", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: "clamp(20px, 4vw, 40px)", position: "relative", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ width: 32, height: 32, minWidth: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FFFFFF" }} />
            </div>
            <span style={{ color: "#FFFFFF", fontSize: "clamp(15px, 1.8vw, 20px)", fontWeight: 700 }}>SentConnect</span>
            <span style={{ color: "rgba(255,255,255,0.35)" }}>·</span>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "clamp(12px, 1.3vw, 15px)", fontWeight: 500 }}>Help Center</span>
          </div>

          {/* Back to main site */}
          <a
            href="https://www.sentconnect.org"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 50,
              padding: "6px 14px",
              color: "rgba(255,255,255,0.88)",
              fontSize: "clamp(11px, 1vw, 13px)",
              fontWeight: 600,
              textDecoration: "none",
              transition: "background 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.22)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.12)"; }}
          >
            <span style={{ fontSize: 13 }}>←</span>
            sentconnect.org
          </a>
        </div>

        {/* Eyebrow pill */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.15)", borderRadius: 50, padding: "5px 14px", marginBottom: 16, position: "relative" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#93C5FD" }} />
          <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "clamp(9px, 1vw, 12px)", fontWeight: 600, letterSpacing: "0.07em" }}>CHOOSE WHERE TO BEGIN</span>
        </div>

        <h1 style={{ color: "#FFFFFF", fontSize: "clamp(26px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", margin: "0 0 14px 0", position: "relative" }}>
          How can we help you?
        </h1>
        <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "clamp(13px, 1.5vw, 18px)", fontWeight: 400, lineHeight: 1.65, margin: 0, maxWidth: 520, position: "relative" }}>
          Pick the guide that fits where you are — a quick features tour, or a step-by-step walkthrough for new members.
        </p>
      </div>

      {/* ── Cards ───────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          gap: "clamp(14px, 3vw, 28px)",
          padding: "clamp(20px, 4vw, 48px) clamp(16px, 6vw, 100px)",
          alignItems: "start",
          boxSizing: "border-box",
        }}
      >
        {paths.map((p) => (
          <button
            key={p.route}
            onClick={() => navigate(p.route)}
            style={{
              all: "unset",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              background: "#FFFFFF",
              borderRadius: 18,
              border: `2px solid ${p.border}`,
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
              transition: "transform 0.18s ease, box-shadow 0.18s ease",
              textAlign: "left",
              width: "100%",
              boxSizing: "border-box",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 10px 36px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)";
            }}
          >
            {/* Gradient top band */}
            <div style={{ background: p.gradient, padding: "clamp(16px, 3vw, 28px) clamp(16px, 3vw, 28px) clamp(14px, 2.5vw, 24px)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
                <div style={{ width: "clamp(44px, 5vw, 56px)", height: "clamp(44px, 5vw, 56px)", minWidth: "clamp(44px, 5vw, 56px)", borderRadius: 14, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(20px, 2.5vw, 28px)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                  {p.icon}
                </div>
                <span style={{ background: p.badgeBg, color: p.badgeColor, fontSize: "clamp(8px, 0.8vw, 10px)", fontWeight: 700, letterSpacing: "0.08em", padding: "4px 9px", borderRadius: 50, whiteSpace: "nowrap", marginTop: 4 }}>
                  {p.badge}
                </span>
              </div>
              <div style={{ color: "#94A3B8", fontSize: "clamp(10px, 1vw, 12px)", fontWeight: 600, marginBottom: 5 }}>{p.subtitle}</div>
              <h2 style={{ color: "#0F172A", fontSize: "clamp(18px, 2.2vw, 26px)", fontWeight: 800, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                {p.title}
              </h2>
            </div>

            {/* Card body */}
            <div style={{ padding: "clamp(16px, 2.5vw, 24px)", display: "flex", flexDirection: "column", gap: "clamp(14px, 1.8vw, 20px)" }}>
              <p style={{ color: "#475569", fontSize: "clamp(12px, 1.1vw, 14px)", lineHeight: 1.65, margin: 0 }}>
                {p.desc}
              </p>

              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
                {p.bullets.map(b => (
                  <li key={b} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 18, height: 18, minWidth: 18, borderRadius: "50%", background: p.slideBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.slideColor }} />
                    </div>
                    <span style={{ color: "#334155", fontSize: "clamp(11px, 1vw, 13px)", fontWeight: 500 }}>{b}</span>
                  </li>
                ))}
              </ul>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, paddingTop: "clamp(10px, 1.5vw, 14px)", borderTop: "1px solid #F1F5F9", flexWrap: "wrap" }}>
                <span style={{ background: p.slideBg, color: p.slideColor, fontSize: "clamp(10px, 0.85vw, 12px)", fontWeight: 600, padding: "4px 10px", borderRadius: 50, whiteSpace: "nowrap" }}>
                  {p.slides}
                </span>
                <div
                  style={{
                    background: p.buttonBg,
                    color: "#FFFFFF",
                    fontSize: "clamp(12px, 1vw, 14px)",
                    fontWeight: 600,
                    padding: "10px clamp(14px, 2vw, 20px)",
                    borderRadius: 50,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                  }}
                >
                  Open guide <span style={{ fontSize: "1.1em" }}>›</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#0047A8",
          padding: "clamp(12px, 2vw, 18px) clamp(16px, 6vw, 100px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 6,
          boxSizing: "border-box",
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "clamp(10px, 1vw, 13px)", fontWeight: 500 }}>
          24/7 Platform Contact: Teki Menna: 951-551-4528
        </span>
        <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "clamp(10px, 0.9vw, 12px)" }}>
          www.sentconnect.org
        </span>
      </div>
    </div>
  );
}
