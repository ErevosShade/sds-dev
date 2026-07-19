/**
 * PageBackground
 * One premium, sleek dark backdrop shared by the ENTIRE page. Fixed behind all
 * content (every section wrapper is transparent) so scrolling reveals a single
 * continuous surface instead of a stack of separate panels.
 *
 * Layers: a deep-navy vertical base, faint edge-anchored colour glows (blue /
 * violet / a whisper of amber) for depth, a barely-there noise grain, and a
 * vignette. Everything is kept very low-contrast on purpose — this is the
 * canvas the content sits on, and it's dark enough that the Events dial's blue
 * (and the hero accents) read as vivid against it.
 *
 * Fixed to the viewport, so the glows stay put as you scroll — the page feels
 * lit by a consistent room rather than repainting per section.
 */
export default function PageBackground() {
  return (
    <div aria-hidden="true" style={{
      position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none",
      background: "linear-gradient(180deg, #080B15 0%, #06080F 52%, #04060C 100%)",
    }}>
      {/* edge-anchored colour glows — cinematic depth */}
      <div style={{ position: "absolute", inset: 0,
        background:
          "radial-gradient(48% 36% at 85% 6%, rgba(79,126,255,0.07), transparent 62%)," +
          "radial-gradient(44% 40% at 8% 32%, rgba(124,92,255,0.055), transparent 62%)," +
          "radial-gradient(52% 42% at 92% 70%, rgba(79,126,255,0.05), transparent 62%)," +
          "radial-gradient(40% 38% at 12% 90%, rgba(245,138,44,0.028), transparent 62%)" }} />
      {/* faint noise grain */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.035, mixBlendMode: "overlay",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
      {/* vignette — corners settle into darkness */}
      <div style={{ position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 92% 82% at 50% 38%, transparent 58%, rgba(2,3,7,0.55) 100%)" }} />
    </div>
  );
}
