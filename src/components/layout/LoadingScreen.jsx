import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

/**
 * LoadingScreen — the intro.
 *
 * Storyline (deliberately NOT the generic "AI boot terminal / glowing
 * particles" trope — that fails the site's own anti-generic test):
 *   1. A scatter of noisy data points fades in.
 *   2. Two gaussian curves draw themselves THROUGH the points — a distribution
 *      being fit to data. "Where data becomes understanding," literally.
 *   3. The curves are the SDS logo's own two bells (exact same path data), so
 *      they resolve into the real mark — the link is structural, not a forced
 *      metaphor: the logo IS two overlapping gaussians.
 *   4. Wordmark settles, then the whole mark flies into the navbar's logo
 *      slot as the overlay lifts — the loader's mark becomes the nav's mark.
 *
 * Runs once per browser session (sessionStorage); repeat navigations/HMR skip
 * it. Fully bypassed under prefers-reduced-motion.
 */

// Exact bell paths from SDSLogo (viewBox 0 0 56 40) so the morph lands on the
// real logo geometry.
const BELL_ORANGE = "M2 36 C4 36 6 28 10 18 C13 10 16 4 20 4 C24 4 27 10 30 18 C33 26 35 34 37 36 Z";
const BELL_BLUE   = "M16 36 C18 36 20 28 24 18 C27 10 30 4 34 4 C38 4 41 10 44 18 C47 26 50 34 52 36 Z";
const OVERLAP     = "M25 36 C25.5 34 26 30 27 24 C28 18 29 12 30 8 C31 12 32 18 33 24 C34 30 34.5 34 35 36 Z";

// Loader-local, slightly brighter than the on-page logo tokens — this is a
// spotlit moment on pure void, so the mark reads as vivid/glowing rather than
// muted. The real navbar logo it hands off to keeps the standard tokens.
const C_ORANGE  = "#FF9A4D";
const C_BLUE    = "#4C82FF";
const C_OVERLAP = "#3355C8";

// Scatter points that hug the double-bell envelope, so the curves visibly
// "fit" through the cloud rather than floating over unrelated noise.
const bell = (x, mu) => 36 - 31 * Math.exp(-((x - mu) ** 2) / 98);
const envelope = (x) => Math.min(bell(x, 20), bell(x, 34));

