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
      bullets: ["What SentConnect does", "Mission Feed features", "PDF export & sharing", "Admin controls & roles"],
      gradient: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
      border: "#BFDBFE",
      buttonBg: "#0268CE",
      buttonHover: "#0047A8",
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
      bullets: ["How to log in to your portal", "Creating your first post", "Adding photos & location", "Sharing your report"],
      gradient: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
      border: "#A7F3D0",
      buttonBg: "#059669",
      buttonHover: "#047857",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F4F7FF",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Hero header */}
      <div
        style={{
          background: "linear-gradient(145deg, #003A8C 0%, #0268CE 55%, #1A80E0 100%)",
          padding: "clamp(32px, 6vw, 72px) clamp(24px, 8vw, 120px) clamp(40px, 7vw, 80px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: "-15%", right: "-5%", width: "40vw", height: "40vw", borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-20%", left: "-8%", width: "30vw", height: "30vw", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "clamp(28px, 4vw, 48px)", position: "relative" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#FFFFFF" }} />
          </div>
          <span style={{ color: "#FFFFFF", fontSize: "clamp(16px, 1.8vw, 22px)", fontWeight: 700 }}>SentConnect</span>
          <span style={{ color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>·</span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "clamp(13px, 1.3vw, 16px)", fontWeight: 500 }}>Help Center</span>
        </div>

        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.15)", borderRadius: 50, padding: "6px 16px", marginBottom: 20 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#93C5FD" }} />
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "clamp(10px, 1vw, 13px)", fontWeight: 600, letterSpacing: "0.07em" }}>CHOOSE WHERE TO BEGIN</span>
          </div>
          <h1 style={{ color: "#FFFFFF", fontSize: "clamp(28px, 5vw, 60px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", margin: "0 0 16px 0" }}>
            How can we help you?
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "clamp(14px, 1.5vw, 20px)", fontWeight: 400, lineHeight: 1.6, margin: 0, maxWidth: 560 }}>
            Pick the guide that fits where you are — a quick features tour, or a step-by-step walkthrough for new members.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
          gap: "clamp(16px, 3vw, 32px)",
          padding: "clamp(24px, 5vw, 56px) clamp(24px, 8vw, 120px)",
          alignItems: "start",
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
              borderRadius: 20,
              border: `2px solid ${p.border}`,
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
              transition: "transform 0.18s ease, box-shadow 0.18s ease",
              textAlign: "left",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-4px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.13)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.07)";
            }}
          >
            {/* Card top gradient band */}
            <div style={{ background: p.gradient, padding: "clamp(20px, 3vw, 32px) clamp(20px, 3vw, 32px) clamp(16px, 2.5vw, 28px)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                <div style={{ width: "clamp(48px,5vw,60px)", height: "clamp(48px,5vw,60px)", borderRadius: 16, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(22px,2.5vw,30px)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                  {p.icon}
                </div>
                <span style={{ background: p.badgeBg, color: p.badgeColor, fontSize: "clamp(9px,0.8vw,11px)", fontWeight: 700, letterSpacing: "0.08em", padding: "4px 10px", borderRadius: 50, whiteSpace: "nowrap" }}>
                  {p.badge}
                </span>
              </div>
              <div style={{ color: "#94A3B8", fontSize: "clamp(11px,1vw,13px)", fontWeight: 600, marginBottom: 6 }}>{p.subtitle}</div>
              <h2 style={{ color: "#0F172A", fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 800, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                {p.title}
              </h2>
            </div>

            {/* Card body */}
            <div style={{ padding: "clamp(20px, 3vw, 28px)", display: "flex", flexDirection: "column", gap: "clamp(16px, 2vw, 22px)" }}>
              <p style={{ color: "#475569", fontSize: "clamp(13px,1.1vw,15px)", lineHeight: 1.65, margin: 0 }}>
                {p.desc}
              </p>

              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {p.bullets.map(b => (
                  <li key={b} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 20, height: 20, minWidth: 20, borderRadius: "50%", background: p.slideBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: p.slideColor }} />
                    </div>
                    <span style={{ color: "#334155", fontSize: "clamp(12px,1vw,14px)", fontWeight: 500 }}>{b}</span>
                  </li>
                ))}
              </ul>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "clamp(12px,1.5vw,16px)", borderTop: "1px solid #F1F5F9" }}>
                <span style={{ color: p.slideColor, fontSize: "clamp(11px,0.9vw,13px)", fontWeight: 600, background: p.slideBg, padding: "4px 10px", borderRadius: 50 }}>
                  {p.slides}
                </span>
                <div
                  style={{
                    background: p.buttonBg,
                    color: "#FFFFFF",
                    fontSize: "clamp(12px,1vw,14px)",
                    fontWeight: 600,
                    padding: "10px 20px",
                    borderRadius: 50,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    transition: "background 0.15s",
                  }}
                >
                  Open guide <span style={{ fontSize: "1.1em" }}>›</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div style={{ background: "#0047A8", padding: "clamp(14px, 2vw, 20px) clamp(24px, 8vw, 120px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "clamp(11px,1vw,14px)", fontWeight: 500 }}>24/7 Platform Contact: Teki Menna: 951-551-4528</span>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "clamp(11px,0.9vw,13px)" }}>www.sentconnect.org</span>
      </div>
    </div>
  );
}
