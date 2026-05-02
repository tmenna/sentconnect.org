export default function Slide02CoreFeatures() {
  const features = [
    {
      label: "MISSION FEED",
      title: "Private Social Feed",
      desc: "Org-scoped timeline where missionaries post updates, photos, and prayer requests — visible only to invited members.",
      accent: "#0268CE",
      bg: "#EFF6FF",
      icon: "📡",
    },
    {
      label: "MULTI-TENANT",
      title: "Per-Organization Portals",
      desc: "Each organization gets its own subdomain portal with fully isolated data. Admins manage their own users and content.",
      accent: "#0D9488",
      bg: "#F0FDFA",
      icon: "🏛️",
    },
    {
      label: "EXPORT",
      title: "PDF Reports",
      desc: "Admins export any post as a branded PDF report — photos, author, location, and date included for offline sharing.",
      accent: "#7C3AED",
      bg: "#F5F3FF",
      icon: "📄",
    },
  ];

  return (
    <div
      className="w-screen h-screen overflow-hidden"
      style={{
        background: "#F4F7FF",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2.5vh 5vw", background: "#FFFFFF", borderBottom: "1px solid #E8EEF8" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          <div style={{ width: "2.2vw", height: "2.2vw", borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "0.9vw", height: "0.9vw", borderRadius: "50%", background: "#0268CE" }} />
          </div>
          <span style={{ color: "#0047A8", fontSize: "1.3vw", fontWeight: 700 }}>SentConnect</span>
        </div>
        <span style={{ color: "#1E293B", fontSize: "1.3vw", fontWeight: 600 }}>Platform Overview</span>
        <span style={{ color: "#94A3B8", fontSize: "1vw", fontWeight: 500 }}>2 of 11</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "4vh 5vw 3vh" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6vw", marginBottom: "2.5vh" }}>
          <div style={{ width: "0.3vw", height: "3vh", background: "#0268CE", borderRadius: 2 }} />
          <span style={{ color: "#0268CE", fontSize: "1vw", fontWeight: 700, letterSpacing: "0.08em" }}>SECTION 01 · CORE FEATURES</span>
        </div>

        <h2 style={{ color: "#0F172A", fontSize: "3.8vw", fontWeight: 800, margin: "0 0 5vh 0", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          What SentConnect Does
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2.5vw" }}>
          {features.map(f => (
            <div key={f.label} style={{ background: "#FFFFFF", borderRadius: 16, padding: "3.5vh 2.5vw", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #E8EEF8", display: "flex", flexDirection: "column" }}>
              <div style={{ width: "5vh", height: "5vh", borderRadius: 12, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2vh", marginBottom: "2.5vh" }}>
                {f.icon}
              </div>
              <div style={{ color: f.accent, fontSize: "0.85vw", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "1vh" }}>{f.label}</div>
              <div style={{ color: "#0F172A", fontSize: "1.5vw", fontWeight: 700, marginBottom: "1.5vh", lineHeight: 1.25 }}>{f.title}</div>
              <div style={{ color: "#64748B", fontSize: "1.15vw", lineHeight: 1.65, flex: 1 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.8vh 5vw", background: "#0047A8" }}>
        <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95vw", fontWeight: 500 }}>CONTACT: TEKI MENNA · 951-551-4528</span>
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.95vw" }}>sentconnect.org</span>
      </div>
    </div>
  );
}
