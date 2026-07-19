import { useReveal } from "../../hooks/useReveal";
import { useWriteReveal } from "../../hooks/useWriteReveal";

const PILLARS = [
  { n: "01", title: "Build",    tag: "Real projects, production APIs — if it doesn't run, it doesn't count." },
  { n: "02", title: "Research", tag: "Weekly paper club — read, discuss, and ship the code." },
  { n: "03", title: "Compete",  tag: "Kaggle, hackathons, inter-college teams." },
  { n: "04", title: "Connect",  tag: "Alumni in top companies, faculty with industry depth." },
];

export default function AboutUs() {
  const headRef = useWriteReveal({ delay: 0 });
  const paraRef = useReveal({ delay: 0.1 });
  const flowRef = useReveal({ delay: 0.2 });

  return (
    <section
      id="about"
      style={{
        background: "transparent",
        padding: "clamp(80px, 10vw, 140px) clamp(24px, 6vw, 96px)",
      }}
    >
      {/* Label */}
      <p style={{
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-xs)",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--amber)",
        marginBottom: 24,
      }}>
        About
      </p>

      {/* Headline */}
      <h2
        ref={headRef}
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(32px, 4.5vw, 60px)",
          fontWeight: 400,
          lineHeight: 1.1,
          color: "var(--paper-white)",
          maxWidth: 680,
          marginBottom: "clamp(40px, 5vw, 64px)",
        }}
      >
        A club for people who think<br />
        <em style={{ color: "rgba(238,233,220,0.4)", fontStyle: "italic" }}>
          in distributions, not answers.
        </em>
      </h2>

      {/* Paragraph + flowchart, side by side (wraps on narrow screens) */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "clamp(40px, 6vw, 88px)",
        alignItems: "flex-start",
      }}>
        {/* Body */}
        <p
          ref={paraRef}
          style={{
            flex: "1 1 380px",
            fontFamily: "var(--font-body)",
            fontSize: "clamp(15px, 1.4vw, 17px)",
            color: "rgba(238,233,220,0.45)",
            lineHeight: 1.75,
            maxWidth: 560,
            margin: 0,
          }}
        >
          The Society for Data Science at BIT Mesra is a student-run community built around one idea:
          that the best way to learn data science is to do it. We're not a coaching group.
          We're a team of builders, researchers, and competitors who happen to share a campus.
        </p>

        {/* Flow: Build → Research → Compete → Connect */}
        <div ref={flowRef} style={{ flex: "1 1 320px", maxWidth: 420 }}>
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: 24,
          }}>
            How it works
          </p>

          <div style={{ position: "relative" }}>
            {/* connecting line */}
            <div style={{
              position: "absolute",
              left: 13,
              top: 14,
              bottom: 14,
              width: 1,
              background: "linear-gradient(to bottom, rgba(59,111,232,0.5), rgba(232,137,74,0.5))",
            }} />

            {PILLARS.map(({ n, title, tag }, i) => (
              <div
                key={n}
                style={{
                  position: "relative",
                  display: "flex",
                  gap: 16,
                  paddingBottom: i < PILLARS.length - 1 ? 26 : 0,
                }}
              >
                {/* node dot */}
                <div style={{
                  position: "relative",
                  zIndex: 1,
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--void)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--amber)",
                }}>
                  {n}
                </div>

                <div style={{ paddingTop: 2 }}>
                  <h3 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-lg)",
                    fontWeight: 400,
                    color: "var(--paper-white)",
                    marginBottom: 4,
                  }}>
                    {title}
                  </h3>
                  <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-sm)",
                    color: "rgba(238,233,220,0.4)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}>
                    {tag}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
