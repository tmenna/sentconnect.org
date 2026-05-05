export default function Slide05ExportReports() {
  const items = [
    { icon: "🖼️", label: "Photos included", desc: "All post images appear full-width in the PDF." },
    { icon: "👤", label: "Author & date", desc: "Missionary name and post date printed clearly." },
    { icon: "📍", label: "Location", desc: "Field location is shown when tagged on the post." },
    { icon: "📄", label: "A4 format", desc: "Print-ready layout — works on any printer." },
  ];

  return (
    <div
      className="w-screen h-screen overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #3D0066 0%, #5A0097 60%, #8705FA 100%)",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: "-12vh", right: "-8vw", width: "45vw", height: "45vw", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2.5vh 5vw", background: "rgba(0,0,0,0.2)", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          <div style={{ width: "2.2vw", height: "2.2vw", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "0.9vw", height: "0.9vw", borderRadius: "50%", background: "#FFFFFF" }} />
          </div>
          <span style={{ color: "#FFFFFF", fontSize: "1.3vw", fontWeight: 700 }}>SentConnect</span>
        </div>
        <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.3vw", fontWeight: 600 }}>Export as Report</span>
        <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "1vw", fontWeight: 500 }}>5 of 11</span>
      </div>

      <div style={{ flex: 1, display: "flex", gap: "5vw", padding: "4vh 6vw 3vh", alignItems: "center", zIndex: 1 }}>
        <div style={{ flex: "0 0 45%" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6vw", background: "rgba(255,255,255,0.12)", borderRadius: 50, padding: "0.5vh 1.4vw", marginBottom: "3vh" }}>
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.95vw", fontWeight: 600, letterSpacing: "0.06em" }}>FEATURE · PDF EXPORT</span>
          </div>
          <h2 style={{ color: "#FFFFFF", fontSize: "3.8vw", fontWeight: 800, margin: "0 0 3vh 0", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Share Offline as a PDF Report
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.3vw", lineHeight: 1.65, margin: "0 0 3.5vh 0" }}>
            Admins and owners can export any post as a branded, printable PDF — perfect for newsletters, church bulletins, or email attachments.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.8vw", background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "1.2vh 1.8vw", border: "1px solid rgba(255,255,255,0.15)" }}>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9vw", fontWeight: 600 }}>ACCESS</span>
            <span style={{ color: "#FFFFFF", fontSize: "1.1vw", fontWeight: 600 }}>Admins & Owners only</span>
          </div>
        </div>

        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2vh 2vw" }}>
          {items.map(item => (
            <div key={item.label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "2.5vh 2vw", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
              <div style={{ fontSize: "2.5vh", marginBottom: "1.5vh" }}>{item.icon}</div>
              <div style={{ color: "#FFFFFF", fontSize: "1.2vw", fontWeight: 700, marginBottom: "0.8vh" }}>{item.label}</div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.05vw", lineHeight: 1.55 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.8vh 5vw", background: "rgba(0,0,0,0.25)", zIndex: 1 }}>
        <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.95vw", fontWeight: 500 }}>24/7 Platform Contact: Teki Menna: 951-551-4528</span>
        <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.95vw" }}>www.sentconnect.org</span>
      </div>
    </div>
  );
}