export default function LoadingScreen({ onComplete }) {
  const rootRef      = useRef(null);
  const bgRef        = useRef(null);
  const svgRef       = useRef(null);
  const pointRefs    = useRef([]);
  const strokeRefs   = useRef([]);
  const fillRefs     = useRef([]);
  const wordRef      = useRef(null);
  const statusRef    = useRef(null);
  const [status, setStatus] = useState("sampling");

  const points = useMemo(() => {
    const pts = [];
    for (let x = 4; x <= 52; x += 1.7) {
      const jx = x + (Math.random() - 0.5) * 1.4;
      const jy = envelope(x) + (Math.random() - 0.5) * 9;
      pts.push({ x: jx, y: Math.max(3, Math.min(37, jy)) });
    }
    return pts;
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Lock scroll while the intro plays.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const finish = () => {
      document.body.style.overflow = prevOverflow;
      onComplete();
    };

    if (reduce) {
      // No motion — a brief hold on the static mark, then hand off.
      gsap.set([...fillRefs.current], { attr: { "fill-opacity": 0.95 } });
      gsap.set(wordRef.current, { opacity: 1 });
      const t = gsap.delayedCall(0.5, () => {
        gsap.to(rootRef.current, { opacity: 0, duration: 0.4, onComplete: finish });
      });
      return () => t.kill();
    }

    const tl = gsap.timeline();

    // 1 — data points fade/scale in
    tl.to(pointRefs.current, {
      opacity: 0.7, scale: 1, transformOrigin: "center",
      duration: 0.6, ease: "power2.out", stagger: { each: 0.015, from: "random" },
    }, 0);

    // 2 — curves draw through the cloud (distribution fitting)
    tl.add(() => setStatus("fitting distribution"), 0.55);
    tl.to(strokeRefs.current, {
      attr: { "stroke-dashoffset": 0 },
      duration: 1.0, ease: "power2.inOut", stagger: 0.12,
    }, 0.6);
    // points recede to nothing as the curve fits — no lingering dots
    tl.to(pointRefs.current, { opacity: 0, duration: 0.6, stagger: { each: 0.008, from: "random" } }, 0.7);

    // 3 — curves resolve into the filled logo, strokes fade out. Two bells go
    // to 0.95, the overlap sliver to 0.5 (matches the real logo's blend).
    tl.add(() => setStatus("resolving"), 1.5);
    tl.to([fillRefs.current[0], fillRefs.current[1]], { attr: { "fill-opacity": 0.95 }, duration: 0.5, ease: "power2.out" }, 1.55);
    tl.to(fillRefs.current[2], { attr: { "fill-opacity": 0.5 }, duration: 0.5, ease: "power2.out" }, 1.55);
    tl.to(strokeRefs.current, { opacity: 0, duration: 0.4 }, 1.6);

    // 4 — wordmark settles; status label steps aside
    tl.to(wordRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 1.9);
    tl.to(statusRef.current, { opacity: 0, duration: 0.3 }, 1.9);

    // hold
    tl.to({}, { duration: 0.5 }, 2.4);

    // 5 — exit: fly the mark into the navbar logo slot, lift the overlay
    tl.add(() => {
      const svg = svgRef.current;
      const from = svg.getBoundingClientRect();
      const targetEl = document.querySelector('nav [aria-label^="SDS logo"]');
      const to = targetEl?.getBoundingClientRect();

      const fromCx = from.left + from.width / 2;
      const fromCy = from.top + from.height / 2;
      const toCx = to ? to.left + to.width / 2 : 60;
      const toCy = to ? to.top + to.height / 2 : 32;
      const scale = to ? to.height / from.height : 0.12;

      // wordmark + status fade first so only the mark flies
      gsap.to(wordRef.current, { opacity: 0, duration: 0.3 });

      gsap.to(svg, {
        x: toCx - fromCx,
        y: toCy - fromCy,
        scale,
        duration: 0.9,
        ease: "power3.inOut",
      });
      gsap.to(bgRef.current, { opacity: 0, duration: 0.7, delay: 0.25 });
      gsap.to(svg, { opacity: 0, duration: 0.25, delay: 0.75, onComplete: finish });
    }, 2.9);

    return () => { tl.kill(); document.body.style.overflow = prevOverflow; };
  }, [onComplete]);

  return (
    <div
      ref={rootRef}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}
    >
      <div ref={bgRef} style={{ position: "absolute", inset: 0, background: "var(--void)" }} />

      <svg
        ref={svgRef}
        viewBox="0 0 56 40"
        style={{ position: "relative", width: "clamp(200px, 26vw, 340px)", height: "auto", overflow: "visible" }}
        aria-hidden="true"
      >
        <defs>
          {/* Soft neon-style glow — a blurred copy of the shape sitting under
              the crisp original, so the curves read as lit rather than flat. */}
          <filter id="sds-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="0.9" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            ref={(el) => (pointRefs.current[i] = el)}
            cx={p.x} cy={p.y} r={0.55}
            fill="var(--paper-white)"
            opacity={0}
            style={{ transform: "scale(0)" }}
          />
        ))}

        {/* curves + fills carry the glow (points stay crisp, outside the filter) */}
        <g filter="url(#sds-glow)">
          {/* stroke outlines that "draw" — pathLength normalized to 1 */}
          {[BELL_ORANGE, BELL_BLUE].map((d, i) => (
            <path
              key={`s${i}`}
              ref={(el) => (strokeRefs.current[i] = el)}
              d={d}
              fill="none"
              stroke={i === 0 ? C_ORANGE : C_BLUE}
              strokeWidth={0.8}
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1}
            />
          ))}

          {/* filled logo — fades in over the strokes */}
          {[[BELL_ORANGE, C_ORANGE], [BELL_BLUE, C_BLUE], [OVERLAP, C_OVERLAP]].map(([d, c], i) => (
            <path
              key={`f${i}`}
              ref={(el) => (fillRefs.current[i] = el)}
              d={d}
              fill={c}
              fillOpacity={0}
            />
          ))}
        </g>
      </svg>

      {/* wordmark */}
      <div
        ref={wordRef}
        style={{ position: "relative", marginTop: 24, textAlign: "center", opacity: 0, transform: "translateY(10px)" }}
      >
        <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 44px)", color: "var(--paper-white)", lineHeight: 1, letterSpacing: "0.02em" }}>
          SDS
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--text-muted)", marginTop: 10 }}>
          Society for Data Science
        </div>
      </div>

      {/* honest, phase-accurate status line (describes the animation, not fake jargon) */}
      <div
        ref={statusRef}
        style={{ position: "absolute", bottom: "clamp(32px, 6vh, 56px)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(238,233,220,0.28)" }}
      >
        {status}
      </div>
    </div>
  );
}
