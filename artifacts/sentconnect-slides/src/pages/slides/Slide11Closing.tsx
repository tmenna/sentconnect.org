export default function Slide11Closing() {
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
        11
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

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", zIndex: 1 }}>
        <div style={{ color: "#0047A8", fontSize: "1vw", fontWeight: 500, marginBottom: "2vh", letterSpacing: "0.12em" }}>
          END // RESOURCES
        </div>
        <h2
          style={{
            color: "#0D0D0D",
            fontSize: "5.5vw",
            margin: "0 0 8vh 0",
            fontWeight: 500,
            lineHeight: 1.05,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
          }}
        >
          SENTCONNECT
        </h2>

        <div style={{ display: "flex", gap: "8vw" }}>
          <div>
            <div style={{ color: "#555555", fontSize: "1vw", marginBottom: "1.2vh", letterSpacing: "0.1em" }}>PLATFORM</div>
            <div style={{ color: "#0D0D0D", fontSize: "1.8vw", fontWeight: 500 }}>sentconnect.org</div>
          </div>
          <div>
            <div style={{ color: "#555555", fontSize: "1vw", marginBottom: "1.2vh", letterSpacing: "0.1em" }}>YOUR PORTAL</div>
            <div style={{ color: "#0047A8", fontSize: "1.8vw", fontWeight: 500 }}>[org].sentconnect.org/login</div>
          </div>
          <div>
            <div style={{ color: "#555555", fontSize: "1vw", marginBottom: "1.2vh", letterSpacing: "0.1em" }}>SUPPORT</div>
            <div style={{ color: "#0D0D0D", fontSize: "1.8vw", fontWeight: 500 }}>Contact your org admin</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3vh", zIndex: 1 }}>
        <div style={{ color: "#555555", fontSize: "1vw", fontWeight: 400, letterSpacing: "0.05em" }}>
          PLATFORM: Holtek Solutions LLC
        </div>
        <div style={{ color: "#0047A8", fontSize: "1vw", fontWeight: 500, letterSpacing: "0.08em" }}>
          Private missionary social feed
        </div>
      </div>

      <div style={{ width: "100%", height: "2px", backgroundColor: "#0D0D0D", zIndex: 1 }} />
    </div>
  );
}
