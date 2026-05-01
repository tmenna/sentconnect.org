export default function Slide08HowToLogin() {
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
        08
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
          GUIDE STEP 01 // ACCESS
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
          HOW TO LOG IN
        </h2>

        <div style={{ display: "flex", gap: "5vw", alignItems: "flex-start" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3vh" }}>
            <div style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
              <div style={{ minWidth: "3.5vw", height: "3.5vw", border: "2px solid #0047A8", display: "flex", alignItems: "center", justifyContent: "center", color: "#0047A8", fontSize: "1.4vw", fontWeight: 600, flexShrink: 0 }}>
                1
              </div>
              <div>
                <div style={{ color: "#0D0D0D", fontSize: "1.4vw", fontWeight: 500, marginBottom: "0.5vh" }}>Go to your org's portal URL</div>
                <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.6 }}>Your admin will give you a URL in the format: <span style={{ color: "#0047A8", fontWeight: 500 }}>[yourorg].sentconnect.org/login</span></div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
              <div style={{ minWidth: "3.5vw", height: "3.5vw", border: "2px solid #0047A8", display: "flex", alignItems: "center", justifyContent: "center", color: "#0047A8", fontSize: "1.4vw", fontWeight: 600, flexShrink: 0 }}>
                2
              </div>
              <div>
                <div style={{ color: "#0D0D0D", fontSize: "1.4vw", fontWeight: 500, marginBottom: "0.5vh" }}>Enter your email and password</div>
                <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.6 }}>Use the credentials from your invitation email. First-time users set their password via the link in that email.</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
              <div style={{ minWidth: "3.5vw", height: "3.5vw", border: "2px solid #0047A8", display: "flex", alignItems: "center", justifyContent: "center", color: "#0047A8", fontSize: "1.4vw", fontWeight: 600, flexShrink: 0 }}>
                3
              </div>
              <div>
                <div style={{ color: "#0D0D0D", fontSize: "1.4vw", fontWeight: 500, marginBottom: "0.5vh" }}>You land on your Mission Feed</div>
                <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.6 }}>After login you are taken directly to your organization's private timeline.</div>
              </div>
            </div>
          </div>

          <div style={{ width: "32vw", backgroundColor: "#F0F4FF", padding: "3vh 2.5vw" }}>
            <div style={{ color: "#0047A8", fontSize: "1vw", fontWeight: 500, marginBottom: "2vh", letterSpacing: "0.1em" }}>NEED HELP?</div>
            <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.7 }}>
              {">"} Forgot password — use "Forgot password" link on the login page to receive a reset email.
            </div>
            <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.7, marginTop: "1.5vh" }}>
              {">"} No invitation — contact your organization admin to request an account.
            </div>
            <div style={{ color: "#555555", fontSize: "1.2vw", lineHeight: 1.7, marginTop: "1.5vh" }}>
              {">"} Wrong org — confirm the subdomain in the URL matches your organization.
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
