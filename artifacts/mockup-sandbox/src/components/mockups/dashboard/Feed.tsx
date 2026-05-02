import { useState } from "react";

const BLUE = "#0047A8";

const posts = [
  {
    id: 1,
    author: "Addie T.",
    initials: "A",
    avatarBg: "#FDE68A",
    avatarColor: "#92400E",
    timeAgo: "1 day ago",
    location: "Mexico",
    isMoment: true,
    text: "Great trip to Mexico this weekend! Built 3 houses with the local community — what an incredible experience of God's provision.",
    hasImage: true,
    imageBg: "linear-gradient(135deg, #6EE7B7 0%, #3B82F6 100%)",
    likes: 12,
    comments: 4,
  },
  {
    id: 2,
    author: "James T.",
    initials: "J",
    avatarBg: "#BFDBFE",
    avatarColor: "#1E40AF",
    timeAgo: "2 days ago",
    location: undefined,
    isMoment: true,
    text: "Our team had an amazing time leading the youth camp this week. Please pray for the seeds that were planted!",
    hasImage: false,
    likes: 8,
    comments: 2,
  },
  {
    id: 3,
    author: "Sarah M.",
    initials: "S",
    avatarBg: "#D1FAE5",
    avatarColor: "#065F46",
    timeAgo: "3 days ago",
    location: "Nairobi, Kenya",
    isMoment: false,
    text: "Week two of language school — finally able to greet people in Swahili without them laughing too hard. Small wins.",
    hasImage: false,
    likes: 21,
    comments: 7,
  },
];

export function Feed() {
  const [activeTab, setActiveTab] = useState<"all" | "moments">("all");
  const [draft, setDraft] = useState("");

  const filtered = activeTab === "all" ? posts : posts.filter(p => p.isMoment);

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Inter', system-ui, sans-serif", color: "#111827" }}>

      {/* ── Nav ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "#fff", borderBottom: "1px solid #e5e7eb", height: 52, display: "flex", alignItems: "center", padding: "0 32px", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.02em", color: "#111827" }}>SentConnect</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <a href="#" style={{ fontSize: 13, fontWeight: 600, color: "#111827", textDecoration: "none" }}>Feed</a>
          <a href="#" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>Directory</a>
          <a href="#" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>Resources</a>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#eff6ff", border: "1.5px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, color: BLUE }}>A</div>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* ── Page title + stats ── */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.02em" }}>Missions Feed</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>Updates and stories from the field.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6b7280", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 999, padding: "3px 10px" }}>
              <b style={{ color: "#111827", fontWeight: 600 }}>6</b> Posts Shared
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6b7280", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 999, padding: "3px 10px" }}>
              <b style={{ color: "#111827", fontWeight: 600 }}>2</b> Mission Moments
            </span>
          </div>
        </div>

        {/* ── Composer ── */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginBottom: 36, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Share an update, prayer request, or mission moment..."
            style={{ width: "100%", minHeight: 60, border: "none", outline: "none", resize: "none", fontSize: 13, color: "#374151", background: "transparent", fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f0f0f0", paddingTop: 10, marginTop: 4 }}>
            <div style={{ display: "flex", gap: 2 }}>
              {[
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></>,
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></>,
              ].map((icon, i) => (
                <button key={i} style={{ width: 28, height: 28, border: "none", background: "transparent", borderRadius: 6, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{icon}</button>
              ))}
            </div>
            <button style={{ padding: "5px 14px", fontSize: 12, fontWeight: 600, background: draft.trim() ? BLUE : "#f3f4f6", color: draft.trim() ? "#fff" : "#9ca3af", border: "none", borderRadius: 6, cursor: draft.trim() ? "pointer" : "default", transition: "all 0.15s" }}>
              Post
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 24, borderBottom: "1px solid #e5e7eb", marginBottom: 32 }}>
          {(["all", "moments"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                paddingBottom: 12,
                fontSize: 13,
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? "#111827" : "#6b7280",
                border: "none",
                borderBottom: activeTab === tab ? "2px solid #111827" : "2px solid transparent",
                background: "transparent",
                marginBottom: -1,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab === "all" ? `All Posts` : "Mission Moments"}
              <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 500, background: activeTab === tab ? "#f3f4f6" : "transparent", color: activeTab === tab ? "#374151" : "#9ca3af", borderRadius: 999, padding: "1px 7px" }}>
                {tab === "all" ? 6 : 2}
              </span>
            </button>
          ))}
        </div>

        {/* ── Feed ── */}
        <div>
          {filtered.map((post, i) => (
            <div
              key={post.id}
              style={{
                paddingTop: i === 0 ? 0 : 28,
                paddingBottom: 28,
                borderBottom: i < filtered.length - 1 ? "1px solid #f0f0f0" : "none",
              }}
            >
              {/* Post header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: post.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: post.avatarColor, flexShrink: 0, border: "1px solid #e5e7eb" }}>
                    {post.initials}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{post.author}</span>
                      {post.isMoment && (
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: BLUE, background: "#eff6ff", padding: "2px 6px", borderRadius: 4 }}>
                          Moment
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
                      {post.timeAgo}{post.location ? ` · ${post.location}` : ""}
                    </div>
                  </div>
                </div>
                <button style={{ border: "none", background: "transparent", cursor: "pointer", color: "#d1d5db", padding: 4, borderRadius: 4, display: "flex", alignItems: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                </button>
              </div>

              {/* Post body */}
              <p style={{ fontSize: 14, lineHeight: 1.75, color: "#374151", margin: "0 0 12px" }}>{post.text}</p>

              {/* Image */}
              {post.hasImage && (
                <div style={{ height: 200, background: post.imageBg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, overflow: "hidden" }}>
                  <span style={{ fontSize: 32 }}>🏗️</span>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <button style={actionBtn}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  {post.likes}
                </button>
                <button style={actionBtn}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  {post.comments}
                </button>
                <div style={{ flex: 1 }} />
                <button style={actionBtn}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  Share
                </button>
                <button style={actionBtn}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  fontSize: 12,
  fontWeight: 500,
  color: "#9ca3af",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  padding: "4px 0",
};
