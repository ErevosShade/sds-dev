import { useWriteReveal } from "../../hooks/useWriteReveal";
import { SPONSORS } from "../../data/sponsors";

export default function Sponsors() {
  const headRef = useWriteReveal();

  return (
    <section
      id="sponsors"
      style={{
        background: "transparent",
        padding: "clamp(48px, 6vw, 72px) clamp(24px, 6vw, 96px)",
        textAlign: "center",
      }}
    >
      <p ref={headRef} style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 32 }}>
        Trusted by organisations that care about data
      </p>

      {/* One small, static row — no tiers, no marquee. Logos speak for themselves. */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "clamp(24px, 4vw, 48px)" }}>
        {SPONSORS.map((s) => (
          <a key={s.id} href={s.url} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: 28,
            textDecoration: "none",
            opacity: 0.5,
            transition: "opacity 0.2s var(--ease-out)",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "0.5"}
          >
            {s.logo
              ? <img src={s.logo} alt={s.name} style={{ height: 24, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
              : <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)", letterSpacing: "0.06em" }}>{s.name}</span>
            }
          </a>
        ))}
      </div>
    </section>
  );
}
