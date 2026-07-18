import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { TESTIMONIALS } from "../../data/testimonials";

const MARQUEE_ITEMS = ["Google", "BCG Gamma", "Zomato", "Razorpay", "Groww", "Kaggle GM", "DRDO", "Goldman Sachs", "Microsoft", "Amazon", "IIT Research"];

export default function Testimonials() {
  const [active, setActive]   = useState(0);
  const [prev, setPrev]       = useState(null);
  const [dir, setDir]         = useState(1);
  const contentRef            = useRef(null);
  const timerRef              = useRef(null);

  function goTo(idx, direction = 1) {
    if (idx === active) return;
    setPrev(active);
    setDir(direction);
    setActive(idx);
  }

  // Auto-advance every 5s
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  // GSAP crossfade on active change
  useEffect(() => {
    if (!contentRef.current) return;
    gsap.fromTo(contentRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    );
  }, [active]);

  const t = TESTIMONIALS[active];

  return (
    <section
      id="testimonials"
      style={{
        background: "var(--void)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        overflow: "hidden",
      }}
    >
      {/* Main testimonial block */}
      <div style={{ padding: "clamp(80px, 10vw, 140px) clamp(24px, 6vw, 96px)" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 48 }}>
          Testimonials
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "clamp(40px, 6vw, 96px)", alignItems: "start" }}>
          {/* Left — person nav */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {TESTIMONIALS.map((item, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > active ? 1 : -1)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  textAlign: "left", padding: "16px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  display: "flex", alignItems: "center", gap: 14,
                  transition: "opacity 0.3s ease",
                  opacity: i === active ? 1 : 0.3,
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: i === active ? item.color : "var(--surface)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.4s ease",
                }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: i === active ? "#fff" : "var(--text-dim)", fontWeight: 500 }}>
                    {item.initials}
                  </span>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: i === active ? "var(--paper-white)" : "rgba(238,233,220,0.4)", fontWeight: 500, transition: "color 0.3s" }}>
                    {item.name}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.04em", marginTop: 2 }}>
                    {item.tag}
                  </div>
                </div>
                {/* Active bar */}
                {i === active && (
                  <div style={{ marginLeft: "auto", width: 2, height: 32, background: t.color, borderRadius: 1 }} />
                )}
              </button>
            ))}
          </div>

          {/* Right — quote */}
          <div ref={contentRef}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 80, color: `${t.color}20`, lineHeight: 0.7, display: "block", marginBottom: 24 }}>"</span>

            <blockquote style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(18px, 2.2vw, 26px)",
              fontStyle: "italic",
              color: "var(--paper-white)",
              lineHeight: 1.55,
              margin: 0, marginBottom: 36,
              maxWidth: 700,
            }}>
              {t.quote}
            </blockquote>

            <div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-base)", color: "var(--paper-white)", fontWeight: 500, marginBottom: 4 }}>
                {t.name}
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "rgba(238,233,220,0.4)" }}>
                {t.role}
              </div>
            </div>
          </div>
        </div>

        {/* Dot nav */}
        <div style={{ display: "flex", gap: 8, marginTop: 48 }}>
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
            }}>
              <div style={{
                width: i === active ? 28 : 6, height: 2,
                background: i === active ? t.color : "rgba(255,255,255,0.15)",
                borderRadius: 2, transition: "all 0.4s ease",
              }} />
            </button>
          ))}
        </div>
      </div>

      {/* Marquee seam — bleeds edge to edge, zero gap */}
      <div style={{
        overflow: "hidden",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        padding: "14px 0",
        background: "var(--surface)",
      }}>
        <div className="marquee-track" style={{ gap: 48 }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(238,233,220,0.25)",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}>
              {item}
              <span style={{ marginLeft: 48, color: "rgba(255,255,255,0.08)" }}>·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
