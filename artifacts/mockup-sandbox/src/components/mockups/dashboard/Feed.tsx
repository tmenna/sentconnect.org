export function Feed() {
  const BLUE = "#0268CE";
  const BLUE_DARK = "#0047A8";

  const posts = [
    {
      id: 1,
      author: "Addie T.",
      initials: "A",
      avatarBg: "#FDE68A",
      avatarColor: "#92400E",
      timeAgo: "1 day ago",
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
      isMoment: true,
      text: "Our team had an amazing time leading the youth camp this week. Please pray for the seeds that were planted!",
      hasImage: false,
      likes: 8,
      comments: 2,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Nav */}
      <header style={{
        background: "#fff",
        borderBottom: "1px solid #E5E7EB",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em", color: BLUE }}>SENTCONNECT</span>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#EFF6FF", border: "1.5px solid #93C5FD", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: BLUE }}>A</div>
        </div>
      </header>

      {/* Page */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 32px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

          {/* ── Mission Feed hero card ── */}
          <div style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 16,
            background: `linear-gradient(135deg, ${BLUE_DARK} 0%, ${BLUE} 60%, #1A80E0 100%)`,
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 4px 24px rgba(2,104,206,0.18)",
          }}>
            {/* Map SVG */}
            <svg aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18, pointerEvents: "none" }} preserveAspectRatio="xMidYMid slice" viewBox="0 0 900 120" xmlns="http://www.w3.org/2000/svg">
              <g fill="white">
                <path d="M 32,10 L 65,13 L 102,18 L 145,36 L 158,28 L 178,20 L 208,9 L 248,21 L 282,37 L 308,44 L 322,37 L 308,43 L 285,47 L 268,53 L 256,62 L 252,70 L 238,76 L 225,78 L 212,74 L 198,71 L 182,68 L 165,65 L 152,61 L 143,41 L 118,27 L 78,19 Z" />
                <path d="M 514,17 L 562,9 L 628,7 L 702,7 L 762,14 L 812,21 L 860,17 L 882,24 L 872,32 L 852,38 L 828,45 L 802,50 L 778,52 L 754,58 L 732,65 L 716,76 L 700,82 L 682,78 L 660,75 L 648,82 L 632,78 L 614,72 L 597,68 L 580,62 L 562,56 L 546,50 L 537,44 L 530,38 L 517,32 Z" />
                <path d="M 435,52 L 464,49 L 480,49 L 502,52 L 517,58 L 530,67 L 537,80 L 537,94 L 530,107 L 520,120 L 506,130 L 492,134 L 477,131 L 462,122 L 450,110 L 440,97 L 435,82 L 432,67 Z" />
              </g>
            </svg>

            <div style={{ position: "relative", zIndex: 1, padding: "28px 32px" }}>
              <h1 style={{ fontSize: 30, fontWeight: 900, color: "#fff", margin: 0, lineHeight: 1.2, letterSpacing: "-0.02em" }}>Mission Feed</h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.78)", marginTop: 4, marginBottom: 0 }}>Stay connected. Share what God is doing in the field.</p>

              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                {/* Posts Shared stat */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 16px", minWidth: 140 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(57,188,122,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39BC7A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0, lineHeight: 1 }}>6</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", margin: "2px 0 0" }}>Posts Shared</p>
                  </div>
                </div>

                {/* Mission Moments stat */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 16px", minWidth: 160 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,214,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD600" stroke="#FFD600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0, lineHeight: 1 }}>2</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", margin: "2px 0 0" }}>Mission Moments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Post Composer ── */}
          <div style={{
            background: "#fff",
            borderRadius: 16,
            border: `1px solid #BFDBFE`,
            boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
            padding: 20,
          }}>
            <div style={{ display: "flex", gap: 12 }}>
              {/* Avatar */}
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#374151", flexShrink: 0 }}>A</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, color: "#9CA3AF", paddingTop: 8, paddingBottom: 16 }}>Share an update with your church or field team…</div>

                {/* Toolbar */}
                <div style={{ display: "flex", alignItems: "center", gap: 4, paddingTop: 12, borderTop: "1px solid #F1F5F9", flexWrap: "wrap" }}>
                  {[
                    { icon: "🖼", label: "Photo" },
                    { icon: "🎬", label: "Video" },
                    { icon: "📍", label: "Location" },
                    { icon: "⭐", label: "Mission Moment" },
                  ].map(action => (
                    <button key={action.label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, border: "none", background: "transparent", color: "#6B7280", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                      <span style={{ fontSize: 14 }}>{action.icon}</span>
                      <span>{action.label}</span>
                    </button>
                  ))}
                  <div style={{ flex: 1 }} />
                  <button style={{ padding: "0 20px", height: 36, background: BLUE, color: "#fff", borderRadius: 10, border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", boxShadow: "0 2px 8px rgba(2,104,206,0.25)" }}>
                    Post Update
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Feed Tabs ── */}
          <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #E9E9E9" }}>
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0 12px", marginRight: 20, fontSize: 14, fontWeight: 700, color: BLUE, border: "none", background: "none", borderBottom: `2px solid ${BLUE}`, marginBottom: -1, cursor: "pointer" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              All Posts
              <span style={{ background: "#EFF6FF", color: BLUE, borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 500 }}>6</span>
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0 12px", fontSize: 14, fontWeight: 600, color: "#9CA3AF", border: "none", background: "none", borderBottom: "2px solid transparent", marginBottom: -1, cursor: "pointer" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Mission Moments
              <span style={{ background: "#F3F4F6", color: "#6B7280", borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 500 }}>2</span>
            </button>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 13, color: "#9CA3AF", paddingBottom: 12 }}>6 results</span>
          </div>

          {/* ── Post Cards ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {posts.map(post => (
              <div key={post.id} style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #BFDBFE",
                boxShadow: "0 2px 12px rgba(2,104,206,0.06)",
                overflow: "hidden",
              }}>
                {/* Card header */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "20px 20px 12px" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: post.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: post.avatarColor, flexShrink: 0 }}>{post.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{post.author}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 12, color: "#9CA3AF" }}>{post.timeAgo}</span>
                      {post.isMoment && (
                        <>
                          <span style={{ color: "#D1D5DB", fontSize: 10 }}>•</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 500, color: BLUE }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                            Mission Moment
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <button style={{ width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer", color: "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                  </button>
                </div>

                {/* Post text — no nested box */}
                <div style={{ padding: "0 20px 16px" }}>
                  <p style={{ fontSize: 15.5, color: "#111827", lineHeight: 1.75, margin: 0 }}>{post.text}</p>
                </div>

                {/* Photo placeholder */}
                {post.hasImage && (
                  <div style={{ height: 220, background: "linear-gradient(135deg, #6EE7B7 0%, #3B82F6 80%)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 0 }}>
                    <span style={{ fontSize: 36 }}>🏗️</span>
                  </div>
                )}

                {/* Engagement row — Like | Comment | Pray | Share */}
                <div style={{ display: "flex", alignItems: "center", borderTop: "1px solid #F3F4F6", padding: "4px 4px" }}>
                  {[
                    { icon: "♡", label: `Like${post.likes > 0 ? " " + post.likes : ""}` },
                    { icon: "💬", label: `Comment${post.comments > 0 ? " " + post.comments : ""}` },
                    { icon: "🙏", label: "Pray" },
                    { icon: "↗", label: "Share" },
                  ].map(action => (
                    <button key={action.label} style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "10px 0",
                      border: "none",
                      background: "transparent",
                      color: "#6B7280",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      borderRadius: 8,
                      margin: "0 4px",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6"; (e.currentTarget as HTMLButtonElement).style.color = "#111827"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#6B7280"; }}
                    >
                      <span>{action.icon}</span>
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
