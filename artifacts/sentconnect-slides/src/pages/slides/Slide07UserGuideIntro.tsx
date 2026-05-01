export default function Slide07UserGuideIntro() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        backgroundColor: "#0047A8",
        fontFamily: "'DM Mono', Courier, monospace",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "6vh 6vw",
        boxSizing: "border-box",
      }}
    >
      <div style={{ position: "absolute", top: "4vh", right: "6vw", fontSize: "12vw", color: "rgba(255,255,255,0.08)", fontWeight: 400, lineHeight: 1, zIndex: 0 }}>
        07
      </div>

      <div style={{ width: "100%", height: "2px", backgroundColor: "#FFFFFF", zIndex: 1 }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "3vh", zIndex: 1 }}>
        <div style={{ color: "#FFFFFF", fontSize: "1.2vw", fontWeight: 500, letterSpacing: "0.05em" }}>
          [sentconnect.org]
        </div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "1vw", fontWeight: 400 }}>
          DATE: 2026
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", zIndex: 1 }}>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "1vw", fontWeight: 500, marginBottom: "2vh", letterSpacing: "0.12em" }}>
          SECTION 02 // NEW USER GUIDE
        </div>
        <h2
          style={{
            color: "#FFFFFF",
            fontSize: "6vw",
            margin: "0 0 5vh 0",
            fontWeight: 500,
            lineHeight: 1.05,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            maxWidth: "70vw",
          }}
        >
          GETTING STARTED
        </h2>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.8vw", fontWeight: 400, lineHeight: 1.6, margin: 0, maxWidth: "50vw" }}>
          Step-by-step instructions for new organization members — from first login to sharing your first field report.
        </p>
      </div>

      <div style={{ marginBottom: "3vh", zIndex: 1 }}>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "1vw", fontWeight: 400, letterSpacing: "0.05em" }}>
          PLATFORM: Holtek Solutions LLC
        </div>
      </div>

      <div style={{ width: "100%", height: "2px", backgroundColor: "#FFFFFF", zIndex: 1 }} />
    </div>
  );
}
