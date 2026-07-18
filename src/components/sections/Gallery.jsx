import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Placeholder gallery items — swap src with real image paths (see public/images/MANIFEST.md)
const GALLERY = [
  { id: 1, src: "/images/gallery/01-opening-night.svg",    caption: "DataQuest 2024 — Opening night",  aspect: "landscape" },
  { id: 2, src: "/images/gallery/02-workshop-session.svg", caption: "ML Bootcamp — Workshop session",   aspect: "portrait" },
  { id: 3, src: "/images/gallery/03-annual-summit.svg",    caption: "SDS Annual Summit",               aspect: "landscape" },
  { id: 4, src: "/images/gallery/04-kaggle-night.svg",     caption: "Kaggle Night — Final submissions", aspect: "landscape" },
  { id: 5, src: "/images/gallery/05-industry-connect.svg", caption: "Industry Connect — Panel AMA",     aspect: "portrait" },
  { id: 6, src: "/images/gallery/06-team-offsite.svg",     caption: "Team offsite — Semester close",   aspect: "landscape" },
];

const PLACEHOLDER_COLORS = [
  "#13161F","#0C0E14","#1C2030","#13161F","#0C0E14","#1C2030",
];

export default function Gallery() {
  const sectionRef  = useRef(null);
  const trackRef    = useRef(null);
  const labelRef    = useRef(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const track   = trackRef.current;
    if (!section || !track || reduceMotion) return;

    // Horizontal scroll pin — skipped entirely under reduced motion (see below,
    // the track becomes a plain natively-scrollable row instead).
    const ctx = gsap.context(() => {
      const totalScroll = track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: -totalScroll,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          start: "top top",
          end: () => `+=${totalScroll + 100}`,
          onUpdate: (self) => {
            // Update caption on scroll
            const idx = Math.min(
              Math.floor(self.progress * GALLERY.length),
              GALLERY.length - 1
            );
            if (labelRef.current) {
              labelRef.current.textContent = GALLERY[idx]?.caption || "";
            }
          },
        },
      });
    }, section);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      id="gallery"
      style={{
        background: "var(--void)",
        height: reduceMotion ? "auto" : "100vh",
        overflow: reduceMotion ? "visible" : "hidden",
        position: "relative",
        padding: reduceMotion ? "40px 0" : 0,
      }}
    >
      {/* Header — fixed inside section (in flow when reduced motion) */}
      <div style={{
        position: reduceMotion ? "relative" : "absolute", top: reduceMotion ? "auto" : 40,
        left: reduceMotion ? "auto" : "clamp(24px, 6vw, 96px)",
        padding: reduceMotion ? "0 clamp(24px, 6vw, 96px)" : 0,
        marginBottom: reduceMotion ? 24 : 0,
        zIndex: 10, pointerEvents: "none",
      }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 8 }}>
          Gallery
        </p>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 400, color: "var(--paper-white)", lineHeight: 1.1 }}>
          The memories we've cherished.
        </h2>
      </div>

      {/* Caption — bottom left, updates on scroll (hidden under reduced motion: each
          photo shows its own caption on hover instead, see the track below) */}
      {!reduceMotion && (
        <div style={{
          position: "absolute", bottom: 40, left: "clamp(24px, 6vw, 96px)",
          zIndex: 10, pointerEvents: "none",
        }}>
          <p ref={labelRef} style={{
            fontFamily: "var(--font-body)", fontSize: "var(--text-sm)",
            color: "rgba(238,233,220,0.35)", letterSpacing: "0.02em",
            transition: "opacity 0.3s var(--ease-out)",
          }}>
            {GALLERY[0].caption}
          </p>
        </div>
      )}

      {/* Progress indicator */}
      {!reduceMotion && (
        <div style={{
          position: "absolute", bottom: 40, right: "clamp(24px, 6vw, 96px)",
          zIndex: 10, display: "flex", gap: 4,
        }}>
          {GALLERY.map((_, i) => (
            <div key={i} style={{ width: 24, height: 1, background: "rgba(255,255,255,0.15)" }} />
          ))}
        </div>
      )}

      {/* Horizontal track — natively scrollable (user-controlled, no forced
          motion) when reduced motion is preferred, instead of scroll-jacked */}
      <div
        ref={trackRef}
        style={{
          position: reduceMotion ? "relative" : "absolute",
          top: 0, left: 0,
          display: "flex",
          alignItems: "center",
          height: reduceMotion ? "auto" : "100%",
          overflowX: reduceMotion ? "auto" : "visible",
          paddingLeft: "clamp(24px, 6vw, 96px)",
          gap: 16,
          willChange: reduceMotion ? "auto" : "transform",
        }}
      >
        {/* Spacer for header */}
        <div style={{ width: "clamp(24px, 6vw, 96px)", flexShrink: 0 }} />

        {GALLERY.map((item, i) => (
          <div
            key={item.id}
            style={{
              flexShrink: 0,
              height: item.aspect === "portrait" ? "clamp(320px, 55vh, 520px)" : "clamp(240px, 40vh, 380px)",
              width: item.aspect === "portrait" ? "clamp(200px, 22vw, 320px)" : "clamp(320px, 36vw, 520px)",
              background: PLACEHOLDER_COLORS[i],
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              position: "relative",
              marginTop: i % 2 === 0 ? 0 : "clamp(20px, 3vh, 48px)",
            }}
          >
            {item.src
              ? <img src={item.src} alt={item.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : (
                <div style={{
                  width: "100%", height: "100%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexDirection: "column", gap: 8,
                }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xl)", color: "rgba(255,255,255,0.04)", letterSpacing: "-0.02em" }}>
                    0{item.id}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.1)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Photo
                  </div>
                </div>
              )
            }

            {/* Hover overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(12,14,20,0.7) 0%, transparent 60%)",
              opacity: 0, transition: "opacity 0.3s var(--ease-out)",
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = "1"}
              onMouseLeave={e => e.currentTarget.style.opacity = "0"}
            >
              <p style={{
                position: "absolute", bottom: 16, left: 16, right: 16,
                fontFamily: "var(--font-body)", fontSize: "var(--text-sm)",
                color: "rgba(238,233,220,0.7)", lineHeight: 1.4,
              }}>
                {item.caption}
              </p>
            </div>
          </div>
        ))}

        {/* End spacer */}
        <div style={{ width: 80, flexShrink: 0 }} />

        {/* "See all photos" link at end of track */}
        <a href="/gallery" style={{
          flexShrink: 0, textDecoration: "none",
          height: "clamp(240px, 40vh, 380px)",
          width: "clamp(180px, 18vw, 260px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "var(--radius-md)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 12,
          transition: "border-color 0.3s var(--ease-out), background 0.3s var(--ease-out)",
          background: "transparent",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(59,111,232,0.4)"; e.currentTarget.style.background = "var(--surface)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "transparent"; }}
        >
          <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", color: "var(--paper-white)", fontStyle: "italic" }}>See all</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--data-blue)", letterSpacing: "0.1em", textTransform: "uppercase" }}>View gallery ↗</span>
        </a>
      </div>
    </section>
  );
}
