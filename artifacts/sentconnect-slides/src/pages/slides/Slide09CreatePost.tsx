export default function Slide09CreatePost() {
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
        09
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
          GUIDE STEP 02 // POSTING
        </div>
        <h2
          style={{
            color: "#0D0D0D",
            fontSize: "4vw",
            margin: "0 0 4vh 0",
            fontWeight: 500,
            lineHeight: 1.1,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
          }}
        >
          CREATING A POST
        </h2>

        <div style={{ display: "flex", gap: "5vw" }}>
          <div style={{ flex: 1.4 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2.5vh" }}>
              <div style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
                <div style={{ minWidth: "3vw", height: "3vw", backgroundColor: "#0047A8", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: "1.3vw", fontWeight: 600, flexShrink: 0 }}>
                  1
                </div>
                <div>
                  <div style={{ color: "#0D0D0D", fontSize: "1.4vw", fontWeight: 500, marginBottom: "0.3vh" }}>Click "New Post" on the feed</div>
                  <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.5 }}>The compose button is at the top of the Mission Feed timeline.</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
                <div style={{ minWidth: "3vw", height: "3vw", backgroundColor: "#0047A8", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: "1.3vw", fontWeight: 600, flexShrink: 0 }}>
                  2
                </div>
                <div>
                  <div style={{ color: "#0D0D0D", fontSize: "1.4vw", fontWeight: 500, marginBottom: "0.3vh" }}>Write your update</div>
                  <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.5 }}>Type your field report, story, or prayer request in the text area.</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
                <div style={{ minWidth: "3vw", height: "3vw", backgroundColor: "#0047A8", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: "1.3vw", fontWeight: 600, flexShrink: 0 }}>
                  3
                </div>
                <div>
                  <div style={{ color: "#0D0D0D", fontSize: "1.4vw", fontWeight: 500, marginBottom: "0.3vh" }}>Add photos or video</div>
                  <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.5 }}>Use the attachment button to upload images or a video clip from your device.</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
                <div style={{ minWidth: "3vw", height: "3vw", backgroundColor: "#0047A8", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: "1.3vw", fontWeight: 600, flexShrink: 0 }}>
                  4
                </div>
                <div>
                  <div style={{ color: "#0D0D0D", fontSize: "1.4vw", fontWeight: 500, marginBottom: "0.3vh" }}>Fill optional fields, then submit</div>
                  <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.5 }}>Add location and people reached count, then press "Post" to publish to the feed.</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0" }}>
            <div style={{ borderTop: "2px solid #E0E0E0", paddingTop: "2vh", marginBottom: "2vh" }}>
              <div style={{ color: "#555555", fontSize: "1vw", letterSpacing: "0.1em", marginBottom: "0.6vh" }}>TIPS</div>
              <div style={{ color: "#0D0D0D", fontSize: "1.3vw", lineHeight: 1.6 }}>Posts appear immediately on the org feed for all members to see.</div>
            </div>
            <div style={{ borderTop: "2px solid #E0E0E0", paddingTop: "2vh", marginBottom: "2vh" }}>
              <div style={{ color: "#555555", fontSize: "1vw", letterSpacing: "0.1em", marginBottom: "0.6vh" }}>EDITING</div>
              <div style={{ color: "#0D0D0D", fontSize: "1.3vw", lineHeight: 1.6 }}>Use the three-dot menu on your post to edit or delete it after publishing.</div>
            </div>
            <div style={{ borderTop: "2px solid #E0E0E0", paddingTop: "2vh" }}>
              <div style={{ color: "#555555", fontSize: "1vw", letterSpacing: "0.1em", marginBottom: "0.6vh" }}>PRAYER TAG</div>
              <div style={{ color: "#0D0D0D", fontSize: "1.3vw", lineHeight: 1.6 }}>Toggle the prayer request flag to display a distinct badge on your post card.</div>
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
