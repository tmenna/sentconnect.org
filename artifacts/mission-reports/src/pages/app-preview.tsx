export default function AppPreview() {
  const BLUE = "#1085FD";

  const posts = [
    {
      initials: "GN",
      name: "Grace Nakamura",
      bio: "Japan outreach team · Osaka",
      location: "Osaka, Japan",
      ago: "2 hours ago",
      avatarBg: BLUE,
      content:
        "We had an incredible prayer night in Osaka with 47 people gathered. Three individuals gave their lives to Christ — tears of joy filled the room. Please continue to lift this work up in prayer! 🙏",
      loves: 38,
      likes: 12,
      comments: 7,
      photoGrad: "linear-gradient(135deg, #DBEAFE 0%, #93C5FD 100%)",
    },
    {
      initials: "EO",
      name: "Emmanuel Osei",
      bio: "West Africa missions · Kumasi",
      location: "Kumasi, Ghana",
      ago: "5 hours ago",
      avatarBg: "#059669",
      content:
        "Our team distributed 200 Bibles in remote villages near Kumasi today. Families were so grateful — many had never owned a Bible before. God is opening doors in ways we never imagined.",
      loves: 51,
      likes: 24,
      comments: 11,
      photoGrad: "linear-gradient(135deg, #D1FAE5 0%, #6EE7B7 100%)",
    },
    {
      initials: "SV",
      name: "Sofia Vargas",
      bio: "Latin America youth ministry · San José",
      location: "San José, Costa Rica",
      ago: "Yesterday",
      avatarBg: "#7C3AED",
      content:
        "Wrapped up our youth camp in San José with 85 students! 12 made first-time decisions for Christ this week. The energy and hunger for God among these young people is remarkable.",
      loves: 63,
      likes: 29,
      comments: 15,
      photoGrad: "linear-gradient(135deg, #EDE9FE 0%, #C4B5FD 100%)",
    },
  ];

  return (
    <div
      style={{
        background: "#F9FAFB",
        minHeight: "100vh",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #E5E7EB",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1152,
            margin: "0 auto",
            display: "flex",
            height: 56,
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img
              src="/favicon.svg"
              alt=""
              style={{ width: 28, height: 28, borderRadius: 8 }}
            />
            <span
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: "#0F172A",
                letterSpacing: "-0.02em",
              }}
            >
              sentconnect
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                background: BLUE,
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Help
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#2B92FD",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              G
            </div>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#EFF6FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={BLUE}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Feed */}
      <main style={{ padding: "32px 16px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          {/* Page header */}
          <div
            style={{
              marginBottom: 28,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: "#0F172A",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.2,
                  margin: "0 0 5px",
                }}
              >
                Missions Feed
              </h1>
              <p style={{ fontSize: 14, color: "#94A3B8", margin: 0 }}>
                Updates and stories from the field.
              </p>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                fontWeight: 700,
                color: "#374151",
                background: "#ECFDF5",
                border: "1px solid #A7F3D0",
                borderRadius: 999,
                padding: "5px 12px",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              14 Posts
            </div>
          </div>

          {/* Composer stub */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1px solid #E5E7EB",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              padding: "14px 16px",
              marginBottom: 28,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#2B92FD",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              G
            </div>
            <div
              style={{
                flex: 1,
                fontSize: 14,
                color: "#94A3B8",
                padding: "8px 14px",
                background: "#F9FAFB",
                borderRadius: 99,
                border: "1px solid #F1F5F9",
              }}
            >
              Share an update from the field…
            </div>
          </div>

          {/* Tabs */}
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #F1F5F9",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              padding: "0 8px",
              marginBottom: 24,
              display: "flex",
            }}
          >
            <button
              style={{
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 6,
                paddingRight: 6,
                marginRight: 28,
                fontSize: 15,
                fontWeight: 800,
                color: BLUE,
                border: "none",
                borderBottom: `2.5px solid ${BLUE}`,
                background: "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              All Posts
            </button>
            <button
              style={{
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 6,
                paddingRight: 6,
                marginRight: 28,
                fontSize: 15,
                fontWeight: 500,
                color: "#94A3B8",
                border: "none",
                borderBottom: "2.5px solid transparent",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Mission Moments
            </button>
          </div>

          {/* Post cards */}
          {posts.map((post, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #E5E7EB",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                marginBottom: 20,
                overflow: "hidden",
              }}
            >
              {/* Card header */}
              <div
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: post.avatarBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {post.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}
                  >
                    <span
                      style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}
                    >
                      {post.name}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                        fontSize: 11,
                        color: "#94A3B8",
                      }}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {post.location}
                    </span>
                  </div>
                  <p
                    style={{ fontSize: 12, color: "#94A3B8", margin: "2px 0 0" }}
                  >
                    {post.bio}
                  </p>
                  <p
                    style={{ fontSize: 12, color: "#CBD5E1", margin: "1px 0 0" }}
                  >
                    {post.ago}
                  </p>
                </div>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94A3B8",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: "0 20px 14px" }}>
                <p
                  style={{
                    fontSize: 14.5,
                    lineHeight: 1.7,
                    color: "#374151",
                    margin: 0,
                  }}
                >
                  {post.content}
                </p>
              </div>

              {/* Photo placeholder */}
              <div
                style={{
                  height: 200,
                  background: post.photoGrad,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>

              {/* Reactions */}
              <div
                style={{
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  borderTop: "1px solid #F1F5F9",
                }}
              >
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 13,
                    color: "#94A3B8",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {post.loves}
                </button>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 13,
                    color: "#94A3B8",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                  {post.likes}
                </button>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 13,
                    color: "#94A3B8",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {post.comments}
                </button>
                <div style={{ marginLeft: "auto" }}>
                  <span
                    style={{
                      fontSize: 12,
                      color: BLUE,
                      fontWeight: 600,
                    }}
                  >
                    View post →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
