export default function Slide07UserGuideIntro() {
  return (
    <div
      className="w-screen h-screen overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #005BC4 0%, #0268CE 50%, #1A80E0 100%)",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", bottom: "-10vh", right: "-8vw", width: "48vw", height: "48vw", borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3vh 5vw 0", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          <div style={{ width: "2.6vw", height: "2.6vw", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "1.1vw", height: "1.1vw", borderRadius: "50%", background: "#FFFFFF" }} />
          </div>
          <span style={{ color: "#FFFFFF", fontSize: "1.4vw", fontWeight: 700 }}>SentConnect</span>
        </div>
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "1vw", fontWeight: 500 }}>7 of 11</span>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 8vw 4vh", zIndex: 1 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6vw", background: "rgba(255,255,255,0.15)", borderRadius: 50, padding: "0.5vh 1.4vw", marginBottom: "3.5vh", width: "fit-content" }}>
          <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "#BAE6FD" }} />
          <span style={{ color: "rgba(255,255,255,0.95)", fontSize: "0.95vw", fontWeight: 600, letterSpacing: "0.06em" }}>SECTION 02 · NEW USER GUIDE</span>
        </div>

        <h2 style={{ color: "#FFFFFF", fontSize: "6.5vw", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.04em", margin: "0 0 4vh 0", maxWidth: "65vw" }}>
          Getting Started
        </h2>

        <p style={{ color: "rgba(255,255,255,0.78)", fontSize: "1.8vw", fontWeight: 400, lineHeight: 1.65, margin: 0, maxWidth: "50vw" }}>
          Step-by-step instructions for new members — from first login to sharing your first field report.
        </p>

        <div style={{ display: "flex", gap: "2vw", marginTop: "5vh" }}>
          {[
            { num: "01", label: "Log In" },
            { num: "02", label: "Create a Post" },
            { num: "03", label: "Share Your Report" },
          ].map(step => (
            <div key={step.num} style={{ display: "flex", alignItems: "center", gap: "1vw", background: "rgba(255,255,255,0.12)", borderRadius: 50, padding: "0.8vh 1.8vw" }}>
              <span style={{ color: "#93C5FD", fontSize: "1vw", fontWeight: 800 }}>{step.num}</span>
              <span style={{ color: "#FFFFFF", fontSize: "1.1vw", fontWeight: 600 }}>{step.label}</span>
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
