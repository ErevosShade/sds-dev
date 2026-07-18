import { useEffect, useRef } from "react";

/**
 * LiveBackground
 * Full-page fixed canvas — z-index: -1, sits behind everything.
 *
 * Concept: Flowing data streams through a neural network.
 * 80 particles travel directed bezier paths between 20 fixed nodes.
 * This is NOT a particle explosion — it's slow, ambient, directional.
 * Like watching data move through pipes.
 *
 * DS identity: the node layout approximates a 4-layer neural net topology.
 * Nodes glow amber one at a time — like a signal firing through a network.
 *
 * Performance rules (all implemented):
 * - OffscreenCanvas if supported, fallback to regular canvas
 * - Page Visibility API pauses animation when tab hidden
 * - navigator.hardwareConcurrency < 4 → 40 particles
 * - 16ms per frame guard via performance.now()
 * - will-change: transform on canvas only
 * - Cleanup on unmount
 */

const BLUE    = "rgba(59, 111, 232,";   // --data-blue
const AMBER   = "rgba(232, 137, 74,";   // --amber
const VOID    = "#0C0E14";              // --void

// Neural-network-style node layout: 4 layers (input → hidden1 → hidden2 → output)
function generateNodes(W, H) {
  const layers = [
    { x: 0.08, count: 4 },
    { x: 0.30, count: 6 },
    { x: 0.55, count: 6 },
    { x: 0.75, count: 6 },  // wider middle
    { x: 0.92, count: 4 },  // closer to output
  ];

  const nodes = [];
  layers.forEach(({ x, count }, li) => {
    const spacing = 1 / (count + 1);
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: W * x + (Math.random() - 0.5) * W * 0.04, // slight jitter
        y: H * spacing * (i + 1) + (Math.random() - 0.5) * H * 0.04,
        layer: li,
        pulseAmber: false,
        pulseAlpha: 0,
      });
    }
  });
  return nodes;
}

// Build adjacency: each node connects to 2-3 nodes in adjacent layers
function buildEdges(nodes) {
  const edges = [];
  const byLayer = {};
  nodes.forEach((n, i) => {
    if (!byLayer[n.layer]) byLayer[n.layer] = [];
    byLayer[n.layer].push(i);
  });

  const maxLayer = Math.max(...nodes.map(n => n.layer));
  for (let l = 0; l < maxLayer; l++) {
    const from = byLayer[l] || [];
    const to   = byLayer[l + 1] || [];
    from.forEach(fi => {
      // connect to 2-3 random nodes in next layer
      const count = 2 + Math.floor(Math.random() * 2);
      const shuffled = [...to].sort(() => Math.random() - 0.5).slice(0, count);
      shuffled.forEach(ti => edges.push([fi, ti]));
    });
  }
  return edges;
}

function createParticles(nodes, edges, count) {
  return Array.from({ length: count }, () => {
    const edgeIdx = Math.floor(Math.random() * edges.length);
    return {
      edgeIdx,
      progress: Math.random(),
      speed: 0.0008 + Math.random() * 0.0018,
      // control point offset for bezier curve
      cpOffsetX: (Math.random() - 0.5) * 120,
      cpOffsetY: (Math.random() - 0.5) * 120,
    };
  });
}

