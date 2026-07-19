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
  const cardRef   = useRef(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Top-line-to-top-line spacing between event names, ~3.5 name lines. Rows
  // are anchored by their TOP line (not their center), so a title that wraps
  // to 2-3 lines grows downward into this gap instead of overlapping its
  // neighbors. ROW_TOP_OFFSET lifts the wheel so the active name's first line
  // sits on the center axis (aligned with the dial + card).
  const ROW_HEIGHT = 108;
  const ROW_TOP_OFFSET = 20;

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Card's initial state: hidden (it fades in once when the section is reached
  // — that trigger lives in the scroll effect below, alongside the pin so they
  // share refresh timing). Under reduced motion it's simply shown.
  useEffect(() => {
    if (!cardRef.current) return;
    gsap.set(cardRef.current, reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 });
  }, [reduceMotion]);

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
        el.style.transform = `translateY(${ty - ROW_TOP_OFFSET}px) translateX(${tx}px)`;
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
          end: `+=${total * 190}`, // shorter scroll per event — switches quicker
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

          // Round (not floor): the card flips to the next event once the wheel
          // has travelled MORE THAN HALF the way toward it — i.e. as soon as
          // that name becomes the one closest to center — rather than waiting
          // for it to fully arrive. Matches the reference's mid-travel switch.
          const idx = Math.min(Math.max(Math.round(state.t), 0), total - 1);
          if (idx !== activeRef.current) {
            activeRef.current = idx;
            setActive(idx);
          }
        },
      });

      // Card loads in ONCE, when the section is ~1/3 into the viewport — the
      // first event name is settling into display at this point. Created inside
      // the same context as the pin trigger so it shares the pin's refresh
      // timing (a standalone ScrollTrigger computed its start before the
      // pin-spacer existed, so it fired at the wrong scroll position).
      ScrollTrigger.create({
        trigger: section,
        start: "top 30%",
        once: true,
        onEnter: () => gsap.to(cardRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }),
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
        background: "transparent",
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
          <defs>
            {/* soft glow filling the dial body — the fluid base */}
            <radialGradient id="sds-fluid" gradientUnits="userSpaceOnUse" cx="150" cy="150" r="150">
              <stop offset="0%"   stopColor={BLUE} stopOpacity="0.10" />
              <stop offset="55%"  stopColor={BLUE} stopOpacity="0.03" />
              <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
            </radialGradient>
            {/* blue fluid halo that wraps AROUND the OUTSIDE of the tick ring —
                pure glow, no stroke. Peaks just past the outer circle then
                fades outward, so the radial ticks read as an inner layer with
                the glow as the outer halo. */}
            <radialGradient id="sds-ring-glow" gradientUnits="userSpaceOnUse" cx="150" cy="150" r="154">
              <stop offset="0"    stopColor={BLUE} stopOpacity="0" />
              <stop offset="0.80" stopColor={BLUE} stopOpacity="0" />
              <stop offset="0.88" stopColor={BLUE} stopOpacity="0.2" />
              <stop offset="1"    stopColor={BLUE} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ── STATIC frame ─────────────────────────────────────────────────
              Soft fluid glow body; a blue glow band just inside the outer edge
              (no border); one slight circle line at the OUTER edge of the
              ticks; and the center hub. */}
          <circle cx="150" cy="150" r="150" fill="url(#sds-fluid)" />
          <circle cx="150" cy="150" r="154" fill="url(#sds-ring-glow)" />
          <circle cx="150" cy="150" r="133" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />

          {/* ── ROTATING dial — fine graduated bezel + event markers ──────────
              120 ticks (every 3°), three tiers. Each tick is its own
              <g rotate(deg 150 150)> wrapping a line drawn straight up from
              center — the clock-hand technique (rotate around the shared pivot,
              not hand-computed sin/cos), so every tick stays provably
              concentric regardless of browser transform quirks. */}
          <g ref={dialRef}>
            {/* Dense fine graduation — 180 ticks (every 2°), three tiers. The
                fine minor ticks are short + faint so the rim reads as a dense,
                precise scale. */}
            {Array.from({ length: 180 }, (_, i) => {
              const deg = i * 2;
              const major  = deg % 30 === 0;
              const medium = !major && deg % 10 === 0;
              const r1 = 132;
              const r2 = major ? 116 : medium ? 123 : 128;
              const stroke = major
                ? `${BLUE}4d`
                : medium
                ? "rgba(255,255,255,0.12)"
                : "rgba(255,255,255,0.07)";
              const width = major ? 1.0 : medium ? 0.6 : 0.4;
              return (
                <g key={i} transform={`rotate(${deg} 150 150)`}>
                  <line x1="150" y1={150 - r1} x2="150" y2={150 - r2} stroke={stroke} strokeWidth={width} />
                </g>
              );
            })}

            {/* Event dots — on the rim */}
            {EVENTS.map((ev, i) => {
              const deg = (i / EVENTS.length) * 360;
              const isActive = i === active;
              return (
                <g key={i} transform={`rotate(${deg} 150 150)`}>
                  <circle
                    cx="150" cy={150 - 128}
                    r={isActive ? 4 : 2.2}
                    fill={isActive ? BLUE : "rgba(255,255,255,0.18)"}
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
                off-center and blur out, like a picker on a physical dial. Each name carries
                its two-digit index in front of it (color/opacity/blur all inherited from the
                row, so the number glides with exactly the same effect). Left-aligned so a
                long title's extra length spills out to the right, leaving the left edge — the
                number + name start — perfectly steady as the wheel turns. */
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, transform: "translateY(-50%) translateX(clamp(140px, 22vw, 400px))", height: 260, overflow: "visible" }}>
              {EVENTS.map((ev, i) => (
                <div
                  key={i}
                  ref={(el) => (nameRefs.current[i] = el)}
                  style={{
                    position: "absolute", top: "50%", left: 0,
                    // the index sits just outside the dial's rim, the name a
                    // clear step further into the gap (reference's
                    // "09 ...... WOMEN PANEL" spacing).
                    display: "flex", alignItems: "flex-start", gap: "clamp(40px, 5.5vw, 100px)",
                    color: "var(--paper-white)",
                    willChange: "transform, filter, opacity",
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "clamp(13px, 1.2vw, 17px)",
                    letterSpacing: "0.06em",
                    color: "inherit", opacity: 0.5,
                    flexShrink: 0,
                    marginTop: "0.35em", // nudge the small index onto the title's first line
                  }}>{String(i + 1).padStart(2, "0")}</span>
                  <h3 style={{
                    // spaced uppercase sans, matching the reference's dial type
                    // (not the site's serif display) — clean, technical, wide.
                    fontFamily: "var(--font-body)",
                    fontSize: "clamp(20px, 2.2vw, 30px)",
                    fontWeight: 500,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "inherit",
                    lineHeight: 1.25, margin: 0,
                    // long titles wrap to two lines rather than overrunning —
                    // left edge stays fixed, extra length stacks downward.
                    maxWidth: "clamp(200px, 22vw, 340px)",
                    overflowWrap: "break-word",
                  }}>{ev.title}</h3>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Event detail card, redesigned to the reference: a tall
            rounded card, a visual band up top, then a bold uppercase title +
            description at the bottom. The shell mounts once; cardRef gets a
            fade+rise "load up" each time the active event changes (see effect
            above). Visual band is an honest gradient + data-dot motif — the
            events have no photos, so nothing fake/photographic is invented. */}
        <div style={{ alignSelf: "center", justifySelf: "end", width: "100%", maxWidth: 420 }}>
          <div ref={cardRef} style={{
            position: "relative",
            minHeight: 520,
            display: "flex", flexDirection: "column",
            borderRadius: 24,
            overflow: "hidden",
            border: `1px solid ${BLUE}2e`,
            boxShadow: `0 28px 64px -28px ${BLUE}33`,
          }}>
            {/* Visual band */}
            <div style={{
              position: "relative", flex: 1, minHeight: 240,
              background: `linear-gradient(158deg, ${BLUE}2b 0%, var(--surface-raised) 46%, var(--surface) 100%)`,
            }}>
              {/* data-dot grid motif */}
              <div style={{
                position: "absolute", inset: 0, opacity: 0.6,
                backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
                maskImage: "radial-gradient(ellipse 80% 80% at 60% 40%, black, transparent 85%)",
                WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 60% 40%, black, transparent 85%)",
              }} />
              {/* corner glow */}
              <div style={{
                position: "absolute", top: -40, right: -40, width: 200, height: 200,
                background: `radial-gradient(circle, ${BLUE}30, transparent 70%)`,
                pointerEvents: "none",
              }} />

              {/* tag + status */}
              <div style={{ position: "absolute", top: 20, left: 20, right: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: BLUE, background: `${BLUE}18`,
                  border: `1px solid ${BLUE}30`,
                  padding: "5px 12px", borderRadius: "var(--radius-sm)",
                }}>{event?.tag}</span>

                <span style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
                  color: event?.status === "upcoming" ? BLUE : "var(--text-muted)",
                  background: event?.status === "upcoming" ? `${BLUE}1a` : "rgba(255,255,255,0.05)",
                  border: event?.status === "upcoming" ? `1px solid ${BLUE}40` : "1px solid rgba(255,255,255,0.08)",
                  padding: "5px 12px", borderRadius: "999px",
                }}>
                  {event?.status === "upcoming" && (
                    <span className="animate-pulse-blue" style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE, display: "inline-block" }} />
                  )}
                  {event?.status === "upcoming" ? "Upcoming" : "Completed"}
                </span>
              </div>

              {/* faint big index watermark */}
              <span style={{
                position: "absolute", bottom: 12, left: 24,
                fontFamily: "var(--font-mono)", fontSize: 72, lineHeight: 1,
                color: "rgba(255,255,255,0.04)", letterSpacing: "-0.03em",
              }}>{String(active + 1).padStart(2, "0")}</span>
            </div>

            {/* Content footer — bold uppercase title + description + meta */}
            <div style={{
              padding: "clamp(24px, 3vw, 36px)",
              background: "linear-gradient(to top, var(--void), var(--surface))",
              borderTop: `1px solid ${BLUE}1f`,
            }}>
              <h3 style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                fontSize: "clamp(24px, 3vw, 34px)",
                color: "var(--paper-white)",
                lineHeight: 1.1,
                margin: 0, marginBottom: 14,
              }}>{event?.title}</h3>

              <p style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                color: "rgba(238,233,220,0.5)",
                lineHeight: 1.65,
                margin: 0, marginBottom: 22,
              }}>{event?.description}</p>

              <div style={{
                display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
                color: "var(--text-muted)", letterSpacing: "0.04em",
              }}>
                <span>{event?.date}</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span>{event?.venue}</span>
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
