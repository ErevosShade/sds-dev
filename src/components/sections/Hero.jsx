import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const wrapRef   = useRef(null);
  const canvasRef = useRef(null);
  const textRef   = useRef(null);
  const scrollRef = useRef(null);
  const maskWrapRef = useRef(null);

  // Gaussian canvas — rendered at low resolution and GPU-upscaled by CSS.
  // The field is soft/low-frequency, so a ~220px buffer looks identical to a
  // full-res render while costing ~100x less CPU (this was the hero lag source).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const peaks = [
      { x: 0.38, y: 0.52, sx: 0.26, sy: 0.38, r: 59,  g: 111, b: 232, phase: 0 },
      { x: 0.62, y: 0.48, sx: 0.22, sy: 0.32, r: 232, g: 137, b: 74,  phase: Math.PI },
    ];

    const RW = 220;                 // low-res buffer width — CSS stretches it to full size
    let W, H, t = 0, rafId, lastRender = 0, img, data;

    function resize() {
      const dispW = canvas.offsetWidth  || window.innerWidth;
      const dispH = canvas.offsetHeight || window.innerHeight;
      W = canvas.width  = RW;
      H = canvas.height = Math.max(1, Math.round(RW * (dispH / dispW)));
      img  = ctx.createImageData(W, H);   // allocate once, reuse every frame
      data = img.data;
    }

    function renderField() {
      if (!W || !H) return;
      // Hoist per-frame blob centers out of the pixel loop (were recomputed per pixel)
      const P = peaks.map(p => ({
        bx: p.x + Math.sin(t * 0.5 + p.phase) * 0.016,
        by: p.y + Math.cos(t * 0.4 + p.phase) * 0.010,
        isx: 1 / p.sx, isy: 1 / p.sy, r: p.r, g: p.g, b: p.b,
      }));
      let idx = 0;
      for (let y = 0; y < H; y++) {
        const ny = y / H;
        for (let x = 0; x < W; x++) {
          const nx = x / W;
          let v = 0, wr = 0, wg = 0, wb = 0;
          for (let i = 0; i < P.length; i++) {
            const p  = P[i];
            const dx = (nx - p.bx) * p.isx;
            const dy = (ny - p.by) * p.isy;
            const w  = Math.exp(-(dx * dx + dy * dy) * 0.5);
            v += w; wr += w * p.r; wg += w * p.g; wb += w * p.b;
          }
          if (v > 1) v = 1;
          data[idx]     = v > 0 ? wr / v : 0;
          data[idx + 1] = v > 0 ? wg / v : 0;
          data[idx + 2] = v > 0 ? wb / v : 0;
          data[idx + 3] = (v * 150) | 0;
          idx += 4;
        }
      }
      ctx.putImageData(img, 0, 0);
    }

    function tick(now) {
      t += 0.008;
      if (now - lastRender > 50) { renderField(); lastRender = now; }
      rafId = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    if (reduce) renderField();                       // one static frame, no loop
    else rafId = requestAnimationFrame(tick);
    return () => { if (rafId) cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); };
  }, []);

  // Cursor spotlight — GPU-composited mask that idles when the cursor is still
  useEffect(() => {
    const wrap   = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let mx = -999, my = -999, lx = -999, ly = -999;
    let targetR = 0, currentR = 0, rafId = null, running = false;
    const lerp = (a, b, t) => a + (b - a) * t;

    const apply = () => {
      const v = `radial-gradient(circle ${Math.round(currentR)}px at ${Math.round(lx)}px ${Math.round(ly)}px, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.32) 40%, transparent 100%)`;
      canvas.style.maskImage = v;
      canvas.style.webkitMaskImage = v;
    };

    function tick() {
      lx = lerp(lx < 0 ? mx : lx, mx, 0.14);
      ly = lerp(ly < 0 ? my : ly, my, 0.14);
      currentR = lerp(currentR, targetR, 0.12);
      apply();
      // Stop the loop once everything has settled — no permanent rAF/repaint
      const settled = Math.abs(lx - mx) < 0.5 && Math.abs(ly - my) < 0.5 && Math.abs(currentR - targetR) < 0.5;
      if (settled) { running = false; rafId = null; return; }
      rafId = requestAnimationFrame(tick);
    }

    const kick = () => { if (!running) { running = true; rafId = requestAnimationFrame(tick); } };

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      targetR = 230; kick();
    };
    const onLeave = () => { targetR = 0; kick(); };

    wrap.addEventListener("mousemove", onMove, { passive: true });
    wrap.addEventListener("mouseleave", onLeave, { passive: true });
    return () => { if (rafId) cancelAnimationFrame(rafId); wrap.removeEventListener("mousemove", onMove); wrap.removeEventListener("mouseleave", onLeave); };
  }, []);

  // GSAP text entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-line", { opacity: 0, y: 40, duration: 1.1, ease: "power3.out", stagger: 0.12, delay: 0.3 });
      gsap.from(".hero-sub",  { opacity: 0, y: 20, duration: 0.9, ease: "power3.out", delay: 0.8 });
      gsap.from(".hero-cta",  { opacity: 0, y: 16, duration: 0.8, ease: "power3.out", delay: 1.1 });
      gsap.from(".hero-stats", { opacity: 0, duration: 0.8, delay: 1.3 });
    }, textRef);
    return () => ctx.revert();
  }, []);

  // Scroll drain + scroll indicator fade
  useEffect(() => {
    const wrap     = wrapRef.current;
    const maskWrap = maskWrapRef.current;
    const scroll   = scrollRef.current;
    if (!wrap) return;

    const ctx = gsap.context(() => {
      if (scroll) {
        gsap.to(scroll, {
          opacity: 0,
          scrollTrigger: { trigger: wrap, start: "top top", end: "+=180", scrub: true },
        });
      }
      if (maskWrap) {
        gsap.to(maskWrap, {
          clipPath: "inset(100% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: { trigger: wrap, start: "center top", end: "bottom top", scrub: 1.5 },
        });
      }
    }, wrap);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={wrapRef}
      id="home"
      style={{ position: "relative", width: "100%", height: "100vh", minHeight: 600, overflow: "hidden", background: "var(--void)", cursor: "none" }}
    >
      {/* Gaussian field with clip-path drain */}
      <div ref={maskWrapRef} style={{ position: "absolute", inset: 0, clipPath: "inset(0% 0% 0% 0%)" }}>
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            maskImage: "radial-gradient(circle 0px at -999px -999px, black 0%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(circle 0px at -999px -999px, black 0%, transparent 100%)",
            willChange: "mask-image",
            transform: "translateZ(0)",
          }}
        />
      </div>

      {/* Ambient glow — always faintly visible */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 55% 40% at 40% 55%, rgba(59,111,232,0.045) 0%, transparent 70%),
          radial-gradient(ellipse 45% 35% at 62% 48%, rgba(232,137,74,0.045) 0%, transparent 70%)
        `,
      }} />

      {/* Text */}
      <div ref={textRef} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 clamp(24px, 6vw, 96px)", maxWidth: 920, zIndex: 2 }}>
        <p className="hero-line" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 28 }}>
          Society for Data Science · BIT Mesra · Est. 2019
        </p>
        <h1 style={{ margin: 0 }}>
          <span className="hero-line" style={{ display: "block", fontFamily: "var(--font-display)", fontSize: "clamp(40px, 6.5vw, 88px)", fontWeight: 400, lineHeight: 1.06, color: "var(--paper-white)" }}>
            Where data becomes
          </span>
          <span className="hero-line" style={{ display: "block", fontFamily: "var(--font-display)", fontSize: "clamp(40px, 6.5vw, 88px)", fontWeight: 400, fontStyle: "italic", lineHeight: 1.06, color: "rgba(238,233,220,0.35)" }}>
            understanding.
          </span>
        </h1>
        <p className="hero-sub" style={{ fontFamily: "var(--font-body)", fontSize: "clamp(14px, 1.5vw, 17px)", color: "rgba(238,233,220,0.4)", lineHeight: 1.75, marginTop: 28, maxWidth: 460 }}>
          We build, research, and compete with data.<br />
          Real projects. Real problems. Real placements.
        </p>
        <div className="hero-cta" style={{ display: "flex", gap: 12, marginTop: 40 }}>
          <a href="/#connect" style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", letterSpacing: "0.04em", color: "var(--paper-white)", textDecoration: "none", padding: "12px 28px", background: "var(--data-blue)", borderRadius: "var(--radius-sm)", border: "1px solid var(--data-blue)", transition: "opacity 0.2s var(--ease-out)" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            Join SDS
          </a>
          <a href="/#projects" style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", letterSpacing: "0.04em", color: "rgba(238,233,220,0.6)", textDecoration: "none", padding: "12px 28px", background: "transparent", borderRadius: "var(--radius-sm)", border: "1px solid rgba(255,255,255,0.12)", transition: "border-color 0.2s var(--ease-out), color 0.2s var(--ease-out)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "var(--paper-white)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(238,233,220,0.6)"; }}>
            See our work ↗
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="hero-stats" style={{ position: "absolute", bottom: 40, left: "clamp(24px, 6vw, 96px)", display: "flex", gap: 40, zIndex: 2 }}>
        {[{ n: "120+", l: "Members" }, { n: "5", l: "Years" }, { n: "40+", l: "Projects" }].map(({ n, l }) => (
          <div key={l}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xl)", color: "var(--paper-white)", fontWeight: 500 }}>{n}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color: "rgba(238,233,220,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      <div ref={scrollRef} style={{ position: "absolute", bottom: 44, right: "clamp(24px, 6vw, 96px)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 2 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", color: "rgba(238,233,220,0.2)", textTransform: "uppercase" }}>Scroll</div>
        <div style={{ width: 1, height: 32, background: "linear-gradient(to bottom, rgba(238,233,220,0.2), transparent)" }} />
      </div>
    </section>
  );
}