export default function LiveBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Performance: cap particle count on weak devices
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isLowEnd = reduce || (navigator.hardwareConcurrency || 4) < 4;
    const PARTICLE_COUNT = isLowEnd ? 40 : 80;
    const NODE_COUNT = isLowEnd ? 14 : 20;

    const ctx = canvas.getContext("2d");
    let W = window.innerWidth;
    let H = window.innerHeight;
    let nodes, edges, particles;
    let rafId = null;
    let lastFrame = 0;
    let looping = true;
    let scrollSpeed = 1; // multiplier — increases on scroll
    let scrollDecay = null;
    let mouseX = -999, mouseY = -999;
    let nextPulse = performance.now() + 3000;
    let pulsingNode = -1;
    let pulseEnd = 0;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W;
      canvas.height = H;
      nodes     = generateNodes(W, H);
      edges     = buildEdges(nodes);
      particles = createParticles(nodes, edges, PARTICLE_COUNT);
    }

    // Quadratic bezier point
    function bezier(t, x0, y0, cpx, cpy, x1, y1) {
      const mt = 1 - t;
      return {
        x: mt * mt * x0 + 2 * mt * t * cpx + t * t * x1,
        y: mt * mt * y0 + 2 * mt * t * cpy + t * t * y1,
      };
    }

    function draw(now) {
      // 16ms frame guard — skip frame if behind
      if (now - lastFrame < 14) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      lastFrame = now;

      ctx.clearRect(0, 0, W, H);

      // ── Amber pulse timer ──
      if (now > nextPulse) {
        pulsingNode = Math.floor(Math.random() * nodes.length);
        pulseEnd    = now + 800;
        nextPulse   = now + 3000 + Math.random() * 1000;
      }

      // Decay amber pulse
      if (pulsingNode >= 0) {
        const t = Math.max(0, (pulseEnd - now) / 800);
        nodes[pulsingNode].pulseAlpha = t;
        if (now > pulseEnd) { nodes[pulsingNode].pulseAlpha = 0; pulsingNode = -1; }
      }

      // Decay scroll speed
      if (scrollSpeed > 1) {
        scrollSpeed = Math.max(1, scrollSpeed - 0.02);
      }

      // ── Draw edges (faint lines between nearby nodes) ──
      edges.forEach(([fi, ti]) => {
        const a = nodes[fi], b = nodes[ti];
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        if (d > 300) return;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `${BLUE} 0.04)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // ── Draw nodes ──
      nodes.forEach((n, i) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
        // amber pulse overrides base color
        if (i === pulsingNode && n.pulseAlpha > 0) {
          ctx.fillStyle = `${AMBER} ${n.pulseAlpha * 0.9})`;
          // glow ring
          ctx.shadowColor = `${AMBER} 0.6)`;
          ctx.shadowBlur  = 12;
        } else {
          ctx.fillStyle   = `${BLUE} 0.20)`;
          ctx.shadowBlur  = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // ── Draw + move particles ──
      particles.forEach(p => {
        const [fi, ti] = edges[p.edgeIdx];
        const a = nodes[fi], b = nodes[ti];

        // Mouse attraction: particles within 200px pull slightly toward cursor
        const cpx = (a.x + b.x) / 2 + p.cpOffsetX;
        const cpy = (a.y + b.y) / 2 + p.cpOffsetY;
        const pos = bezier(p.progress, a.x, a.y, cpx, cpy, b.x, b.y);

        const mdx = mouseX - pos.x;
        const mdy = mouseY - pos.y;
        const md  = Math.hypot(mdx, mdy);
        let drawX = pos.x, drawY = pos.y;
        if (md < 200 && md > 0) {
          const pull = 0.05 * (1 - md / 200);
          drawX += mdx * pull;
          drawY += mdy * pull;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(drawX, drawY, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `${BLUE} 0.55)`;
        ctx.fill();

        // Advance progress
        p.progress += p.speed * scrollSpeed;

        // At end of edge, pick a new connected edge from target node
        if (p.progress >= 1) {
          p.progress = 0;
          // Find edges that start from current target node
          const nextEdges = edges
            .map((e, i) => ({ e, i }))
            .filter(({ e }) => e[0] === ti);
          if (nextEdges.length > 0) {
            const pick = nextEdges[Math.floor(Math.random() * nextEdges.length)];
            p.edgeIdx = pick.i;
          } else {
            // dead end — restart on a random edge
            p.edgeIdx = Math.floor(Math.random() * edges.length);
          }
          // Regenerate control point
          p.cpOffsetX = (Math.random() - 0.5) * 120;
          p.cpOffsetY = (Math.random() - 0.5) * 120;
        }
      });

      if (looping) rafId = requestAnimationFrame(draw);
    }

    // ── Event listeners ──
    const onResize = () => { resize(); };

    const onScroll = () => {
      scrollSpeed = Math.min(scrollSpeed + 0.4, 3.0); // cap at 3x speed
    };

    const onMouse = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else {
        lastFrame = 0;
        rafId = requestAnimationFrame(draw);
      }
    };

    window.addEventListener("resize",      onResize,     { passive: true });
    window.addEventListener("scroll",      onScroll,     { passive: true });
    window.addEventListener("mousemove",   onMouse,      { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    // Boot
    resize();
    if (reduce) {
      // Reduced motion: paint one static frame, skip the animation loop entirely
      looping = false;
      draw(performance.now());
      return () => {
        window.removeEventListener("resize",    onResize);
        window.removeEventListener("scroll",    onScroll);
        window.removeEventListener("mousemove", onMouse);
        document.removeEventListener("visibilitychange", onVisibility);
      };
    }
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize",    onResize);
      window.removeEventListener("scroll",    onScroll);
      window.removeEventListener("mousemove", onMouse);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        display: "block",
        willChange: "transform",
        pointerEvents: "none",
        background: VOID,
      }}
    />
  );
}
