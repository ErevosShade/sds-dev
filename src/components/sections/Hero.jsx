import { useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";

/* ══════════════════════════════════════════════════════════════════════════
   HERO — Society for Data Science, BIT Mesra
   Centerpiece: a LIVE CLASSIFIER that's actually running. Two class
   distributions (the SDS twin-bell motif) with a decision boundary, a
   continuous stream of data points being classified in real time, a live
   accuracy readout ticking toward convergence, and curves that breathe as if
   learning. The boundary responds to the cursor — move the mouse and the
   model re-decides. Genuinely alive, unmistakably data science, no 3D, no
   raster: a single generative canvas + a crisp DOM/SVG overlay.
   ═════════════════════════════════════════════════════════════════════════ */

let heroEntrancePlayed = false; // survives StrictMode remount

const ORANGE = "#F58A2C";
const BLUE   = "#4F7EFF";
const PURPLE = "#7C5CFF";
const WHITE  = "#F8F8F8";

const LABELS = [
  { text: "PYTHON",    pos: { x: 12, y: 40 } },
  { text: "PYTORCH",   pos: { x: 90, y: 34 } },
  { text: "KAGGLE",    pos: { x: 16, y: 66 } },
  { text: "RESEARCH",  pos: { x: 88, y: 62 } },
];

const EQUATIONS = [
  { t: "f(x) = 1/(σ√2π)·e^{-(x-μ)²/2σ²}", pos: { left: "3%",  top: "6%"  }, size: 13 },
  { t: "argmax_θ  Σ log P(xᵢ|θ)",           pos: { left: "60%", top: "5%"  }, size: 13 },
  { t: "μ̂ = (1/n)Σxᵢ",                       pos: { left: "4%",  top: "94%" }, size: 13 },
  { t: "σ̂² = (1/n)Σ(xᵢ-μ̂)²",                 pos: { left: "62%", top: "95%" }, size: 13 },
];

/* ── live classifier engine (single generative canvas) ───────────────────── */
function LiveClassifier() {
  const reduce = useReducedMotion();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const MONO = "'JetBrains Mono','Fira Code',monospace";

    let W = 0, H = 0, padL = 0, padT = 0, padB = 0, plotW = 0, plotH = 0, baseY = 0;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = canvas.width = Math.max(1, Math.round(r.width * DPR));
      H = canvas.height = Math.max(1, Math.round(r.height * DPR));
      padL = W * 0.02; padT = H * 0.17; padB = H * 0.09;
      plotW = W - padL * 2; plotH = H - padT - padB; baseY = H - padB;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // two classes in σ-space (the SDS twin bells)
    const CA = { mu: -1.05, sig: 0.72, amp: 0.60, col: [245, 138, 44] }; // orange
    const CB = { mu: 0.95,  sig: 0.98, amp: 0.82, col: [79, 126, 255] }; // blue
    const XMIN = -3.6, XMAX = 3.6;
    const xToPx = (dx) => padL + ((dx - XMIN) / (XMAX - XMIN)) * plotW;
    const gv = (dx, c) => c.amp * plotH * Math.exp(-((dx - c.mu) ** 2) / (2 * c.sig * c.sig));

    // gaussian sampler (Box–Muller)
    let spare = null;
    const randn = () => {
      if (spare !== null) { const s = spare; spare = null; return s; }
      const u = Math.random() || 1e-9, v = Math.random();
      const m = Math.sqrt(-2 * Math.log(u));
      spare = m * Math.sin(2 * Math.PI * v);
      return m * Math.cos(2 * Math.PI * v);
    };

    const BASE_THR = -0.12;         // decision boundary (σ)
    let thr = BASE_THR;
    let mouseNorm = 0.5;
    const onMouse = (e) => {
      const r = canvas.getBoundingClientRect();
      mouseNorm = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    };
    window.addEventListener("mousemove", onMouse, { passive: true });

    const P = [];
    const spawn = () => {
      const useA = Math.random() < CA.amp / (CA.amp + CB.amp);
      const c = useA ? CA : CB;
      const dx = c.mu + c.sig * randn();
      if (dx < XMIN || dx > XMAX) return;
      P.push({ dx, y: padT * 0.55, vy: plotH * (0.16 + Math.random() * 0.12), cls: useA ? 0 : 1, counted: false });
    };

    let correct = 0, total = 0, accShown = 0.5, spawnAcc = 0;
    let last = performance.now(), t = 0, rafId;

    const drawCurve = (c, breathe) => {
      ctx.beginPath();
      for (let dx = XMIN; dx <= XMAX; dx += 0.06) { const px = xToPx(dx), py = baseY - gv(dx, c) * breathe; dx === XMIN ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
      ctx.lineTo(xToPx(XMAX), baseY); ctx.lineTo(xToPx(XMIN), baseY); ctx.closePath();
      const grad = ctx.createLinearGradient(0, padT, 0, baseY);
      grad.addColorStop(0, `rgba(${c.col[0]},${c.col[1]},${c.col[2]},0.26)`);
      grad.addColorStop(1, `rgba(${c.col[0]},${c.col[1]},${c.col[2]},0)`);
      ctx.fillStyle = grad; ctx.fill();
      ctx.beginPath();
      for (let dx = XMIN; dx <= XMAX; dx += 0.06) { const px = xToPx(dx), py = baseY - gv(dx, c) * breathe; dx === XMIN ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
      ctx.strokeStyle = `rgba(${c.col[0]},${c.col[1]},${c.col[2]},0.95)`; ctx.lineWidth = 2.4 * DPR;
      ctx.shadowColor = `rgba(${c.col[0]},${c.col[1]},${c.col[2]},0.85)`; ctx.shadowBlur = 14 * DPR;
      ctx.stroke(); ctx.shadowBlur = 0;
    };

    const draw = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      thr += ((BASE_THR + (mouseNorm - 0.5) * 2.4) - thr) * Math.min(1, dt * 3);
      const brA = 1 + 0.03 * Math.sin(t), brB = 1 + 0.03 * Math.sin(t + 1.4);

      ctx.clearRect(0, 0, W, H);
      const tx = xToPx(thr);

      // decision regions
      ctx.fillStyle = "rgba(245,138,44,0.045)"; ctx.fillRect(padL, padT, tx - padL, baseY - padT);
      ctx.fillStyle = "rgba(79,126,255,0.05)";  ctx.fillRect(tx, padT, (padL + plotW) - tx, baseY - padT);
      ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = DPR;
      ctx.beginPath(); ctx.moveTo(padL, baseY); ctx.lineTo(padL + plotW, baseY); ctx.stroke();

      drawCurve(CA, brA); drawCurve(CB, brB);

      // decision boundary
      ctx.save(); ctx.setLineDash([4 * DPR, 5 * DPR]);
      ctx.strokeStyle = "rgba(248,248,248,0.5)"; ctx.lineWidth = 1.2 * DPR;
      ctx.shadowColor = "rgba(124,92,255,0.8)"; ctx.shadowBlur = 10 * DPR;
      ctx.beginPath(); ctx.moveTo(tx, padT * 0.92); ctx.lineTo(tx, baseY); ctx.stroke(); ctx.restore();
      ctx.fillStyle = "rgba(200,214,255,0.6)"; ctx.font = `${10 * DPR}px ${MONO}`; ctx.textAlign = "center";
      ctx.fillText("decision boundary", tx, padT * 0.62);

      // stream + classify
      if (!reduce) { spawnAcc += dt; while (spawnAcc > 0.045) { spawnAcc -= 0.045; if (P.length < 170) spawn(); } }
      const mid = padT + (baseY - padT) * 0.5;
      for (let i = P.length - 1; i >= 0; i--) {
        const p = P[i];
        p.y += p.vy * dt;
        const px = xToPx(p.dx);
        const mis = (p.dx < thr ? 0 : 1) !== p.cls;
        if (!p.counted && p.y > mid) { p.counted = true; total++; if (!mis) correct++; if (total > 400) { total *= 0.6; correct *= 0.6; } }
        const fade = p.y > baseY - 30 * DPR ? Math.max(0, (baseY - p.y) / (30 * DPR)) : 1;
        const col = p.cls === 0 ? CA.col : CB.col;
        ctx.globalAlpha = 0.85 * fade;
        ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
        ctx.beginPath(); ctx.arc(px, p.y, 2.2 * DPR, 0, 7); ctx.fill();
        if (mis) { ctx.strokeStyle = "rgba(124,92,255,0.9)"; ctx.lineWidth = 1.2 * DPR; ctx.beginPath(); ctx.arc(px, p.y, 4.6 * DPR, 0, 7); ctx.stroke(); }
        ctx.globalAlpha = 1;
        if (p.y > baseY + 4 * DPR) P.splice(i, 1);
      }

      // μ markers
      [[CA, "μ₁", brA], [CB, "μ₂", brB]].forEach(([c, l, br]) => {
        ctx.fillStyle = `rgba(${c.col[0]},${c.col[1]},${c.col[2]},0.9)`; ctx.font = `${11 * DPR}px ${MONO}`; ctx.textAlign = "left";
        ctx.fillText(l, xToPx(c.mu) + 5 * DPR, baseY - gv(c.mu, c) * br - 6 * DPR);
      });

      // readouts
      const accNow = total > 0 ? correct / total : 0.5;
      accShown += (accNow - accShown) * Math.min(1, dt * 2);
      ctx.textAlign = "left"; ctx.font = `${11 * DPR}px ${MONO}`;
      ctx.fillStyle = "rgba(200,214,255,0.75)"; ctx.fillText(`accuracy ${accShown.toFixed(3)}`, padL + 6 * DPR, padT + 2 * DPR);
      ctx.fillStyle = "rgba(200,214,255,0.45)"; ctx.fillText(`epoch ${Math.floor(t * 4)} · ${accShown > 0.9 ? "converged" : "training"}`, padL + 6 * DPR, padT + 18 * DPR);
      ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.fillRect(padL + 6 * DPR, padT + 26 * DPR, 92 * DPR, 3 * DPR);
      ctx.fillStyle = "rgba(79,126,255,0.9)"; ctx.fillRect(padL + 6 * DPR, padT + 26 * DPR, 92 * DPR * accShown, 3 * DPR);

      // legend
      const lx = padL + plotW - 168 * DPR;
      ctx.fillStyle = `rgb(${CA.col[0]},${CA.col[1]},${CA.col[2]})`; ctx.beginPath(); ctx.arc(lx, padT + 0 * DPR, 3.4 * DPR, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(248,248,248,0.7)"; ctx.fillText("class A · N(μ₁,σ₁²)", lx + 10 * DPR, padT + 4 * DPR);
      ctx.fillStyle = `rgb(${CB.col[0]},${CB.col[1]},${CB.col[2]})`; ctx.beginPath(); ctx.arc(lx, padT + 18 * DPR, 3.4 * DPR, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(248,248,248,0.7)"; ctx.fillText("class B · N(μ₂,σ₂²)", lx + 10 * DPR, padT + 22 * DPR);

      if (!reduce) rafId = requestAnimationFrame(draw);
    };

    if (reduce) {
      for (let i = 0; i < 46; i++) { spawn(); const p = P[P.length - 1]; if (p) p.y = padT + Math.random() * (baseY - padT); }
      draw(performance.now());
    } else {
      rafId = requestAnimationFrame(draw);
    }

    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMouse); };
  }, [reduce]);

  return <canvas ref={canvasRef} aria-hidden="true" style={{ width: "100%", height: "100%", display: "block" }} />;
}

