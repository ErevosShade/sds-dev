import { useRef } from "react";
import { useReveal } from "../../hooks/useReveal";
import { useTextReveal } from "../../hooks/useTextReveal";
import { PROJECTS } from "../../data/projects";

export default function Projects() {
  const headRef = useTextReveal();
  const gridRef = useReveal({ delay: 0.15 });

  return (
    <section
      id="projects"
      style={{
        background: "var(--void)",
        padding: "clamp(80px, 10vw, 140px) clamp(24px, 6vw, 96px)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 24 }}>
        <div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 16 }}>
            Projects
          </p>
          <h2 ref={headRef} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 400, color: "var(--paper-white)", lineHeight: 1.1 }}>
            Real shipped work.<br />
            <em style={{ color: "rgba(238,233,220,0.38)", fontStyle: "italic" }}>Real links.</em>
          </h2>
        </div>
        <a href="#" style={{
          fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
          letterSpacing: "0.1em", textTransform: "uppercase",
          color: "var(--data-blue)", textDecoration: "none",
          borderBottom: "1px solid rgba(59,111,232,0.3)",
          paddingBottom: 2, transition: "border-color 0.2s var(--ease-out)",
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--data-blue)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(59,111,232,0.3)"}
        >
          View all ↗
        </a>
      </div>

      <div ref={gridRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1, background: "rgba(255,255,255,0.04)" }}>
        {PROJECTS.map((p) => (
          <div
            key={p.id}
            style={{
              background: "var(--void)",
              padding: "32px 28px",
              transition: "background 0.3s var(--ease-out)",
              cursor: p.link ? "pointer" : "default",
              display: "flex", flexDirection: "column", gap: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--surface)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--void)"}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 10,
                color: p.status === "live" ? "var(--data-blue)" : "var(--text-muted)",
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                {p.status === "live" ? "● Live" : "Archive"}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>{p.year}</span>
            </div>

            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 400, color: "var(--paper-white)", marginBottom: 8, lineHeight: 1.2 }}>
              {p.title}
            </h3>

            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "rgba(238,233,220,0.4)", lineHeight: 1.7, flex: 1, marginBottom: 24 }}>
              {p.description}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {p.tags.map(tag => (
                <span key={tag} style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: "var(--text-muted)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "4px 8px", borderRadius: 2,
                  letterSpacing: "0.04em",
                }}>{tag}</span>
              ))}
            </div>

            {(p.link || p.github) && (
              <div style={{ display: "flex", gap: 12, marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {p.link && <a href={p.link} style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--data-blue)", textDecoration: "none", letterSpacing: "0.06em" }}>Live ↗</a>}
                {p.github && <a href={p.github} style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", textDecoration: "none", letterSpacing: "0.06em" }}>GitHub ↗</a>}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
