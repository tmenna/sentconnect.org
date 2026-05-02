export default function Slide01Title() {
  return (
    <div
      className="w-screen h-screen overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #003A8C 0%, #0268CE 55%, #1A80E0 100%)",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Decorative circles */}
      <div style={{ position: "absolute", top: "-8vh", right: "-6vw", width: "40vw", height: "40vw", borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "8vh", left: "-8vw", width: "32vw", height: "32vw", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3vh 5vw 0", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          <div style={{ width: "2.6vw", height: "2.6vw", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "1.1vw", height: "1.1vw", borderRadius: "50%", background: "#FFFFFF" }} />
          </div>
          <span style={{ color: "#FFFFFF", fontSize: "1.4vw", fontWeight: 700, letterSpacing: "-0.01em" }}>SentConnect</span>
        </div>
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "1vw", fontWeight: 500 }}>Platform Guide · 2026</span>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 8vw 4vh", zIndex: 1 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6vw", background: "rgba(255,255,255,0.15)", borderRadius: 50, padding: "0.5vh 1.4vw", marginBottom: "3.5vh", width: "fit-content" }}>
          <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "#7DD3FC" }} />
          <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.95vw", fontWeight: 600, letterSpacing: "0.06em" }}>HELP GUIDE</span>
        </div>

        <h1 style={{
          color: "#FFFFFF",
          fontSize: "7.5vw",
          fontWeight: 800,
          lineHeight: 1.0,
          letterSpacing: "-0.04em",
          margin: "0 0 4vh 0",
        }}>
          SentConnect
        </h1>

        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.9vw", fontWeight: 400, lineHeight: 1.6, margin: "0 0 1.5vh 0", maxWidth: "48vw" }}>
          Bring your church and field teams closer together.
        </p>

        <div style={{ display: "flex", gap: "2.5vw", marginTop: "4.5vh" }}>
          {["Core Features Overview", "New User Step-by-Step Guide", "Sharing & Export"].map(item => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.7vw" }}>
              <div style={{ width: "0.6vw", height: "0.6vw", borderRadius: "50%", background: "#93C5FD", flexShrink: 0 }} />
              <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.1vw", fontWeight: 500 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2vh 5vw", background: "rgba(0,0,0,0.2)", zIndex: 1 }}>
        <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "1vw", fontWeight: 500 }}>24/7 Platform Contact: Teki Menna: 951-551-4528</span>
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "1vw" }}>www.sentconnect.org</span>
      </div>
    </div>
  );
}