function Bracket({ v, h }) {
  const base = {
    position: "absolute", width: 14, height: 14, zIndex: 6, pointerEvents: "none",
    [v]: 10, [h]: 10, borderStyle: "solid", borderColor: "rgba(79,126,255,0.5)", borderWidth: 0,
  };
  base[v === "top" ? "borderTopWidth" : "borderBottomWidth"] = 1;
  base[h === "left" ? "borderLeftWidth" : "borderRightWidth"] = 1;
  return <span aria-hidden="true" style={base} />;
}

// ML formulas scattered across the hidden reveal field (kept sparse)
const REVEAL_FORMULAS = [
  { t: "P(A|B) = P(B|A)P(A)/P(B)",     x: "12%", y: "16%", c: ORANGE, s: 15 },
  { t: "σ(z) = 1/(1+e^{-z})",           x: "64%", y: "13%", c: BLUE,   s: 15 },
  { t: "∇θ J(θ) = 0",                    x: "26%", y: "44%", c: PURPLE, s: 17 },
  { t: "‖Xβ − y‖²",                      x: "16%", y: "70%", c: BLUE,   s: 17 },
  { t: "det(A − λI) = 0",                x: "70%", y: "64%", c: PURPLE, s: 15 },
  { t: "Σ  μ  σ  ∫  ∂  ∇  λ  θ",         x: "45%", y: "54%", c: WHITE,  s: 18 },
];

