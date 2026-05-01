export default function Slide04PostComposer() {
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
        04
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
          FEATURE // POST COMPOSER
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
          CREATING POSTS
        </h2>

        <div style={{ display: "flex", gap: "5vw" }}>
          <div style={{ flex: 1 }}>
            <div style={{ borderLeft: "3px solid #0047A8", paddingLeft: "2vw", marginBottom: "3.5vh" }}>
              <div style={{ color: "#555555", fontSize: "1vw", marginBottom: "0.6vh", letterSpacing: "0.1em" }}>FIELD</div>
              <div style={{ color: "#0D0D0D", fontSize: "1.5vw", fontWeight: 500, marginBottom: "0.6vh" }}>Update text</div>
              <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.6 }}>Write your field report, prayer request, or story. No character limit.</div>
            </div>
            <div style={{ borderLeft: "3px solid #0047A8", paddingLeft: "2vw", marginBottom: "3.5vh" }}>
              <div style={{ color: "#555555", fontSize: "1vw", marginBottom: "0.6vh", letterSpacing: "0.1em" }}>FIELD</div>
              <div style={{ color: "#0D0D0D", fontSize: "1.5vw", fontWeight: 500, marginBottom: "0.6vh" }}>Photos & videos</div>
              <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.6 }}>Upload multiple images or a video clip alongside the post text.</div>
            </div>
            <div style={{ borderLeft: "3px solid #0047A8", paddingLeft: "2vw" }}>
              <div style={{ color: "#555555", fontSize: "1vw", marginBottom: "0.6vh", letterSpacing: "0.1em" }}>FIELD</div>
              <div style={{ color: "#0D0D0D", fontSize: "1.5vw", fontWeight: 500, marginBottom: "0.6vh" }}>Location</div>
              <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.6 }}>Add a city or region to show where the ministry work took place.</div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ borderLeft: "3px solid #0D0D0D", paddingLeft: "2vw", marginBottom: "3.5vh" }}>
              <div style={{ color: "#555555", fontSize: "1vw", marginBottom: "0.6vh", letterSpacing: "0.1em" }}>FIELD</div>
              <div style={{ color: "#0D0D0D", fontSize: "1.5vw", fontWeight: 500, marginBottom: "0.6vh" }}>People reached</div>
              <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.6 }}>Record the number of people impacted. Displayed as a stat on the post card.</div>
            </div>
            <div style={{ borderLeft: "3px solid #0D0D0D", paddingLeft: "2vw", marginBottom: "3.5vh" }}>
              <div style={{ color: "#555555", fontSize: "1vw", marginBottom: "0.6vh", letterSpacing: "0.1em" }}>FIELD</div>
              <div style={{ color: "#0D0D0D", fontSize: "1.5vw", fontWeight: 500, marginBottom: "0.6vh" }}>Prayer request</div>
              <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.6 }}>Tag the post as a prayer request — shown with a distinct visual indicator on the feed.</div>
            </div>
            <div style={{ borderLeft: "3px solid #0D0D0D", paddingLeft: "2vw" }}>
              <div style={{ color: "#555555", fontSize: "1vw", marginBottom: "0.6vh", letterSpacing: "0.1em" }}>ADMIN ONLY</div>
              <div style={{ color: "#0D0D0D", fontSize: "1.5vw", fontWeight: 500, marginBottom: "0.6vh" }}>Mission Moment</div>
              <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.6 }}>Designate the post as a Mission Moment highlight visible to the full organization.</div>
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
