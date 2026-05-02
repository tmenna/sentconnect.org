export default function Slide03FeedFeatures() {
  const features = [
    { icon: "📝", title: "Rich Text Posts", desc: "Write updates with formatting, share what God is doing in the field." },
    { icon: "📷", title: "Photo & Video", desc: "Attach multiple photos or videos directly to any post." },
    { icon: "📍", title: "Location Tags", desc: "Pin a location to your post so supporters know where you are." },
    { icon: "🙏", title: "Prayer Requests", desc: "Mark posts as prayer requests to highlight specific needs." },
    { icon: "⭐", title: "Mission Moments", desc: "Admins highlight special posts as featured Mission Moments." },
    { icon: "💬", title: "Comments & Likes", desc: "Org members can react and comment to encourage missionaries." },
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2.5vh 5vw", background: "#FFFFFF", borderBottom: "1px solid #E8EEF8" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          <div style={{ width: "2.2vw", height: "2.2vw", borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "0.9vw", height: "0.9vw", borderRadius: "50%", background: "#0268CE" }} />
          </div>
          <span style={{ color: "#0047A8", fontSize: "1.3vw", fontWeight: 700 }}>SentConnect</span>
        </div>
        <span style={{ color: "#1E293B", fontSize: "1.3vw", fontWeight: 600 }}>Private Social Feed</span>
        <span style={{ color: "#94A3B8", fontSize: "1vw", fontWeight: 500 }}>3 of 11</span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "3vh 5vw 2.5vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "2vh" }}>
          <div style={{ width: "0.3vw", height: "3vh", background: "#0268CE", borderRadius: 2 }} />
          <span style={{ color: "#0268CE", fontSize: "1vw", fontWeight: 700, letterSpacing: "0.08em" }}>FEATURE · MISSION FEED</span>
        </div>
        <h2 style={{ color: "#0F172A", fontSize: "3.4vw", fontWeight: 800, margin: "0 0 3.5vh 0", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Your Team's Private Timeline
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.8vw 2vw" }}>
          {features.map(f => (
            <div key={f.title} style={{ background: "#FFFFFF", borderRadius: 14, padding: "2.2vh 2vw", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #E8EEF8", display: "flex", gap: "1.2vw", alignItems: "flex-start" }}>
              <div style={{ fontSize: "2vh", width: "4.5vh", height: "4.5vh", minWidth: "4.5vh", background: "#EFF6FF", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {f.icon}
              </div>
              <div>
                <div style={{ color: "#0F172A", fontSize: "1.2vw", fontWeight: 700, marginBottom: "0.5vh" }}>{f.title}</div>
                <div style={{ color: "#64748B", fontSize: "1.05vw", lineHeight: 1.55 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.8vh 5vw", background: "#0047A8" }}>
        <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95vw", fontWeight: 500 }}>CONTACT: TEKI MENNA · 951-551-4528</span>
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.95vw" }}>sentconnect.org</span>
      </div>
    </div>
  );
}
