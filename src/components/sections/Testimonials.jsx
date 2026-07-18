import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { TESTIMONIALS } from "../../data/testimonials";

const MARQUEE_ITEMS = ["Google", "BCG Gamma", "Zomato", "Razorpay", "Groww", "Kaggle GM", "DRDO", "Goldman Sachs", "Microsoft", "Amazon", "IIT Research"];

export default function Testimonials() {
  const [active, setActive]   = useState(0);
  const [prev, setPrev]       = useState(null);
  const [dir, setDir]         = useState(1);
  const [paused, setPaused]   = useState(false);
  const contentRef            = useRef(null);
  const timerRef               = useRef(null);
  const reduceMotionRef       = useRef(false);

  function goTo(idx, direction = 1) {
    if (idx === active) return;
    setPrev(active);
    setDir(direction);
    setActive(idx);
  }

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Auto-advance every 5s — paused whenever the user asks (button below) or
  // prefers reduced motion; an auto-rotating carousel with no way to stop it
  // fails WCAG 2.2.2 (Pause, Stop, Hide).
  useEffect(() => {
    if (paused || reduceMotionRef.current) return;
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [paused]);

  // GSAP crossfade on active change — skips the y-offset under reduced motion,
  // opacity-only instead.
  useEffect(() => {
    if (!contentRef.current) return;
    const reduce = reduceMotionRef.current;
    gsap.fromTo(contentRef.current,
      { opacity: 0, y: reduce ? 0 : 20 },
      { opacity: 1, y: 0, duration: reduce ? 0.2 : 0.6, ease: "power3.out" }
    );
  }, [active]);

  const t = TESTIMONIALS[active];

  return (
    <section
      id="testimonials"
      style={{
        background: "var(--void)",
        overflow: "hidden",
      }}
    >
      {/* Main testimonial block */}
      <div style={{ padding: "clamp(80px, 10vw, 140px) clamp(24px, 6vw, 96px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48 }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--amber)", margin: 0 }}>
            Testimonials
          </p>
          <button
            onClick={() => setPaused(p => !p)}
            aria-label={paused ? "Resume auto-advancing testimonials" : "Pause auto-advancing testimonials"}
            className="btn-press"
            style={{
              background: "none", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "var(--radius-sm)", padding: "6px 12px",
              cursor: "pointer",
              fontFamily: "var(--font-mono)", fontSize: 10,
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >{paused ? "▶ Play" : "❚❚ Pause"}</button>
        </div>

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
                  display: "flex", alignItems: "center", gap: 16,
                  transition: "opacity 0.3s var(--ease-out)",
                  opacity: i === active ? 1 : 0.3,
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: i === active ? item.color : "var(--surface)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.4s var(--ease-out)",
                }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: i === active ? "#fff" : "var(--text-muted)", fontWeight: 500 }}>
                    {item.initials}
                  </span>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: i === active ? "var(--paper-white)" : "rgba(238,233,220,0.4)", fontWeight: 500, transition: "color 0.3s var(--ease-out)" }}>
                    {item.name}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.04em", marginTop: 2 }}>
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
              margin: 0, marginBottom: 32,
              maxWidth: 700,
              // Quotes range from ~150 to ~260 characters — without a floor here,
              // the 5s auto-advance timer changes this section's height every
              // cycle, which changes total document height, which triggers
              // ScrollTrigger's automatic refreshAll for every pinned section
              // on the page (Events/Gallery/Speakers) on a recurring 5s loop,
              // completely independent of scroll position or the navbar.
              minHeight: "clamp(120px, 14vw, 190px)",
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
                borderRadius: 2, transition: "all 0.4s var(--ease-out)",
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
