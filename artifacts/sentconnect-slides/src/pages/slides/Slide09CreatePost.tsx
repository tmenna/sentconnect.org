import logoWhite from "../../assets/logo-white.png";

export default function Slide09CreatePost() {
  const steps = [
    {
      num: 1,
      icon: "✏️",
      title: "Tap the Compose button",
      desc: "Look for the compose button at the top of your Mission Feed. It's always visible when you're logged in.",
    },
    {
      num: 2,
      icon: "📝",
      title: "Write your update",
      desc: "Type your field report, story, or prayer request. Add photos or videos from your device if you'd like.",
    },
    {
      num: 3,
      icon: "📍",
      title: "Add optional details",
      desc: "Tag a location, mark it as a prayer request, or — if you're an admin — flag it as a Mission Moment.",
    },
    {
      num: 4,
      icon: "🚀",
      title: "Tap Post to publish",
      desc: "Your update is instantly visible to all members of your organization's private feed.",
    },
  ];

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
          <img src={logoWhite} alt="SentConnect" style={{ height: "3.5vh", display: "block", filter: "brightness(0)" }} />
        </div>
        <span style={{ color: "#1E293B", fontSize: "1.3vw", fontWeight: 600 }}>Creating a Post</span>
        <span style={{ color: "#94A3B8", fontSize: "1vw", fontWeight: 500 }}>9 of 11</span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "3.5vh 5vw 3vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "2vh" }}>
          <div style={{ width: "0.3vw", height: "3vh", background: "#8705FA", borderRadius: 2 }} />
          <span style={{ color: "#8705FA", fontSize: "1vw", fontWeight: 700, letterSpacing: "0.08em" }}>GUIDE STEP 02 · POSTING</span>
        </div>
        <h2 style={{ color: "#0F172A", fontSize: "3.4vw", fontWeight: 800, margin: "0 0 3.5vh 0", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          How to Create a Post
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2vw", flex: 1 }}>
          {steps.map((step, idx) => (
            <div key={step.num} style={{ position: "relative" }}>
              {idx < steps.length - 1 && (
                <div style={{ position: "absolute", top: "3.5vh", left: "calc(100% + 0.2vw)", width: "1.6vw", height: "2px", background: "#D8B4FE", zIndex: 0, pointerEvents: "none" }} />
              )}
              <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "3vh 2vw", border: "1px solid #EDE9FE", height: "100%", boxSizing: "border-box", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "1.5vh", position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1.2vw" }}>
                  <div style={{ width: "4.5vh", height: "4.5vh", minWidth: "4.5vh", borderRadius: "50%", background: "#8705FA", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4vw", fontWeight: 800 }}>
                    {step.num}
                  </div>
                  <span style={{ fontSize: "2.8vh" }}>{step.icon}</span>
                </div>
                <div style={{ color: "#0F172A", fontSize: "1.25vw", fontWeight: 700, lineHeight: 1.25 }}>{step.title}</div>
                <div style={{ color: "#64748B", fontSize: "1.08vw", lineHeight: 1.6, flex: 1 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.8vh 5vw", background: "#5A0097" }}>
        <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95vw", fontWeight: 500 }}>Need help? Contact Support at +1-951-551-4528 (Call/WhatsApp)</span>
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.95vw" }}>www.sentconnect.org</span>
      </div>
    </div>
  );
}
