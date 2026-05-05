export default function Slide10Sharing() {
  return (
    <div
      className="w-screen h-screen overflow-hidden"
      style={{
        background: "#F9F5FF",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2.5vh 5vw", background: "#FFFFFF", borderBottom: "1px solid #EDE9FE" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          <div style={{ width: "2.2vw", height: "2.2vw", borderRadius: "50%", background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "0.9vw", height: "0.9vw", borderRadius: "50%", background: "#8705FA" }} />
          </div>
          <span style={{ color: "#5A0097", fontSize: "1.3vw", fontWeight: 700 }}>SentConnect</span>
        </div>
        <span style={{ color: "#1E293B", fontSize: "1.3vw", fontWeight: 600 }}>Sharing a Post</span>
        <span style={{ color: "#94A3B8", fontSize: "1vw", fontWeight: 500 }}>10 of 11</span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "3.5vh 5vw 3vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "2vh" }}>
          <div style={{ width: "0.3vw", height: "3vh", background: "#8705FA", borderRadius: 2 }} />
          <span style={{ color: "#8705FA", fontSize: "1vw", fontWeight: 700, letterSpacing: "0.08em" }}>GUIDE STEP 03 · SHARING</span>
        </div>
        <h2 style={{ color: "#0F172A", fontSize: "3.4vw", fontWeight: 800, margin: "0 0 3.5vh 0", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Two Ways to Share
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5vw", flex: 1 }}>
          <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "3.5vh 3vw", border: "1px solid #D8B4FE", boxShadow: "0 4px 16px rgba(135,5,250,0.08)", display: "flex", flexDirection: "column", gap: "2vh" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.2vw" }}>
              <div style={{ width: "5vh", height: "5vh", minWidth: "5vh", borderRadius: 12, background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5vh" }}>🔗</div>
              <div>
                <div style={{ color: "#8705FA", fontSize: "0.85vw", fontWeight: 700, letterSpacing: "0.07em" }}>ONLINE</div>
                <div style={{ color: "#0F172A", fontSize: "1.4vw", fontWeight: 700 }}>Public Link</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
              {[
                "Open any post and tap the Share button in the action bar.",
                "A public link is copied to your clipboard automatically.",
                "Paste it in an email, WhatsApp, or social media — anyone can read it, no login needed.",
              ].map((text, i) => (
                <div key={i} style={{ display: "flex", gap: "1vw", alignItems: "flex-start" }}>
                  <div style={{ width: "2.2vh", height: "2.2vh", minWidth: "2.2vh", borderRadius: "50%", background: "#F3E8FF", color: "#8705FA", fontSize: "0.8vw", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginTop: "0.3vh" }}>{i + 1}</div>
                  <span style={{ color: "#475569", fontSize: "1.1vw", lineHeight: 1.55 }}>{text}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#F3E8FF", borderRadius: 10, padding: "1.2vh 1.5vw", marginTop: "auto" }}>
              <div style={{ color: "#94A3B8", fontSize: "0.85vw", fontWeight: 600, marginBottom: "0.5vh" }}>LINK FORMAT</div>
              <div style={{ color: "#5A0097", fontSize: "1.1vw", fontWeight: 600 }}>[org].sentconnect.org/post/[id]</div>
            </div>
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "3.5vh 3vw", border: "1px solid #E2E8F0", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "2vh" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.2vw" }}>
              <div style={{ width: "5vh", height: "5vh", minWidth: "5vh", borderRadius: 12, background: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5vh" }}>📄</div>
              <div>
                <div style={{ color: "#7C3AED", fontSize: "0.85vw", fontWeight: 700, letterSpacing: "0.07em" }}>OFFLINE</div>
                <div style={{ color: "#0F172A", fontSize: "1.4vw", fontWeight: 700 }}>PDF Export</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
              {[
                "Admins see an Export button on any post. Tap it to open the report preview.",
                "Review the preview — it shows post text, photos, author, location, and date.",
                "Tap Download PDF to save. Print or attach to email for offline sharing.",
              ].map((text, i) => (
                <div key={i} style={{ display: "flex", gap: "1vw", alignItems: "flex-start" }}>
                  <div style={{ width: "2.2vh", height: "2.2vh", minWidth: "2.2vh", borderRadius: "50%", background: "#F5F3FF", color: "#7C3AED", fontSize: "0.8vw", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginTop: "0.3vh" }}>{i + 1}</div>
                  <span style={{ color: "#475569", fontSize: "1.1vw", lineHeight: 1.55 }}>{text}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#F5F3FF", borderRadius: 10, padding: "1.2vh 1.5vw", marginTop: "auto" }}>
              <div style={{ color: "#94A3B8", fontSize: "0.85vw", fontWeight: 600, marginBottom: "0.5vh" }}>FORMAT</div>
              <div style={{ color: "#7C3AED", fontSize: "1.1vw", fontWeight: 600 }}>A4 PDF — print-ready</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.8vh 5vw", background: "#5A0097" }}>
        <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95vw", fontWeight: 500 }}>24/7 Platform Contact: Teki Menna: 951-551-4528</span>
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.95vw" }}>www.sentconnect.org</span>
      </div>
    </div>
  );
}
