export default function Slide08HowToLogin() {
  const steps = [
    {
      num: 1,
      title: "Go to your org's portal URL",
      desc: "Your admin will share a link in the format:",
      highlight: "[yourorg].sentconnect.org/login",
    },
    {
      num: 2,
      title: "Enter your email and password",
      desc: "Use the credentials from your invitation email. First-time users set their password via the link in that email.",
      highlight: null,
    },
    {
      num: 3,
      title: "You land on your Mission Feed",
      desc: "After login you go directly to your organization's private timeline — you're ready to browse and post.",
      highlight: null,
    },
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
        <span style={{ color: "#1E293B", fontSize: "1.3vw", fontWeight: 600 }}>How to Log In</span>
        <span style={{ color: "#94A3B8", fontSize: "1vw", fontWeight: 500 }}>8 of 11</span>
      </div>

      <div style={{ flex: 1, display: "flex", gap: "4vw", padding: "3.5vh 5vw 3vh", alignItems: "stretch" }}>
        <div style={{ flex: "0 0 55%", display: "flex", flexDirection: "column", justifyContent: "center", gap: "2.5vh" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "0.5vh" }}>
            <div style={{ width: "0.3vw", height: "3vh", background: "#0268CE", borderRadius: 2 }} />
            <span style={{ color: "#0268CE", fontSize: "1vw", fontWeight: 700, letterSpacing: "0.08em" }}>GUIDE STEP 01 · ACCESS</span>
          </div>
          <h2 style={{ color: "#0F172A", fontSize: "3.4vw", fontWeight: 800, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Signing In for the First Time
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
            {steps.map(step => (
              <div key={step.num} style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
                <div style={{ width: "4.5vh", height: "4.5vh", minWidth: "4.5vh", borderRadius: "50%", background: "#0268CE", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: "1.4vw", fontWeight: 800, flexShrink: 0, marginTop: "0.2vh" }}>
                  {step.num}
                </div>
                <div style={{ background: "#FFFFFF", borderRadius: 12, padding: "1.8vh 2vw", border: "1px solid #E8EEF8", flex: 1, boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                  <div style={{ color: "#0F172A", fontSize: "1.2vw", fontWeight: 700, marginBottom: "0.6vh" }}>{step.title}</div>
                  <div style={{ color: "#64748B", fontSize: "1.1vw", lineHeight: 1.55 }}>{step.desc}</div>
                  {step.highlight && (
                    <div style={{ marginTop: "1vh", background: "#EFF6FF", borderRadius: 8, padding: "0.8vh 1.2vw", color: "#0047A8", fontSize: "1.1vw", fontWeight: 600 }}>
                      {step.highlight}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "3vh 2.5vw", border: "1px solid #E8EEF8", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "2.5vh" }}>
              <span style={{ fontSize: "2.5vh" }}>🆘</span>
              <span style={{ color: "#0047A8", fontSize: "1.1vw", fontWeight: 700 }}>Need Help?</span>
            </div>
            {[
              { q: "Forgot password?", a: "Use the \"Forgot password\" link on the login page to get a reset email." },
              { q: "No invitation?", a: "Contact your organization admin to request an account." },
              { q: "Wrong org?", a: "Confirm the subdomain in the URL matches your organization name." },
            ].map(item => (
              <div key={item.q} style={{ marginBottom: "2vh", paddingBottom: "2vh", borderBottom: "1px solid #F1F5F9" }}>
                <div style={{ color: "#0F172A", fontSize: "1.1vw", fontWeight: 700, marginBottom: "0.5vh" }}>{item.q}</div>
                <div style={{ color: "#64748B", fontSize: "1.05vw", lineHeight: 1.55 }}>{item.a}</div>
              </div>
            ))}
            <div style={{ color: "#64748B", fontSize: "1.05vw", lineHeight: 1.55 }}>
              Still stuck? Reach out to <span style={{ color: "#0268CE", fontWeight: 600 }}>Teki Menna at 951-551-4528</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.8vh 5vw", background: "#0047A8" }}>
        <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95vw", fontWeight: 500 }}>PLATFORM CONTACT: TEKI MENNA: 951-551-4528</span>
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.95vw" }}>sentconnect.org</span>
      </div>
    </div>
  );
}
