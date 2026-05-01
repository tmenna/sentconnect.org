export default function Slide03FeedFeatures() {
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
        03
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
          FEATURE // MISSION FEED
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
          PRIVATE SOCIAL FEED
        </h2>

        <div style={{ display: "flex", gap: "6vw", width: "100%" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3vh" }}>
            <div style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
              <div style={{ color: "#0047A8", fontSize: "1.3vw", fontWeight: 600, minWidth: "2.5vw", marginTop: "0.1vh" }}>{">"}</div>
              <div>
                <div style={{ color: "#0D0D0D", fontSize: "1.4vw", fontWeight: 500, marginBottom: "0.5vh" }}>Org-scoped timeline</div>
                <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.6 }}>Posts visible only to members of your organization. No cross-org data leakage.</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
              <div style={{ color: "#0047A8", fontSize: "1.3vw", fontWeight: 600, minWidth: "2.5vw", marginTop: "0.1vh" }}>{">"}</div>
              <div>
                <div style={{ color: "#0D0D0D", fontSize: "1.4vw", fontWeight: 500, marginBottom: "0.5vh" }}>Photo and video posts</div>
                <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.6 }}>Attach multiple photos or videos. Captions per media item supported.</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
              <div style={{ color: "#0047A8", fontSize: "1.3vw", fontWeight: 600, minWidth: "2.5vw", marginTop: "0.1vh" }}>{">"}</div>
              <div>
                <div style={{ color: "#0D0D0D", fontSize: "1.4vw", fontWeight: 500, marginBottom: "0.5vh" }}>Mission Moment badge</div>
                <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.6 }}>Admins can highlight key field reports with a special designation visible on the feed.</div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3vh" }}>
            <div style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
              <div style={{ color: "#0047A8", fontSize: "1.3vw", fontWeight: 600, minWidth: "2.5vw", marginTop: "0.1vh" }}>{">"}</div>
              <div>
                <div style={{ color: "#0D0D0D", fontSize: "1.4vw", fontWeight: 500, marginBottom: "0.5vh" }}>Likes and comments</div>
                <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.6 }}>Members engage with posts through reactions and threaded comments.</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
              <div style={{ color: "#0047A8", fontSize: "1.3vw", fontWeight: 600, minWidth: "2.5vw", marginTop: "0.1vh" }}>{">"}</div>
              <div>
                <div style={{ color: "#0D0D0D", fontSize: "1.4vw", fontWeight: 500, marginBottom: "0.5vh" }}>People reached tracking</div>
                <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.6 }}>Each post can record an impact number shown prominently on the card.</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
              <div style={{ color: "#0047A8", fontSize: "1.3vw", fontWeight: 600, minWidth: "2.5vw", marginTop: "0.1vh" }}>{">"}</div>
              <div>
                <div style={{ color: "#0D0D0D", fontSize: "1.4vw", fontWeight: 500, marginBottom: "0.5vh" }}>Location tagging</div>
                <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.6 }}>Posts include a location field displayed alongside author name and post date.</div>
              </div>
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
