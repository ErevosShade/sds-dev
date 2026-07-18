import SDSLogo from "../ui/SDSLogo";

const NAV_COLS = [
  {
    title: "Navigation",
    links: [
      { label: "Home",         href: "/" },
      { label: "Events",       href: "/#events" },
      { label: "Projects",     href: "/#projects" },
      { label: "Testimonials", href: "/#testimonials" },
      { label: "Gallery",      href: "/#gallery" },
    ],
  },
  {
    title: "Organisation",
    links: [
      { label: "About Us",  href: "/#about" },
      { label: "Team",      href: "/team" },
      { label: "Sponsors",  href: "/#sponsors" },
    ],
  },
];

const SOCIALS = [
  { label: "Instagram", href: "#", handle: "@sds.bitmesra" },
  { label: "LinkedIn",  href: "#", handle: "SDS BIT Mesra" },
  { label: "GitHub",    href: "#", handle: "sds-bitmesra" },
];

const NOTEBOOK_LINES = [
  { prompt: "In [1]:",  code: "import sds",                output: null },
  { prompt: "",         code: "sds.connect()",             output: null },
  { prompt: "Out[1]:",  code: null, output: [
    "Connecting to SDS...",
    "Members:  120+",
    "Season:   2025–26",
    "Status:   ● Active",
  ]},
  { prompt: "In [2]:",  code: "sds.socials()",             output: null },
  { prompt: "Out[2]:",  code: null, output: [
    "→ instagram / sds.bitmesra",
    "→ linkedin  / sds-bit-mesra",
    "→ github    / sds-bitmesra",
  ]},
];

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--surface)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Main footer grid */}
      <div style={{
        padding: "clamp(56px, 7vw, 96px) clamp(24px, 6vw, 96px) 0",
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr 1.4fr",
        gap: "clamp(32px, 5vw, 80px)",
      }}>

        {/* Col 1 — Brand + nav */}
        <div>
          <SDSLogo size={32} showWordmark />
          <p style={{
            fontFamily: "var(--font-body)", fontSize: "var(--text-sm)",
            color: "rgba(238,233,220,0.35)", lineHeight: 1.7,
            marginTop: 16, marginBottom: 32, maxWidth: 260,
          }}>
            Society for Data Science, BIT Mesra.<br />
            Est. 2019 · Ranchi, Jharkhand.
          </p>

          <div style={{ display: "flex", gap: 40 }}>
            {NAV_COLS.map(col => (
              <div key={col.title}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
                  {col.title}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {col.links.map(({ label, href }) => (
                    <a key={label} href={href} style={{
                      fontFamily: "var(--font-body)", fontSize: "var(--text-sm)",
                      color: "rgba(238,233,220,0.4)", textDecoration: "none",
                      transition: "color 0.2s var(--ease-out)",
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--paper-white)"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(238,233,220,0.4)"}
                    >{label}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2 — Social + contact */}
        <div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
            Connect
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {SOCIALS.map(({ label, href, handle }) => (
              <a key={label} href={href} style={{
                display: "flex", justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                textDecoration: "none",
                transition: "opacity 0.2s var(--ease-out)",
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.5"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "rgba(238,233,220,0.3)" }}>{label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "rgba(238,233,220,0.5)" }}>{handle}</span>
              </a>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Mail</p>
            <a href="mailto:sds@bitmesra.ac.in" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--data-blue)", textDecoration: "none" }}>
              sds@bitmesra.ac.in
            </a>
          </div>
        </div>

        {/* Col 3 — Jupyter panel */}
        <div style={{
          background: "var(--void)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          fontFamily: "var(--font-mono)",
        }}>
          {/* Title bar */}
          <div style={{
            padding: "8px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "var(--surface-raised)",
          }}>
            <span style={{ fontSize: 11, color: "rgba(238,233,220,0.4)", letterSpacing: "0.04em" }}>
              sds_navigation.ipynb
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              {["rgba(255,95,87,0.7)","rgba(255,189,46,0.7)","rgba(40,200,64,0.7)"].map((c, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
              ))}
            </div>
          </div>

          {/* Notebook content */}
          <div style={{ padding: "16px 16px 20px", fontSize: 11, lineHeight: 1.9 }}>
            {NOTEBOOK_LINES.map((line, i) => (
              <div key={i}>
                {line.code && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "rgba(232,137,74,0.6)", minWidth: 52, textAlign: "right", flexShrink: 0 }}>{line.prompt}</span>
                    <span style={{ color: "rgba(238,233,220,0.6)" }}>{line.code}</span>
                  </div>
                )}
                {line.output && line.output.map((o, j) => (
                  <div key={j} style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "rgba(59,111,232,0.5)", minWidth: 52, textAlign: "right", flexShrink: 0 }}>
                      {j === 0 ? line.prompt : ""}
                    </span>
                    <span style={{
                      color: o.includes("●") ? "#E8894A" : o.startsWith("→") ? "rgba(59,111,232,0.7)" : "rgba(238,233,220,0.35)",
                    }}>
                      {o}
                    </span>
                  </div>
                ))}
              </div>
            ))}

            {/* Blinking cursor */}
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <span style={{ color: "rgba(232,137,74,0.6)", minWidth: 52, textAlign: "right" }}>In [3]:</span>
              <span className="animate-blink" style={{ color: "rgba(238,233,220,0.5)" }}>█</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div style={{
        margin: "40px clamp(24px, 6vw, 96px) 0",
        padding: "20px 0",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12,
      }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color: "rgba(238,233,220,0.2)" }}>
          © 2026 Society for Data Science, BIT Mesra. All rights reserved.
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "rgba(238,233,220,0.2)", letterSpacing: "0.04em" }}>
          built_by(react + fastapi + gsap)
        </span>
      </div>

      <style>{`
        @media (max-width: 900px) {
          footer > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
