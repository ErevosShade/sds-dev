import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SPEAKERS } from "../../data/speakers";
import { useTextReveal } from "../../hooks/useTextReveal";

gsap.registerPlugin(ScrollTrigger);

export default function Speakers() {
  const sectionRef = useRef(null);
  const bookRef    = useRef(null);
  const pageRefs   = useRef([]);
  const [active, setActive] = useState(0);
  const reducedMotionRef = useRef(false);
  const headRef = useTextReveal();

  // Reveals speaker `idx` by setting each page's turned/unturned state directly —
  // used both for the reduced-motion click path and as the instant "get in sync"
  // step whenever a dot is clicked.
  const showSpeaker = (idx) => {
    setActive(idx);
    pageRefs.current.forEach((page, i) => {
      if (page) page.style.transform = `rotateY(${i < idx ? -180 : 0}deg)`;
    });
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || pageRefs.current.length === 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reducedMotionRef.current = reduce;

    // Reduced motion: skip the scroll-jacking pin and the 3D page-flip
    // animation entirely. The book displays speaker 0 by default; the
    // progress dots below become plain click targets (via showSpeaker) so
    // every speaker is still reachable without any motion.
    if (reduce) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          start: "top top",
          end: `+=${SPEAKERS.length * 800}`,
          onUpdate: (self) => {
            const idx = Math.min(Math.floor(self.progress * SPEAKERS.length), SPEAKERS.length - 1);
            setActive(idx);
          },
        },
      });

      pageRefs.current.forEach((page, i) => {
        tl.to(page, {
          rotateY: -180,
          duration: 1,
          ease: "power2.inOut",
          transformOrigin: "left center",
        }, i);
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="speakers"
      style={{
        background: "var(--void)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px clamp(24px, 6vw, 80px)",
        overflow: "hidden",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1100 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48 }}>
          <div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 12 }}>
              The Reading List
            </p>
            <h2 ref={headRef} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 400, color: "var(--paper-white)", lineHeight: 1.1 }}>
              Voices from the field.
            </h2>
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
            {String(active + 1).padStart(2, "0")} / {String(SPEAKERS.length).padStart(2, "0")}
          </span>
        </div>

        {/* Book */}
        <div
          ref={bookRef}
          style={{
            position: "relative",
            width: "100%",
            height: "clamp(320px, 45vh, 500px)",
            perspective: "1400px",
          }}
        >
          {/* Book base — always visible back cover */}
          <div style={{
            position: "absolute", inset: 0,
            display: "grid", gridTemplateColumns: "1fr 1fr",
            background: "var(--surface)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
          }}>
            {/* Left page — spine */}
            <div style={{
              padding: "clamp(24px, 3vw, 48px)",
              borderRight: "2px solid rgba(255,255,255,0.06)",
              display: "flex", flexDirection: "column", justifyContent: "center",
              background: "var(--surface-raised)",
            }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>
                {SPEAKERS[active]?.chapter}
              </p>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px, 2.5vw, 32px)", fontWeight: 400, color: "var(--paper-white)", lineHeight: 1.2, marginBottom: 12 }}>
                {SPEAKERS[active]?.name}
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "rgba(238,233,220,0.45)", marginBottom: 4 }}>
                {SPEAKERS[active]?.title}
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--data-blue)", letterSpacing: "0.04em" }}>
                {SPEAKERS[active]?.org}
              </p>
              <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "rgba(238,233,220,0.3)", lineHeight: 1.65, fontStyle: "italic" }}>
                  Topic: {SPEAKERS[active]?.topic}
                </p>
              </div>
            </div>

            {/* Right page — quote */}
            <div style={{
              padding: "clamp(24px, 3vw, 48px)",
              display: "flex", flexDirection: "column", justifyContent: "center",
            }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 64, color: "rgba(59,111,232,0.15)", lineHeight: 0.7, marginBottom: 20, display: "block" }}>"</span>
              <blockquote style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(16px, 2vw, 22px)",
                fontStyle: "italic",
                color: "var(--paper-white)",
                lineHeight: 1.5,
                margin: 0,
              }}>
                {SPEAKERS[active]?.quote}
              </blockquote>

              {/* Headshot — falls back to a "Photo" placeholder box if image is null */}
              <div style={{
                marginTop: "auto", paddingTop: 28,
                width: "clamp(60px, 8vw, 90px)", height: "clamp(60px, 8vw, 90px)",
                borderRadius: "50%",
                background: "var(--surface-raised)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
              }}>
                {SPEAKERS[active]?.image
                  ? <img src={SPEAKERS[active].image} alt={SPEAKERS[active].name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Photo</span>
                }
              </div>
            </div>
          </div>

          {/* Flipping pages — CSS 3D */}
          {SPEAKERS.map((_, i) => (
            <div
              key={i}
              ref={el => pageRefs.current[i] = el}
              style={{
                position: "absolute",
                top: 0, right: 0,
                width: "50%", height: "100%",
                transformStyle: "preserve-3d",
                transformOrigin: "left center",
                transform: "rotateY(0deg)",
                zIndex: SPEAKERS.length - i,
                pointerEvents: "none",
              }}
            >
              {/* Front face */}
              <div style={{
                position: "absolute", inset: 0,
                backfaceVisibility: "hidden",
                background: i % 2 === 0 ? "var(--surface)" : "var(--surface-raised)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderLeft: "none",
                borderRadius: "0 var(--radius-md) var(--radius-md) 0",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.08)" }} />
              </div>
              {/* Back face */}
              <div style={{
                position: "absolute", inset: 0,
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                background: "var(--void)",
                borderRadius: "0 var(--radius-md) var(--radius-md) 0",
              }} />
            </div>
          ))}
        </div>

        {/* Progress dots — also click targets, so reduced-motion users (and
            anyone else) can jump straight to a speaker */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
          {SPEAKERS.map((_, i) => (
            <button
              key={i}
              onClick={() => showSpeaker(i)}
              aria-label={`Show ${SPEAKERS[i].name}, ${SPEAKERS[i].chapter}`}
              aria-current={i === active}
              style={{
                width: 24,
                height: 2,
                background: i === active ? "var(--data-blue)" : "rgba(255,255,255,0.15)",
                borderRadius: 2,
                border: "none",
                padding: 0,
                cursor: "pointer",
                transform: `scaleX(${i === active ? 1 : 0.25})`,
                transformOrigin: "left center",
                transition: "transform 0.4s var(--ease-out), background 0.3s var(--ease-out)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
