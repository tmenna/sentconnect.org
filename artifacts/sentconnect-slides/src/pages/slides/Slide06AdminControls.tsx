export default function Slide06AdminControls() {
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
        06
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
          FEATURE // ADMINISTRATION
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
          ADMIN CONTROLS
        </h2>

        <div style={{ display: "flex", gap: "4vw" }}>
          <div style={{ flex: 1 }}>
            <div style={{ backgroundColor: "#F0F4FF", padding: "2.5vh 2vw", marginBottom: "2.5vh" }}>
              <div style={{ color: "#0047A8", fontSize: "1vw", fontWeight: 500, marginBottom: "1vh", letterSpacing: "0.1em" }}>USER MANAGEMENT</div>
              <div style={{ color: "#0D0D0D", fontSize: "1.4vw", lineHeight: 1.6 }}>Invite members, set roles (admin, owner, member), and remove users from the organization portal.</div>
            </div>
            <div style={{ backgroundColor: "#F0F4FF", padding: "2.5vh 2vw" }}>
              <div style={{ color: "#0047A8", fontSize: "1vw", fontWeight: 500, marginBottom: "1vh", letterSpacing: "0.1em" }}>CONTENT MODERATION</div>
              <div style={{ color: "#0D0D0D", fontSize: "1.4vw", lineHeight: 1.6 }}>Edit or delete any post in the org. Mark posts as Mission Moments. Export reports for any post.</div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ backgroundColor: "#F5F5F5", padding: "2.5vh 2vw", marginBottom: "2.5vh" }}>
              <div style={{ color: "#555555", fontSize: "1vw", fontWeight: 500, marginBottom: "1vh", letterSpacing: "0.1em" }}>ROLE HIERARCHY</div>
              <div style={{ color: "#0D0D0D", fontSize: "1.4vw", lineHeight: 1.6 }}>
                <span style={{ fontWeight: 500 }}>Owner</span> — full control incl. billing
              </div>
              <div style={{ color: "#0D0D0D", fontSize: "1.4vw", lineHeight: 1.6, marginTop: "0.5vh" }}>
                <span style={{ fontWeight: 500 }}>Admin</span> — user and content management
              </div>
              <div style={{ color: "#0D0D0D", fontSize: "1.4vw", lineHeight: 1.6, marginTop: "0.5vh" }}>
                <span style={{ fontWeight: 500 }}>Member</span> — post and read access
              </div>
            </div>
            <div style={{ backgroundColor: "#F5F5F5", padding: "2.5vh 2vw" }}>
              <div style={{ color: "#555555", fontSize: "1vw", fontWeight: 500, marginBottom: "1vh", letterSpacing: "0.1em" }}>SUBDOMAIN PORTAL</div>
              <div style={{ color: "#0D0D0D", fontSize: "1.4vw", lineHeight: 1.6 }}>Each org accesses their private portal at <span style={{ color: "#0047A8" }}>[org].sentconnect.org</span></div>
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
