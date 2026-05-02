export default function Slide05ExportReports() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        backgroundColor: "#0D0D0D",
        fontFamily: "'DM Mono', Courier, monospace",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "6vh 6vw",
        boxSizing: "border-box",
      }}
    >
      <div style={{ position: "absolute", top: "4vh", right: "6vw", fontSize: "12vw", color: "#1E1E1E", fontWeight: 400, lineHeight: 1, zIndex: 0 }}>
        05
      </div>

      <div style={{ width: "100%", height: "2px", backgroundColor: "#FAFAFA", zIndex: 1 }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "3vh", zIndex: 1 }}>
        <div style={{ color: "#FAFAFA", fontSize: "1.2vw", fontWeight: 500, letterSpacing: "0.05em" }}>
          [sentconnect.org]
        </div>
        <div style={{ color: "#888888", fontSize: "1vw", fontWeight: 400 }}>
          DATE: 2026
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 1 }}>
        <div style={{ color: "#0268CE", fontSize: "1vw", fontWeight: 500, marginBottom: "1.5vh", letterSpacing: "0.12em" }}>
          FEATURE // PDF EXPORT
        </div>
        <h2
          style={{
            color: "#FAFAFA",
            fontSize: "5vw",
            margin: "0 0 8vh 0",
            fontWeight: 500,
            lineHeight: 1.05,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            maxWidth: "60vw",
          }}
        >
          EXPORT AS REPORT
        </h2>

        <div style={{ display: "flex", gap: "8vw" }}>
          <div>
            <div style={{ color: "#888888", fontSize: "1vw", marginBottom: "1.2vh", letterSpacing: "0.1em" }}>OUTPUT FORMAT</div>
            <div style={{ color: "#FAFAFA", fontSize: "3.5vw", fontWeight: 500, lineHeight: 1 }}>A4 PDF</div>
          </div>
          <div>
            <div style={{ color: "#888888", fontSize: "1vw", marginBottom: "1.2vh", letterSpacing: "0.1em" }}>ACCESS</div>
            <div style={{ color: "#FAFAFA", fontSize: "3.5vw", fontWeight: 500, lineHeight: 1 }}>ADMIN+</div>
          </div>
          <div>
            <div style={{ color: "#888888", fontSize: "1vw", marginBottom: "1.2vh", letterSpacing: "0.1em" }}>BRANDING</div>
            <div style={{ color: "#FAFAFA", fontSize: "3.5vw", fontWeight: 500, lineHeight: 1 }}>ORG LOGO</div>
          </div>
        </div>

        <div style={{ marginTop: "7vh", display: "flex", flexDirection: "column", gap: "2.5vh" }}>
          <div style={{ color: "#AAAAAA", fontSize: "1.5vw", fontWeight: 400 }}>
            {">"} Post text, photos, and captions included
          </div>
          <div style={{ color: "#AAAAAA", fontSize: "1.5vw", fontWeight: 400 }}>
            {">"} Author name, location, and date
          </div>
          <div style={{ color: "#AAAAAA", fontSize: "1.5vw", fontWeight: 400 }}>
            {">"} Org logo pulled from platform settings automatically
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "3vh", zIndex: 1 }}>
        <div style={{ color: "#888888", fontSize: "1vw", fontWeight: 400, letterSpacing: "0.05em" }}>
          PLATFORM: Holtek Solutions LLC
        </div>
      </div>

      <div style={{ width: "100%", height: "2px", backgroundColor: "#FAFAFA", zIndex: 1 }} />
    </div>
  );
}
