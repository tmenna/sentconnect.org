export default function Slide01Title() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        backgroundColor: "#FAFAFA",
        fontFamily: "'DM Mono', Courier, monospace",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "6vh 6vw",
        boxSizing: "border-box",
      }}
    >
      <div style={{ position: "absolute", top: "4vh", right: "6vw", fontSize: "12vw", color: "#E8E8E8", fontWeight: 400, lineHeight: 1, zIndex: 0 }}>
        01
      </div>

      <div style={{ width: "100%", height: "2px", backgroundColor: "#0D0D0D", zIndex: 1 }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "3vh", zIndex: 1 }}>
        <div style={{ color: "#0D0D0D", fontSize: "1.2vw", fontWeight: 500, letterSpacing: "0.05em" }}>
          [sentconnect.org]
        </div>
        <div style={{ color: "#555555", fontSize: "1vw", fontWeight: 400 }}>
          DATE: 2026
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", zIndex: 1, marginTop: "6vh" }}>
        <div style={{ color: "#0047A8", fontSize: "1vw", fontWeight: 500, marginBottom: "2vh", letterSpacing: "0.12em" }}>
          PLATFORM // GUIDE
        </div>
        <h1
          style={{
            color: "#0D0D0D",
            fontSize: "6.5vw",
            margin: "0 0 5vh 0",
            fontWeight: 500,
            lineHeight: 1.05,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            maxWidth: "72vw",
          }}
        >
          SENTCONNECT
        </h1>
        <p
          style={{
            color: "#555555",
            fontSize: "1.6vw",
            margin: 0,
            fontWeight: 400,
            lineHeight: 1.6,
            maxWidth: "52vw",
          }}
        >
          {">"} Core features and platform overview
        </p>
        <p
          style={{
            color: "#555555",
            fontSize: "1.6vw",
            margin: "0.6vh 0 0 0",
            fontWeight: 400,
            lineHeight: 1.6,
            maxWidth: "52vw",
          }}
        >
          {">"} New user navigation guide
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3vh", zIndex: 1 }}>
        <div style={{ color: "#555555", fontSize: "1vw", fontWeight: 400, letterSpacing: "0.05em" }}>
          PLATFORM: Holtek Solutions LLC
        </div>
        <div style={{ color: "#0047A8", fontSize: "1vw", fontWeight: 500, letterSpacing: "0.08em" }}>
          sentconnect.org
        </div>
      </div>

      <div style={{ width: "100%", height: "2px", backgroundColor: "#0D0D0D", zIndex: 1 }} />
    </div>
  );
}
