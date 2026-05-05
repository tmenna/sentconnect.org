import { useLocation } from "wouter";

export default function HelpLanding() {
  const [, navigate] = useLocation();

  const font = "'Inter', system-ui, -apple-system, sans-serif";

  const guides = [
    {
      route: "/features",
      icon: "🚀",
      badge: "PLATFORM OVERVIEW",
      badgeColor: "#8705FA",
      badgeBg: "#F3E8FF",
      title: "Features & Sign-Up",
      subtitle: "New to SentConnect?",
      desc: "Get a quick tour of what the platform does — the mission feed, your private portal, PDF reports, and admin tools. Includes sign-up and account setup information.",
      bullets: [
        "What SentConnect does",
        "Mission Feed features",
        "PDF export & sharing",
        "Admin controls & roles",
      ],
      buttonBg: "#8705FA",
      bulletColor: "#8705FA",
      bulletBg: "#F3E8FF",
      dividerColor: "#D8B4FE",
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
      bullets: [
        "How to log in to your portal",
        "Creating your first post",
        "Adding photos & location",
        "Sharing your report",
      ],
      buttonBg: "#059669",
      bulletColor: "#059669",
      bulletBg: "#ECFDF5",
      dividerColor: "#A7F3D0",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#F9F5FF",
        fontFamily: font,
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(145deg, #3D0066 0%, #8705FA 55%, #A020F0 100%)",
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

        <h1 style={{ color: "#FFFFFF", fontSize: "clamp(26px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", margin: "0 0 14px 0", position: "relative" }}>
          How can we help you?
        </h1>
        <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "clamp(13px, 1.5vw, 18px)", fontWeight: 400, lineHeight: 1.65, margin: 0, maxWidth: 520, position: "relative" }}>
          Pick the guide that fits where you are — a quick features tour, or a step-by-step walkthrough for new members.
        </p>
      </div>

      {/* ── Two-column guide layout ──────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
          gap: 0,
        }}
      >
        {guides.map((g, i) => (
          <div
            key={g.route}
            style={{
              padding: "clamp(36px, 6vw, 72px) clamp(24px, 6vw, 72px)",
              borderRight: i === 0 ? "1px solid #E9D5FF" : "none",
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {/* Icon + Badge row */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
              <div style={{ fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 1 }}>{g.icon}</div>
              <span style={{ background: g.badgeBg, color: g.badgeColor, fontSize: "clamp(9px, 0.8vw, 11px)", fontWeight: 700, letterSpacing: "0.1em", padding: "5px 12px", borderRadius: 50 }}>
                {g.badge}
              </span>
            </div>

            {/* Subtitle */}
            <p style={{ color: "#94A3B8", fontSize: "clamp(12px, 1.1vw, 14px)", fontWeight: 600, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {g.subtitle}
            </p>

            {/* Title */}
            <h2 style={{ color: "#0F172A", fontSize: "clamp(26px, 3vw, 40px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 24px" }}>
              {g.title}
            </h2>

            {/* Description — large open text */}
            <p style={{ color: "#374151", fontSize: "clamp(15px, 1.4vw, 19px)", lineHeight: 1.8, margin: "0 0 32px", fontWeight: 400 }}>
              {g.desc}
            </p>

            {/* Bullets */}
            <ul style={{ listStyle: "none", margin: "0 0 40px", padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              {g.bullets.map(b => (
                <li key={b} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 22, height: 22, minWidth: 22, borderRadius: "50%", background: g.bulletBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: g.bulletColor }} />
                  </div>
                  <span style={{ color: "#1E293B", fontSize: "clamp(14px, 1.2vw, 17px)", fontWeight: 500, lineHeight: 1.4 }}>{b}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <div style={{ marginTop: "auto" }}>
              <button
                onClick={() => navigate(g.route)}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  background: g.buttonBg,
                  color: "#FFFFFF",
                  fontSize: "clamp(14px, 1.2vw, 17px)",
                  fontWeight: 700,
                  padding: "clamp(13px, 1.5vw, 17px) clamp(24px, 2.5vw, 36px)",
                  borderRadius: 999,
                  boxShadow: `0 4px 20px ${g.buttonBg}44`,
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.transform = "translateY(-2px)";
                  el.style.boxShadow = `0 8px 28px ${g.buttonBg}66`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = `0 4px 20px ${g.buttonBg}44`;
                }}
              >
                {g.title} <span style={{ fontSize: "1.2em", fontWeight: 400 }}>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#5A0097",
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
          Need help? Contact Support at +1-951-551-4528 (Call/WhatsApp)
        </span>
        <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "clamp(10px, 0.9vw, 12px)" }}>
          www.sentconnect.org
        </span>
      </div>
    </div>
  );
}
