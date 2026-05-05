export default function Slide11Closing() {
  return (
    <div
      className="w-screen h-screen overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #3D0066 0%, #8705FA 55%, #A020F0 100%)",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: "-10vh", left: "-8vw", width: "40vw", height: "40vw", borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3vh 5vw 0", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          <div style={{ width: "2.6vw", height: "2.6vw", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "1.1vw", height: "1.1vw", borderRadius: "50%", background: "#FFFFFF" }} />
          </div>
          <span style={{ color: "#FFFFFF", fontSize: "1.4vw", fontWeight: 700 }}>SentConnect</span>
        </div>
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "1vw", fontWeight: 500 }}>11 of 11</span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 8vw 4vh", zIndex: 1, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6vw", background: "rgba(255,255,255,0.15)", borderRadius: 50, padding: "0.5vh 1.4vw", marginBottom: "3.5vh" }}>
          <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.95vw", fontWeight: 600, letterSpacing: "0.06em" }}>RESOURCES</span>
        </div>

        <h2 style={{ color: "#FFFFFF", fontSize: "5.5vw", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.04em", margin: "0 0 6vh 0" }}>
          You're All Set!
        </h2>

        <div style={{ display: "flex", gap: "3vw", justifyContent: "center" }}>
          {[
            { label: "PLATFORM", value: "www.sentconnect.org", icon: "🌐" },
            { label: "YOUR PORTAL", value: "[org].sentconnect.org/login", icon: "🔑" },
            { label: "NEED HELP?", value: "Contact Support\n+1-951-551-4528\n(Call/WhatsApp)", icon: "💬" },
          ].map(item => (
            <div key={item.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 16, padding: "3vh 2.5vw", textAlign: "center", minWidth: "18vw", backdropFilter: "blur(8px)" }}>
              <div style={{ fontSize: "2.8vh", marginBottom: "1.5vh" }}>{item.icon}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85vw", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "1.2vh" }}>{item.label}</div>
              <div style={{ color: "#FFFFFF", fontSize: "1.25vw", fontWeight: 600, lineHeight: 1.4, whiteSpace: "pre-line" }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2vh 5vw", background: "rgba(0,0,0,0.2)", zIndex: 1 }}>
        <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "1vw", fontWeight: 500 }}>Need help? Contact Support at +1-951-551-4528 (Call/WhatsApp)</span>
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "1vw" }}>www.sentconnect.org</span>
      </div>
    </div>
  );
}
