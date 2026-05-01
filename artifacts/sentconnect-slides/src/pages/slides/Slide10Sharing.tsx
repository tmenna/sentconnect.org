export default function Slide10Sharing() {
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
        10
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
          GUIDE STEP 03 // SHARING
        </div>
        <h2
          style={{
            color: "#0D0D0D",
            fontSize: "4vw",
            margin: "0 0 4.5vh 0",
            fontWeight: 500,
            lineHeight: 1.1,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
          }}
        >
          SHARING A POST
        </h2>

        <div style={{ display: "flex", gap: "4vw" }}>
          <div style={{ flex: 1, borderTop: "3px solid #0047A8", paddingTop: "2.5vh" }}>
            <div style={{ color: "#0047A8", fontSize: "1vw", fontWeight: 500, marginBottom: "2vh", letterSpacing: "0.1em" }}>ONLINE — PUBLIC LINK</div>
            <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.7, marginBottom: "2vh" }}>
              {">"} Open any post and click the Share button in the action bar below the post.
            </div>
            <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.7, marginBottom: "2vh" }}>
              {">"} A public link is copied to your clipboard — this link works for anyone even without a SentConnect account.
            </div>
            <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.7 }}>
              {">"} Paste the link in an email, WhatsApp, or any social platform to share the post publicly.
            </div>
            <div style={{ marginTop: "3vh", backgroundColor: "#F0F4FF", padding: "1.5vh 1.5vw" }}>
              <div style={{ color: "#555555", fontSize: "1vw", letterSpacing: "0.08em", marginBottom: "0.5vh" }}>LINK FORMAT</div>
              <div style={{ color: "#0047A8", fontSize: "1.2vw", fontWeight: 500 }}>[org].sentconnect.org/post/[id]</div>
            </div>
          </div>

          <div style={{ flex: 1, borderTop: "3px solid #0D0D0D", paddingTop: "2.5vh" }}>
            <div style={{ color: "#555555", fontSize: "1vw", fontWeight: 500, marginBottom: "2vh", letterSpacing: "0.1em" }}>OFFLINE — PDF EXPORT</div>
            <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.7, marginBottom: "2vh" }}>
              {">"} Admins see an "Export" button in the post action bar. Click it to open the report preview.
            </div>
            <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.7, marginBottom: "2vh" }}>
              {">"} Review the preview — it shows org logo, post text, photos, author, location, and stats.
            </div>
            <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.7 }}>
              {">"} Click "Download PDF" to save an A4 report to your device. Print or attach to an email for offline sharing.
            </div>
            <div style={{ marginTop: "3vh", backgroundColor: "#F5F5F5", padding: "1.5vh 1.5vw" }}>
              <div style={{ color: "#555555", fontSize: "1vw", letterSpacing: "0.08em", marginBottom: "0.5vh" }}>OFFLINE FORMAT</div>
              <div style={{ color: "#0D0D0D", fontSize: "1.2vw", fontWeight: 500 }}>A4 PDF — printable report</div>
            </div>
          </div>

          <div style={{ flex: 1, borderTop: "3px solid #E0E0E0", paddingTop: "2.5vh" }}>
            <div style={{ color: "#888888", fontSize: "1vw", fontWeight: 500, marginBottom: "2vh", letterSpacing: "0.1em" }}>WITHIN THE FEED</div>
            <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.7, marginBottom: "2vh" }}>
              {">"} Use the Share button to copy the link and paste it into any channel accessible to org members.
            </div>
            <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.7, marginBottom: "2vh" }}>
              {">"} Org members who receive the link are taken directly to that post's public page — no login required to read.
            </div>
            <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.7 }}>
              {">"} Comments and likes are only available to logged-in org members.
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
