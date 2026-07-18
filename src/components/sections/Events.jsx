import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EVENTS } from "../../data/events";

gsap.registerPlugin(ScrollTrigger);

const BLUE = "#3B6FE8"; // this section uses blue only — no orange/amber anywhere
const PAPER_WHITE_RGB = [238, 233, 220];
const BLUE_RGB = [59, 111, 232];

// Lerp from BLUE (far/blurred) to paper-white (centered/sharp) as t goes 1 → 0.
function nameColor(t) {
  const c = PAPER_WHITE_RGB.map((v, i) => Math.round(v + (BLUE_RGB[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

export default function Events() {
  const sectionRef  = useRef(null);
  const compassWrapRef = useRef(null);
  const dialRef     = useRef(null);
  const nameRefs    = useRef([]);
  const [active, setActive]   = useState(0);
  const activeRef = useRef(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const ROW_HEIGHT = 76;

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Scroll pins the section, drives which event is active, turns the big
  // background compass, and glides the vertical name wheel — one continuous
  // scrub. Free-flowing: everything moves smoothly with scroll position,
  // never snapping to fixed stops. A small scroll distance per event keeps
  // switching quick.
  useEffect(() => {
    const section = sectionRef.current;
    const dial = dialRef.current;
    if (!section || !dial) return;

    // Reduced motion: no pin/scroll-jack, no dial rotation, no gliding name
    // wheel. The ring sits static as background decoration; the event names
    // render as a plain clickable list instead (see the JSX below).
    if (reduceMotion) return;

    const total = EVENTS.length;
    const SWEEP_DEG = -360; // reversed — one full, clearly-visible glide the other way

    // Positions the name wheel for a given "continuous" value (0..total, NOT
    // a 0..1 fraction) — the current name sits sharp, white, and centered;
    // neighbors drift off, blur, and pick up a blue tint as they recede, like
    // text riding the rim of the same dial that's rotating. Only translateX
    // curves them (no rotate) so every name stays perfectly horizontal/
    // readable even as it arcs away from center.
    const updateNames = (continuous) => {
      nameRefs.current.forEach((el, i) => {
        if (!el) return;
        const delta = i - continuous;
        const dist = Math.abs(delta);
        const ty = delta * ROW_HEIGHT;
        const tx = -Math.min(dist * dist * 6, 70); // curves away/left as it recedes, like a rim
        const opacity = Math.max(0, 1 - dist * 0.7);
        const blur = Math.min(dist * 3.5, 8);
        el.style.transform = `translateY(calc(-50% + ${ty}px)) translateX(${tx}px)`;
        el.style.opacity = opacity;
        el.style.filter = `blur(${blur}px)`;
        el.style.color = nameColor(Math.min(dist, 1));
      });
    };

    const ctx = gsap.context(() => {
      updateNames(0);

      // Single source of truth for timing: one tween, one state object,
      // covering 0..total exactly like the old "continuous" value did. Ring
      // rotation, the name wheel, AND the active card index are all derived
      // from this SAME onUpdate call — so they can never drift apart, no
      // matter how much scrub smoothing lag is applied. (Previously the card/
      // names read ScrollTrigger's raw, unsmoothed self.progress while the
      // ring read this tween's scrubbed progress — two clocks for one motion,
      // which is why the ring visibly lagged behind the name/card.)
      const state = { t: 0 };
      const DEG_PER_UNIT = SWEEP_DEG / total;

      // Jerk/inertia — a tiny damped spring layered ON TOP of the precise
      // scrub rotation, driven by how fast `state.t` is changing frame to
      // frame. Fast scrolling kicks the ring past its exact position; it
      // overshoots and settles back once scrolling slows/stops, like a real
      // weighted dial rather than a value locked 1:1 to the scrollbar. The
      // index-switching logic below still reads the exact `state.t` —
      // only the ring's visual rotation gets the extra flourish.
      let jerkOffset = 0, jerkVelocity = 0;
      let lastT = 0, lastTime = performance.now();
      const STIFFNESS = 90, DAMPING = 12;

      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1, // smoothing lag — reads as a glide, not a mechanical snap
          start: "top top",
          end: `+=${total * 320}`,
        },
      }).to(state, {
        t: total,
        ease: "none",
        duration: total,
        onUpdate: () => {
          const now = performance.now();
          const dt = Math.min(0.05, (now - lastTime) / 1000); // clamp so tab-switches don't spike it
          lastTime = now;

          const velocityDegPerSec = dt > 0 ? ((state.t - lastT) * DEG_PER_UNIT) / dt : 0;
          lastT = state.t;

          const target = gsap.utils.clamp(-25, 25, velocityDegPerSec * 0.03);
          const force = (target - jerkOffset) * STIFFNESS - jerkVelocity * DAMPING;
          jerkVelocity += force * dt;
          jerkOffset += jerkVelocity * dt;

          dial.setAttribute("transform", `rotate(${state.t * DEG_PER_UNIT + jerkOffset} 150 150)`);
          updateNames(state.t);

          const idx = Math.min(Math.floor(state.t), total - 1);
          if (idx !== activeRef.current) {
            activeRef.current = idx;
            setActive(idx);
          }
        },
      });
    }, section);

    return () => ctx.revert();
  }, [reduceMotion]);

  const event = EVENTS[active];

  return (
    <section
      ref={sectionRef}
      id="events"
      style={{
        position: "relative",
        background: "var(--void)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "0 clamp(24px, 6vw, 96px)",
      }}
    >
      {/* Ambient room glow — always blue, never orange/amber. Pulled in tighter
          (smaller ellipse, faster falloff) so it stays close to the dial
          instead of flooding outward — but still NOT clipped top/bottom (no
          overflow:hidden on the section), so it keeps bleeding into the
          sections above and below, same as before. The page body already
          clips horizontal overflow globally, so this is safe. */}
      <div style={{
        position: "absolute",
        left: 0, right: 0,
        top: "-30vh", bottom: "-30vh",
        zIndex: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 46% 60% at 56px 50%, ${BLUE}38 0%, ${BLUE}14 25%, transparent 50%)`,
      }} />

      {/* Giant compass — a complete circle, anchored so its center sits exactly on the
          left screen edge. Only the right half is ever visible (cropped naturally by
          the section's overflow, no drawn seam/line pretending it's a half-shape).
          Opacity nudged down slightly so it reads as more recessed/background. */}
      <div ref={compassWrapRef} className="sds-compass-decor" style={{
        position: "absolute",
        left: "56px",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: "clamp(600px, 60vw, 900px)",
        aspectRatio: "1",
        opacity: 0.82,
        zIndex: 0,
        pointerEvents: "none",
      }}>
        <svg
          viewBox="-20 -20 340 340"
          style={{ width: "100%", height: "100%" }}
        >
          {/* Outer bezel — minimal: one crisp ring, one faint inner ring */}
          <circle cx="150" cy="150" r="142" fill="none" stroke={`${BLUE}60`} strokeWidth="1.5" />
          <circle cx="150" cy="150" r="120" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

          {/* Dial — ticks, event markers. Rotated via a native SVG transform attribute
              (rotate(deg 150 150)) set imperatively — see the effect above. */}
          <g ref={dialRef}>

            {/* Minimal graduated ticks — every 15 degrees, two tiers only.
                Each tick is its own <g rotate(deg 150 150)> wrapping a vertical
                line drawn straight up from center — the exact clock-hand
                technique (rotate around the shared pivot, not hand-computed
                sin/cos coordinates), so every tick is provably concentric
                with the bezel regardless of browser transform quirks. */}
            {Array.from({ length: 24 }, (_, i) => {
              const deg = i * 15;
              const isMajor = deg % 90 === 0;
              const r1 = 132;
              const r2 = isMajor ? 112 : 122;
              return (
                <g key={i} transform={`rotate(${deg} 150 150)`}>
                  <line
                    x1="150" y1={150 - r1}
                    x2="150" y2={150 - r2}
                    stroke={isMajor ? `${BLUE}55` : "rgba(255,255,255,0.14)"}
                    strokeWidth={isMajor ? 1.5 : 0.75}
                  />
                </g>
              );
            })}

            {/* Event dots — evenly spaced around the full ring, same rotate-around-pivot technique */}
            {EVENTS.map((ev, i) => {
              const deg = (i / EVENTS.length) * 360;
              const isActive = i === active;
              return (
                <g key={i} transform={`rotate(${deg} 150 150)`}>
                  <circle
                    cx="150" cy={150 - 140}
                    r={isActive ? 5 : 3}
                    fill={isActive ? BLUE : "rgba(255,255,255,0.15)"}
                    style={{ transition: "all 0.4s var(--ease-out)", filter: isActive ? `drop-shadow(0 0 6px ${BLUE})` : "none" }}
                  />
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div style={{ position: "relative", zIndex: 2, width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 6vw, 100px)", alignItems: "stretch" }}>

        {/* LEFT — dial + name, vertically centered so their middle line matches the
            card's middle line and the compass's own center (all three share one axis) */}
        <div style={{ position: "relative", minHeight: 260 }}>
          <p style={{
            position: "absolute", top: 0, left: 0,
            fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: BLUE, margin: 0,
          }}>Events</p>

          {reduceMotion ? (
            /* Reduced motion: a plain clickable list instead of the gliding wheel —
               no scroll-jacking, no auto-driven transforms. */
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 8 }}>
              {EVENTS.map((ev, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-current={i === active}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    textAlign: "right", padding: "4px 0",
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(18px, 2vw, 26px)",
                    fontWeight: 400,
                    color: i === active ? "var(--paper-white)" : BLUE,
                    opacity: i === active ? 1 : 0.5,
                  }}
                >{ev.title}</button>
              ))}
            </div>
          ) : (
            /* Event name wheel — sits in the gap between the dial and the card, nudged right.
                Glides continuously with scroll; the current name is sharp, neighbors drift
                off-center and blur out, like a picker on a physical dial. */
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, transform: "translateY(-50%) translateX(104px)", height: 260, overflow: "hidden" }}>
              {EVENTS.map((ev, i) => (
                <h3
                  key={i}
                  ref={(el) => (nameRefs.current[i] = el)}
                  style={{
                    position: "absolute", top: "50%", right: 0,
                    width: "min(52%, 280px)",
                    textAlign: "right",
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(22px, 2.4vw, 32px)",
                    fontWeight: 400,
                    color: "var(--paper-white)",
                    lineHeight: 1.2,
                    margin: 0,
                    overflowWrap: "break-word",
                    willChange: "transform, filter, opacity",
                  }}
                >{ev.title}</h3>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Event detail card. The shell mounts once (no key={active} here) —
            only its content swaps as the active event changes, so it never
            "reloads"; border/accent colors just transition smoothly in place. */}
        <div style={{ alignSelf: "center", justifySelf: "end", width: "100%", maxWidth: 400 }}>
          <div style={{
            background: "var(--surface)",
            border: `1px solid ${BLUE}28`,
            borderRadius: "var(--radius-lg)",
            padding: "clamp(28px, 3vw, 48px)",
            minHeight: 480,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Top accent line */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg, transparent, ${BLUE}80, transparent)`,
            }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: BLUE,
                background: `${BLUE}15`,
                border: `1px solid ${BLUE}28`,
                padding: "4px 10px", borderRadius: "var(--radius-sm)",
              }}>{event?.tag}</span>

              <span style={{
                display: "flex", alignItems: "center", gap: 6,
                fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
                color: event?.status === "upcoming" ? BLUE : "var(--text-muted)",
                background: event?.status === "upcoming" ? `${BLUE}1a` : "rgba(255,255,255,0.05)",
                border: event?.status === "upcoming" ? `1px solid ${BLUE}40` : "1px solid rgba(255,255,255,0.08)",
                padding: "4px 12px", borderRadius: "999px",
              }}>
                {event?.status === "upcoming" && (
                  <span className="animate-pulse-blue" style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE, display: "inline-block" }} />
                )}
                {event?.status === "upcoming" ? "Upcoming" : "Completed"}
              </span>
            </div>

            <h3 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(24px, 3vw, 36px)",
              fontWeight: 400,
              color: "var(--paper-white)",
              lineHeight: 1.15,
              marginBottom: 16,
            }}>{event?.title}</h3>

            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              color: "rgba(238,233,220,0.45)",
              lineHeight: 1.75,
              marginBottom: 32,
            }}>{event?.description}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, marginTop: "auto" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", minWidth: 48 }}>Date</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "rgba(238,233,220,0.55)" }}>{event?.date}</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", minWidth: 48 }}>Venue</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "rgba(238,233,220,0.55)" }}>{event?.venue}</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", minWidth: 48 }}>Coord</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: BLUE }}>{event?.coordinate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          #events > div { grid-template-columns: 1fr !important; }
          .sds-compass-decor {
            position: static !important;
            left: auto !important; top: auto !important; transform: none !important;
            width: min(320px, 80vw) !important;
            margin: 0 auto 32px !important;
          }
        }
      `}</style>
    </section>
  );
}
