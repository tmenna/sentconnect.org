export default function Slide02CoreFeatures() {
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
        02
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

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", zIndex: 1, marginTop: "5vh" }}>
        <div style={{ color: "#0047A8", fontSize: "1vw", fontWeight: 500, marginBottom: "1.5vh", letterSpacing: "0.12em" }}>
          SECTION 01 // CORE FEATURES
        </div>
        <h2
          style={{
            color: "#0D0D0D",
            fontSize: "4vw",
            margin: "0 0 5vh 0",
            fontWeight: 500,
            lineHeight: 1.1,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
          }}
        >
          PLATFORM OVERVIEW
        </h2>

        <div style={{ display: "flex", gap: "3vw", width: "100%" }}>
          <div style={{ flex: 1, borderTop: "2px solid #0D0D0D", paddingTop: "2.5vh" }}>
            <div style={{ color: "#0047A8", fontSize: "1vw", fontWeight: 500, marginBottom: "1.5vh", letterSpacing: "0.1em" }}>
              MISSION FEED
            </div>
            <div style={{ color: "#0D0D0D", fontSize: "1.5vw", fontWeight: 500, marginBottom: "1.5vh", lineHeight: 1.2 }}>
              Private Social Feed
            </div>
            <div style={{ color: "#555555", fontSize: "1.3vw", lineHeight: 1.6 }}>
              Org-scoped timeline where missionaries post updates, photos, and prayer requests. Visible only to invited members.
            </div>
          </div>

          <div style={{ flex: 1, borderTop: "2px solid #0D0D0D", paddingTop: "2.5vh" }}>
            <div style={{ color: "#0047A8", fontSize: "1vw", fontWeight: 500, marginBottom: "1.5vh", letterSpacing: "0.1em" }}>
              MULTI-TENANT
            </div>
            <div style={{ color: "#0D0D0D", fontSize: "1.5vw", fontWeight: 500, marginBottom: "1.5vh", lineHeight: 1.2 }}>
              Per-Org Portals
            </div>
            <div style={{ color: "#555555", fontSize: "1.3vw", lineHeight: 1.6 }}>
              Each organization gets its own subdomain portal. Data is fully isolated. Admins manage their own users and content.
            </div>
          </div>

          <div style={{ flex: 1, borderTop: "2px solid #0D0D0D", paddingTop: "2.5vh" }}>
            <div style={{ color: "#0047A8", fontSize: "1vw", fontWeight: 500, marginBottom: "1.5vh", letterSpacing: "0.1em" }}>
              EXPORT
            </div>
            <div style={{ color: "#0D0D0D", fontSize: "1.5vw", fontWeight: 500, marginBottom: "1.5vh", lineHeight: 1.2 }}>
              PDF Reports
            </div>
            <div style={{ color: "#555555", fontSize: "1.3vw", lineHeight: 1.6 }}>
              Admins export any post as a branded A4 PDF report with photos, stats, author, and location included.
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "3vh", zIndex: 1 }}>
        <div style={{ color: "#555555", fontSize: "1vw", fontWeight: 400, letterSpacing: "0.05em" }}>
          PLATFORM: Holtek Solutions LLC
        </div>
      </div>

      <div style={{ width: "100%", height: "2px", backgroundColor: "#0D0D0D", zIndex: 1 }} />
    </div>
  );
}
