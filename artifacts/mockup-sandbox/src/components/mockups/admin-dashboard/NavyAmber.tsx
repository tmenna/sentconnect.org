import { Rss, Palette, Users, LogOut, BarChart2, Star, MessageCircle, Heart, ThumbsUp } from "lucide-react";

const NAV = [
  { id: "feed", label: "Updates", Icon: Rss },
  { id: "branding", label: "Branding", Icon: Palette },
  { id: "team", label: "User Management", Icon: Users },
];

const POSTS = [
  { author: "James Okafor", time: "2h ago", location: "Nairobi, Kenya", text: "God is moving powerfully in the Kibera community. We had 34 new believers join our discipleship group this week — hearts are open and hungry for the Word.", likes: 24, loves: 18, comments: 7, highlight: true },
  { author: "Maria Santos", time: "5h ago", location: "São Paulo, Brazil", text: "Our medical outreach clinic served 120 families yesterday. The team is exhausted but full of joy. Thank you for your prayers and partnership.", likes: 31, loves: 22, comments: 12, highlight: false },
];

export function NavyAmber() {
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: "#F0F4FF", overflow: "hidden" }}>

      {/* Sidebar */}
      <aside style={{ width: 240, flexShrink: 0, background: "#0F172A", display: "flex", flexDirection: "column", padding: "24px 12px 20px" }}>

        {/* Workspace */}
        <div style={{ marginBottom: 28, padding: "0 8px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#64748B", textTransform: "uppercase", marginBottom: 6 }}>Workspace</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#ffffff", margin: 0, lineHeight: 1.2, letterSpacing: "-0.02em" }}>Global Partners</p>
          <p style={{ fontSize: 12, color: "#64748B", margin: "2px 0 0" }}>Calvary Church</p>
        </div>

        {/* Section label */}
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#475569", textTransform: "uppercase", padding: "0 8px", marginBottom: 4 }}>Manage</p>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {NAV.map(({ id, label, Icon }) => {
            const active = id === "feed";
            return (
              <button key={id} style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", textAlign: "left",
                padding: "9px 10px 9px 14px", borderRadius: 8, border: "none",
                background: active ? "#F59E0B" : "transparent",
                color: active ? "#0F172A" : "#94A3B8",
                fontSize: 13, fontWeight: active ? 700 : 400,
                cursor: "pointer",
              }}>
                <Icon style={{ width: 15, height: 15, flexShrink: 0, color: active ? "#0F172A" : "#64748B" }} />
                {label}
                {id === "team" && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, background: "rgba(148,163,184,0.12)", color: "#64748B", borderRadius: 999, padding: "1px 7px" }}>8</span>}
              </button>
            );
          })}
        </nav>

        {/* Stats strip */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16, marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[{ label: "Reached", value: "2,431" }, { label: "Updates", value: "148" }].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "8px 10px" }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 10, color: "#64748B", margin: 0, letterSpacing: "0.04em" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* User */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10, padding: "14px 8px 0", marginTop: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1E293B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#F59E0B", flexShrink: 0 }}>A</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Admin User</p>
            <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>admin@calvary.org</p>
          </div>
          <LogOut style={{ width: 14, height: 14, color: "#64748B", cursor: "pointer" }} />
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0f0f13", margin: 0, letterSpacing: "-0.02em" }}>Updates</h1>
            <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Latest field reports from your team</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", fontSize: 13, fontWeight: 500, color: "#0F172A", cursor: "pointer" }}>Export CSV</button>
            <button style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#0F172A", fontSize: 13, fontWeight: 600, color: "#F59E0B", cursor: "pointer" }}>+ Add Member</button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "12px 28px", display: "flex", gap: 24 }}>
          {[{ icon: BarChart2, label: "People Reached", value: "2,431", color: "#0F172A" }, { icon: Star, label: "Highlights", value: "14", color: "#F59E0B" }, { icon: MessageCircle, label: "Comments", value: "89", color: "#0891B2" }].map(({ icon: Icon, label, value, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon style={{ width: 15, height: 15, color }} />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#0f0f13", margin: 0 }}>{value}</p>
                <p style={{ fontSize: 11, color: "#94A3B8", margin: 0 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Feed */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
          {POSTS.map((p, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", borderLeft: p.highlight ? "3px solid #F59E0B" : "1px solid #E2E8F0", padding: "18px 20px", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0F172A", border: "1.5px solid #E2E8F0" }}>{p.author[0]}</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#0f0f13" }}>{p.author}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#94A3B8" }}>{p.time} · {p.location}</p>
                </div>
                {p.highlight && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, background: "#FEF3C7", color: "#B45309", borderRadius: 999, padding: "2px 8px" }}>★ Highlight</span>}
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#1e293b", lineHeight: 1.65 }}>{p.text}</p>
              <div style={{ display: "flex", gap: 16, paddingTop: 10, borderTop: "1px solid #F1F5F9" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#E0245E" }}><Heart style={{ width: 14, height: 14 }} />{p.loves}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#1877F2" }}><ThumbsUp style={{ width: 14, height: 14 }} />{p.likes}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748B" }}><MessageCircle style={{ width: 14, height: 14 }} />{p.comments}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