// The hidden layer revealed under the cursor spotlight: a faint matrix of
// live-looking numbers with a few ML formulas over a soft brand-color glow.
// Kept low-contrast so it's a subtle secret, never competing with the content.
function RevealField() {
  const rows = useMemo(() => {
    const out = [];
    for (let i = 0; i < 72; i++) {
      let line = "";
      for (let j = 0; j < 42; j++) { const n = Math.random() * 2 - 1; line += (n >= 0 ? "+" : "") + n.toFixed(3) + "  "; }
      out.push(line);
    }
    return out.join("\n");
  }, []);

  return (
    <>
      {/* soft brand-color glow field */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.6, background:
        "radial-gradient(circle at 26% 34%, rgba(79,126,255,0.16), transparent 44%)," +
        "radial-gradient(circle at 72% 28%, rgba(245,138,44,0.12), transparent 44%)," +
        "radial-gradient(circle at 44% 76%, rgba(124,92,255,0.15), transparent 44%)," +
        "radial-gradient(circle at 86% 66%, rgba(79,126,255,0.12), transparent 44%)" }} />
      {/* faint number matrix */}
      <pre aria-hidden="true" style={{ position: "absolute", inset: 0, margin: 0, padding: "24px 44px",
        fontFamily: "var(--font-mono)", fontSize: 10, lineHeight: 1.7, letterSpacing: "0.04em",
        color: "rgba(110,150,235,0.42)", whiteSpace: "pre", overflow: "hidden" }}>{rows}</pre>
      {/* a few ML formulas — dim, no glow */}
      {REVEAL_FORMULAS.map((f, i) => (
        <span key={i} aria-hidden="true" style={{ position: "absolute", left: f.x, top: f.y, transform: "translate(-50%,-50%)",
          fontFamily: "var(--font-mono)", fontStyle: "italic", fontSize: f.s, color: f.c, opacity: 0.5, whiteSpace: "nowrap" }}>{f.t}</span>
      ))}
    </>
  );
}

