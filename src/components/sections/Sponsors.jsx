import { useReveal } from "../../hooks/useReveal";
import { SPONSORS, TIER_CONFIG } from "../../data/sponsors";

export default function Sponsors() {
  const headRef = useReveal();
  const tiers = ["platinum", "gold", "silver"];

  return (
    <section
      id="sponsors"
      style={{
        background: "var(--void)",
        padding: "clamp(64px, 8vw, 112px) clamp(24px, 6vw, 96px)",
      }}
    >
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 16 }}>
        Sponsors
      </p>
      <h2 ref={headRef} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 3.5vw, 44px)", fontWeight: 400, color: "var(--paper-white)", marginBottom: 48, lineHeight: 1.1 }}>
        Trusted by organisations<br />
        <em style={{ color: "rgba(238,233,220,0.38)", fontStyle: "italic" }}>that care about data.</em>
      </h2>

      {tiers.map(tier => {
        const tierSponsors = SPONSORS.filter(s => s.tier === tier);
        if (tierSponsors.length === 0) return null;
        const config = TIER_CONFIG[tier];
        return (
          <div key={tier} style={{ marginBottom: 48 }}>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: 10,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: "var(--text-muted)", marginBottom: 24,
            }}>{config.label}</p>

            {/* Double marquee for each tier */}
            <div style={{ overflow: "hidden" }}>
              <div className="marquee-track" style={{ gap: 48 }}>
                {[...tierSponsors, ...tierSponsors].map((s, i) => (
                  <a key={i} href={s.url} style={{
                    flexShrink: 0,
                    height: config.logoHeight,
                    width: config.logoHeight * 3,
                    background: s.logo ? "transparent" : "var(--surface-raised)",
                    border: s.logo ? "none" : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "var(--radius-sm)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    textDecoration: "none",
                    transition: "opacity 0.2s var(--ease-out)",
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    {s.logo
                      ? <img src={s.logo} alt={s.name} style={{ height: config.logoHeight * 0.6, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.6 }} />
                      : <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em" }}>{s.name}</span>
                    }
                  </a>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
