export default function Slide04PostComposer() {
  const fields = [
    { icon: "📝", label: "Post Text", desc: "Write your update, story, or reflection — no character limit.", color: "#F3E8FF", accent: "#8705FA" },
    { icon: "📷", label: "Photos & Videos", desc: "Attach images or short clips directly from your device.", color: "#F0FDF4", accent: "#16A34A" },
    { icon: "📍", label: "Location", desc: "Optionally tag a city, country, or field location.", color: "#FFF7ED", accent: "#EA580C" },
    { icon: "✨", label: "Mission Moment", desc: "Mark this as a special highlight (admin/owner only).", color: "#FFFBEB", accent: "#D97706" },
  ];

  return (
    <div
      className="w-screen h-screen overflow-hidden"
      style={{
        background: "#F9F5FF",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2.5vh 5vw", background: "#FFFFFF", borderBottom: "1px solid #EDE9FE" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          <div style={{ width: "2.2vw", height: "2.2vw", borderRadius: "50%", background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "0.9vw", height: "0.9vw", borderRadius: "50%", background: "#8705FA" }} />
          </div>
          <span style={{ color: "#5A0097", fontSize: "1.3vw", fontWeight: 700 }}>SentConnect</span>
        </div>
        <span style={{ color: "#1E293B", fontSize: "1.3vw", fontWeight: 600 }}>Creating Posts</span>
        <span style={{ color: "#94A3B8", fontSize: "1vw", fontWeight: 500 }}>4 of 11</span>
      </div>

      <div style={{ flex: 1, display: "flex", gap: "4vw", padding: "3.5vh 5vw 3vh", alignItems: "flex-start" }}>
        <div style={{ flex: "0 0 38%", display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "2.5vh" }}>
            <div style={{ width: "0.3vw", height: "3vh", background: "#8705FA", borderRadius: 2 }} />
            <span style={{ color: "#8705FA", fontSize: "1vw", fontWeight: 700, letterSpacing: "0.08em" }}>FEATURE · POST COMPOSER</span>
          </div>
          <h2 style={{ color: "#0F172A", fontSize: "3.5vw", fontWeight: 800, margin: "0 0 2.5vh 0", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            What You Can Include in a Post
          </h2>
          <p style={{ color: "#64748B", fontSize: "1.25vw", lineHeight: 1.65, margin: "0 0 3vh 0" }}>
            Each post can carry rich context — photos and location — so your supporters feel truly connected to your work.
          </p>
          <div style={{ background: "#F3E8FF", borderRadius: 12, padding: "2vh 1.8vw", border: "1px solid #D8B4FE" }}>
            <div style={{ color: "#5A0097", fontSize: "0.9vw", fontWeight: 700, marginBottom: "0.8vh", letterSpacing: "0.06em" }}>TIP</div>
            <div style={{ color: "#6B04C8", fontSize: "1.1vw", lineHeight: 1.55 }}>Tap the compose button at the top of your feed to open the post editor.</div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5vh", justifyContent: "center", height: "100%" }}>
          {fields.map(f => (
            <div key={f.label} style={{ background: "#FFFFFF", borderRadius: 12, padding: "1.8vh 2vw", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #EDE9FE", display: "flex", alignItems: "center", gap: "1.5vw" }}>
              <div style={{ width: "4.5vh", height: "4.5vh", minWidth: "4.5vh", borderRadius: 10, background: f.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2vh" }}>
                {f.icon}
              </div>
              <div>
                <span style={{ color: "#0F172A", fontSize: "1.2vw", fontWeight: 700 }}>{f.label}</span>
                <span style={{ color: "#64748B", fontSize: "1.1vw", marginLeft: "1vw" }}>{f.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.8vh 5vw", background: "#5A0097" }}>
        <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95vw", fontWeight: 500 }}>Need help? Contact Support at +1-951-551-4528 (Call/WhatsApp)</span>
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.95vw" }}>www.sentconnect.org</span>
      </div>
    </div>
  );
}