export default function Hero({ introDone = true }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!introDone || heroEntrancePlayed || !sectionRef.current) return;
    heroEntrancePlayed = true;
    const q = gsap.utils.selector(sectionRef.current);
    gsap.from(q(".h-rise"), { opacity: 0, y: 30, duration: 1, ease: "power3.out", stagger: 0.08, delay: 0.2, clearProps: "opacity,transform" });
    gsap.from(q(".h-eco"), { opacity: 0, scale: 0.97, duration: 1.4, ease: "power3.out", delay: 0.4, clearProps: "opacity,transform" });
  }, [introDone]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // CSS renders the mask via these vars; GSAP quickTo eases them toward the
    // cursor so the "lens" trails smoothly instead of snapping. One reusable
    // tween per prop on GSAP's shared ticker — no React re-renders, no rAF loop.
    const p = { hx: -1000, hy: -1000, mx: 0, my: 0 };
    const write = () => {
      el.style.setProperty("--hx", `${p.hx}px`);
      el.style.setProperty("--hy", `${p.hy}px`);
      el.style.setProperty("--mx", String(p.mx));
      el.style.setProperty("--my", String(p.my));
    };
    const q = (prop, dur) => gsap.quickTo(p, prop, { duration: dur, ease: "power3", onUpdate: write });
    const hxTo = q("hx", 0.5), hyTo = q("hy", 0.5);
    const mxTo = reduce ? null : q("mx", 0.6), myTo = reduce ? null : q("my", 0.6);

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      hxTo(x); hyTo(y);
      if (!reduce) { mxTo(x / r.width - 0.5); myTo(y / r.height - 0.5); }
    };
    const onLeave = () => { hxTo(-1000); hyTo(-1000); };            // lens eases off-screen
    const onScroll = () => { el.style.setProperty("--sy", String(Math.min(window.scrollY, window.innerHeight))); };

    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave, { passive: true });
    if (!reduce) window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      gsap.killTweensOf(p);
    };
  }, []);

  // depth parallax: m = mouse travel (px), s = scroll drift factor (added to Y)
  const par = (m, s = 0) => ({ transform: `translate3d(calc(var(--mx,0) * ${m}px), calc(var(--my,0) * ${m}px + var(--sy,0) * ${s}px), 0)` });

  return (
    <section ref={sectionRef} id="home" style={{
      position: "relative", minHeight: "100vh", overflow: "hidden",
      "--mx": 0, "--my": 0, "--sy": 0,
      background:
        "radial-gradient(120% 90% at 80% 34%, rgba(79,126,255,0.09), transparent 55%)," +
        "radial-gradient(90% 80% at 92% 70%, rgba(124,92,255,0.08), transparent 58%)," +
        "radial-gradient(60% 60% at 8% 78%, rgba(245,138,44,0.045), transparent 55%)," +
        "linear-gradient(165deg, #0B1020 0%, #070B18 48%, #050814 100%)",
    }}>
      {/* fine coordinate grid, masked to centre (Linear) */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.030) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.030) 1px, transparent 1px)",
        backgroundSize: "76px 76px",
        WebkitMaskImage: "radial-gradient(ellipse 78% 68% at 50% 44%, #000 18%, transparent 82%)",
        maskImage: "radial-gradient(ellipse 78% 68% at 50% 44%, #000 18%, transparent 82%)" }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 0.5px, transparent 0.5px)", backgroundSize: "19px 19px",
        WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 62% 46%, #000 8%, transparent 70%)",
        maskImage: "radial-gradient(ellipse 70% 60% at 62% 46%, #000 8%, transparent 70%)", opacity: 0.6 }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage:
          "radial-gradient(1px 1px at 18% 26%, rgba(255,255,255,0.26), transparent)," +
          "radial-gradient(1px 1px at 70% 16%, rgba(255,255,255,0.2), transparent)," +
          "radial-gradient(1px 1px at 84% 54%, rgba(255,255,255,0.16), transparent)," +
          "radial-gradient(1px 1px at 56% 74%, rgba(255,255,255,0.18), transparent)," +
          "radial-gradient(1px 1px at 33% 84%, rgba(255,255,255,0.14), transparent)," +
          "radial-gradient(1px 1px at 12% 58%, rgba(255,255,255,0.12), transparent)" }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.045, mixBlendMode: "overlay",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
      {/* drifting aurora — slow ambient life behind everything */}
      <div className="h-aurora" style={{ position: "absolute", inset: "-10%", zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(38% 40% at 68% 34%, rgba(79,126,255,0.11), transparent 70%), radial-gradient(34% 36% at 82% 66%, rgba(124,92,255,0.10), transparent 70%), radial-gradient(30% 30% at 24% 74%, rgba(245,138,44,0.05), transparent 70%)" }} />

      {/* ── cursor spotlight reveal — a hidden data/formula field shown only in a
             soft circle around the mouse (masked to the cursor position) ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        WebkitMaskImage: "radial-gradient(circle 165px at var(--hx,-1000px) var(--hy,-1000px), #000 0%, rgba(0,0,0,0.85) 30%, transparent 82%)",
        maskImage: "radial-gradient(circle 165px at var(--hx,-1000px) var(--hy,-1000px), #000 0%, rgba(0,0,0,0.85) 30%, transparent 82%)" }}>
        <RevealField />
      </div>
      {/* soft light halo following the cursor — sells the "lens" */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(circle 240px at var(--hx,-1000px) var(--hy,-1000px), rgba(120,160,255,0.07), transparent 70%)" }} />

      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(ellipse 84% 80% at 50% 46%, transparent 44%, rgba(2,3,8,0.78) 100%)" }} />

      <div className="hero-grid" style={{
        position: "relative", zIndex: 2, maxWidth: 1440, margin: "0 auto", minHeight: "100vh",
        display: "grid", gridTemplateColumns: "1.02fr 1.12fr", alignItems: "center",
        gap: "clamp(24px, 4vw, 56px)", padding: "0 clamp(24px, 5vw, 80px)",
      }}>

        {/* ── LEFT ─────────────────────────────────────────────────────────── */}
        <div style={{ position: "relative", zIndex: 3, ...par(0, 0.05) }}>
          <div className="h-rise" style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.16em", color: "rgba(191,208,255,0.5)", marginBottom: 14 }}>
            {"// BIT MESRA · 23.41°N 85.44°E · STUDENT-LED"}
            <span className="h-blink" style={{ display: "inline-block", width: 6, height: 12, marginLeft: 6, background: BLUE, verticalAlign: "middle", boxShadow: `0 0 8px ${BLUE}` }} />
          </div>

          <div className="h-rise" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 30 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, fontWeight: 500, letterSpacing: "0.34em", textTransform: "uppercase", color: "rgba(248,248,248,0.72)" }}>
              Society for
            </span>
            <span className="h-line" style={{ flex: 1, maxWidth: 160, height: 1, background: `linear-gradient(90deg, ${BLUE}, ${PURPLE}, transparent)` }} />
          </div>

          <h1 style={{ margin: 0, marginBottom: 28, lineHeight: 0.88, letterSpacing: "-0.025em" }}>
            <span className="h-rise h-shine" style={{ display: "block", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "clamp(58px, 8.4vw, 108px)",
              background: `linear-gradient(105deg, transparent 44%, rgba(255,255,255,0.62) 50%, transparent 56%), linear-gradient(180deg, ${WHITE} 0%, #C6D4FF 58%, ${BLUE} 100%)`,
              backgroundSize: "260% 100%, 100% 100%", backgroundRepeat: "no-repeat",
              WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }}>DATA</span>
            <span className="h-rise h-shine" style={{ display: "block", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "clamp(58px, 8.4vw, 108px)", animationDelay: "0.45s",
              background: `linear-gradient(105deg, transparent 44%, rgba(255,255,255,0.62) 50%, transparent 56%), linear-gradient(180deg, ${BLUE} 0%, #6E74FF 55%, ${PURPLE} 100%)`,
              backgroundSize: "260% 100%, 100% 100%", backgroundRepeat: "no-repeat",
              WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }}>SCIENCE</span>
          </h1>

          <p className="h-rise" style={{ fontFamily: "var(--font-body)", fontSize: "clamp(15px, 1.5vw, 19px)", lineHeight: 1.6, color: "rgba(248,248,248,0.62)", maxWidth: 420, marginBottom: 30 }}>
            Where curiosity meets algorithms, research, engineering and impact.
          </p>

          <div className="h-rise" style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 6 }}>
            <a href="/#connect" className="h-cta h-cta-primary" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none",
              fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: WHITE, padding: "14px 28px", borderRadius: 9,
              background: `linear-gradient(120deg, ${BLUE}, ${PURPLE})`, border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 10px 34px -12px rgba(79,126,255,0.6)" }}>
              Join SDS <span style={{ display: "inline-flex", width: 20, height: 20, alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(255,255,255,0.2)", fontSize: 12 }}>→</span>
            </a>
            <a href="/#projects" className="h-cta h-cta-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none",
              fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: "rgba(248,248,248,0.9)", padding: "14px 26px", borderRadius: 9,
              background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.13)" }}>Explore Projects</a>
          </div>
        </div>

        {/* ── RIGHT — distribution-fit schematic ───────────────────────────── */}
        <div className="h-eco" style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", minHeight: 460 }}>
          <Bracket v="top" h="left" /><Bracket v="top" h="right" /><Bracket v="bottom" h="left" /><Bracket v="bottom" h="right" />
          <div style={{ position: "absolute", top: 8, left: 30, zIndex: 6, fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.2em", color: "rgba(191,208,255,0.55)" }}>SDS · LIVE CLASSIFIER</div>
          <div style={{ position: "absolute", top: 8, right: 30, zIndex: 6, display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.2em", color: "rgba(191,208,255,0.55)" }}>
            <span className="h-blink" style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE, boxShadow: `0 0 8px ${BLUE}` }} /> LIVE
          </div>

          <div style={{ position: "absolute", inset: "12%", zIndex: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse 70% 55% at 50% 55%, rgba(124,92,255,0.14), rgba(79,126,255,0.07) 45%, transparent 66%)" }} />

          {/* faint equations */}
          <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", ...par(6, 0.16) }}>
            {EQUATIONS.map((e, i) => (
              <span key={i} style={{ position: "absolute", ...e.pos, fontFamily: "var(--font-mono)", fontStyle: "italic", fontSize: e.size, color: "rgba(200,214,255,1)", opacity: 0.07, whiteSpace: "nowrap" }}>{e.t}</span>
            ))}
          </div>

          {/* the plot — soft-masked so the curves melt into the background */}
          <div style={{ position: "absolute", inset: "8% 4%", zIndex: 3, ...par(9, 0.09), display: "flex", alignItems: "center",
            WebkitMaskImage: "radial-gradient(118% 120% at 52% 46%, #000 62%, transparent 100%)",
            maskImage: "radial-gradient(118% 120% at 52% 46%, #000 62%, transparent 100%)" }}>
            <LiveClassifier />
          </div>

          {/* identity + tech labels */}
          <div style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none", ...par(13, 0.12) }}>
            {LABELS.map((l, i) => (
              <span key={l.text} className="h-floaty" style={{ position: "absolute", left: `${l.pos.x}%`, top: `${l.pos.y}%`,
                animationDuration: `${9 + (i % 4)}s`, animationDelay: `${i * 0.6}s`, fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.2em", color: "rgba(191,208,255,0.42)" }}>{l.text}</span>
            ))}
          </div>
        </div>
      </div>

      {/* bottom fade — hero melts into the section below */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 160, zIndex: 3, pointerEvents: "none",
        background: "linear-gradient(to bottom, transparent, #050814)" }} />

      <style>{`
        @keyframes h-float { 0%,100% { transform: translate(-50%,-50%) translateY(0); } 50% { transform: translate(-50%,-50%) translateY(-10px); } }
        .h-float { animation-name: h-float; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        @keyframes h-floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
        .h-floaty { animation-name: h-floaty; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        @keyframes h-pt { 0% { opacity: 0; transform: scale(0); } 30% { opacity: 1; transform: scale(1); } 100% { opacity: 0.85; } }
        .h-pt { transform-box: fill-box; transform-origin: center; animation: h-pt 2.6s ease-out both; }
        @keyframes h-lineglow { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
        .h-line { animation: h-lineglow 4s ease-in-out infinite; }
        @keyframes h-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.2; } }
        .h-blink { animation: h-blink 1.4s steps(1,end) infinite; }
        @keyframes h-shine {
          0%   { background-position: 220% 0, 0 0; }
          26%  { background-position: -95% 0, 0 0; }
          100% { background-position: -95% 0, 0 0; }
        }
        .h-shine { animation: h-shine 6.5s ease-in-out infinite; }
        @keyframes h-aurora {
          0%,100% { transform: translate3d(0,0,0) scale(1); }
          50%     { transform: translate3d(-2.5%, 2%, 0) scale(1.07); }
        }
        .h-aurora { animation: h-aurora 24s ease-in-out infinite; }

        .h-cta { transition: transform .3s var(--ease-out,ease), box-shadow .3s, border-color .3s, background .3s; }
        .h-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 46px -12px rgba(124,92,255,0.7); }
        .h-cta-ghost:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.07); }

        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; padding-top: 112px !important; padding-bottom: 72px !important; }
          .h-eco { order: -1; max-width: 460px; margin: 0 auto; }
        }
        @media (prefers-reduced-motion: reduce) {
          .h-float, .h-floaty, .h-line, .h-blink, .h-shine, .h-aurora { animation: none !important; }
          .h-pt { animation: none !important; opacity: 0.85; }
        }
      `}</style>
    </section>
  );
}
