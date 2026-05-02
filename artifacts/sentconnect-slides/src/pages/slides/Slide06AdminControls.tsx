export default function Slide06AdminControls() {
  const roles = [
    { role: "Owner", color: "#0047A8", bg: "#EFF6FF", perms: "Full control including billing and org settings" },
    { role: "Admin", color: "#0D9488", bg: "#F0FDFA", perms: "User management, content moderation, PDF export" },
    { role: "Member", color: "#7C3AED", bg: "#F5F3FF", perms: "Post, comment, like, and read the feed" },
  ];

  return (
    <div
      className="w-screen h-screen overflow-hidden"
      style={{
        background: "#F4F7FF",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2.5vh 5vw", background: "#FFFFFF", borderBottom: "1px solid #E8EEF8" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          <div style={{ width: "2.2vw", height: "2.2vw", borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "0.9vw", height: "0.9vw", borderRadius: "50%", background: "#0268CE" }} />
          </div>
          <span style={{ color: "#0047A8", fontSize: "1.3vw", fontWeight: 700 }}>SentConnect</span>
        </div>
        <span style={{ color: "#1E293B", fontSize: "1.3vw", fontWeight: 600 }}>Admin Controls</span>
        <span style={{ color: "#94A3B8", fontSize: "1vw", fontWeight: 500 }}>6 of 11</span>
      </div>

      <div style={{ flex: 1, display: "flex", gap: "4vw", padding: "3.5vh 5vw 3vh", alignItems: "stretch" }}>
        <div style={{ flex: "0 0 42%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "2.5vh" }}>
            <div style={{ width: "0.3vw", height: "3vh", background: "#0268CE", borderRadius: 2 }} />
            <span style={{ color: "#0268CE", fontSize: "1vw", fontWeight: 700, letterSpacing: "0.08em" }}>FEATURE · ADMINISTRATION</span>
          </div>
          <h2 style={{ color: "#0F172A", fontSize: "3.4vw", fontWeight: 800, margin: "0 0 2.5vh 0", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Who Can Do What
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
            {[
              { icon: "👥", title: "User Management", desc: "Invite members, assign roles, and remove users from your portal." },
              { icon: "🛡️", title: "Content Moderation", desc: "Edit or delete any post in the org, mark Mission Moments." },
              { icon: "🌐", title: "Subdomain Portal", desc: "Your org lives at [org].sentconnect.org — fully isolated." },
            ].map(item => (
              <div key={item.title} style={{ background: "#FFFFFF", borderRadius: 12, padding: "1.8vh 1.8vw", border: "1px solid #E8EEF8", display: "flex", gap: "1.2vw", alignItems: "flex-start" }}>
                <span style={{ fontSize: "2vh" }}>{item.icon}</span>
                <div>
                  <div style={{ color: "#0F172A", fontSize: "1.1vw", fontWeight: 700, marginBottom: "0.4vh" }}>{item.title}</div>
                  <div style={{ color: "#64748B", fontSize: "1vw", lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "2vh" }}>
          <div style={{ color: "#94A3B8", fontSize: "0.9vw", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "0.5vh" }}>ROLE HIERARCHY</div>
          {roles.map((r, i) => (
            <div key={r.role} style={{ background: "#FFFFFF", borderRadius: 14, padding: "2.5vh 2.5vw", border: "1px solid #E8EEF8", display: "flex", alignItems: "center", gap: "2vw", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ width: "4.5vh", height: "4.5vh", minWidth: "4.5vh", borderRadius: 10, background: r.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2vw", fontWeight: 800, color: r.color }}>
                {i + 1}
              </div>
              <div>
                <div style={{ color: r.color, fontSize: "1.2vw", fontWeight: 800, marginBottom: "0.4vh" }}>{r.role}</div>
                <div style={{ color: "#64748B", fontSize: "1.1vw", lineHeight: 1.5 }}>{r.perms}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.8vh 5vw", background: "#0047A8" }}>
        <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95vw", fontWeight: 500 }}>PLATFORM CONTACT: TEKI MENNA: 951-551-4528</span>
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.95vw" }}>sentconnect.org</span>
      </div>
    </div>
  );
}
