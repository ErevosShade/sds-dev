import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EVENTS } from "../../data/events";

gsap.registerPlugin(ScrollTrigger);

export default function Events() {
  const sectionRef  = useRef(null);
  const compassRef  = useRef(null);
  const needleRef   = useRef(null);
  const [active, setActive]   = useState(0);
  const activeRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    const compass = compassRef.current;
    const needle  = needleRef.current;
    if (!section || !compass || !needle) return;

    const total = EVENTS.length;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1.2,
          start: "top top",
          end: `+=${total * 700}`,
          onUpdate: (self) => {
            const idx = Math.min(
              Math.floor(self.progress * total),
              total - 1
            );
            if (idx !== activeRef.current) {
              activeRef.current = idx;
              setActive(idx);
            }
          },
        },
      });

      // Rotate compass 360° over the full scroll
      tl.to(compass, {
        rotation: 360,
        ease: "none",
        duration: total,
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const event = EVENTS[active];

  return (
    <section
      ref={sectionRef}
      id="events"
      style={{
        background: "var(--void)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "0 clamp(24px, 6vw, 96px)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        overflow: "hidden",
      }}
    >
      <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 6vw, 100px)", alignItems: "center" }}>

        {/* LEFT — Compass */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--amber)", marginBottom: 48, alignSelf: "flex-start",
          }}>Events</p>

          {/* Compass ring */}
          <div style={{ position: "relative", width: "clamp(260px, 30vw, 380px)", aspectRatio: "1" }}>
            {/* Outer ring */}
            <svg
              ref={compassRef}
              viewBox="0 0 300 300"
              style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
            >
              {/* Outer circle */}
              <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <circle cx="150" cy="150" r="120" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />

              {/* Tick marks — every 15 degrees */}
              {Array.from({ length: 24 }, (_, i) => {
                const angle = (i * 15 * Math.PI) / 180;
                const isMajor = i % 6 === 0;
                const r1 = 132, r2 = isMajor ? 118 : 124;
                return (
                  <line key={i}
                    x1={150 + r1 * Math.sin(angle)} y1={150 - r1 * Math.cos(angle)}
                    x2={150 + r2 * Math.sin(angle)} y2={150 - r2 * Math.cos(angle)}
                    stroke={isMajor ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}
                    strokeWidth={isMajor ? 1.5 : 0.75}
                  />
                );
              })}

              {/* Event dots on the ring */}
              {EVENTS.map((ev, i) => {
                const angle = ((i / EVENTS.length) * 360 * Math.PI) / 180;
                const r = 140;
                const isActive = i === active;
                return (
                  <circle key={i}
                    cx={150 + r * Math.sin(angle)}
                    cy={150 - r * Math.cos(angle)}
                    r={isActive ? 5 : 3}
                    fill={isActive ? ev.accentColor : "rgba(255,255,255,0.15)"}
                    style={{ transition: "all 0.4s ease", filter: isActive ? `drop-shadow(0 0 6px ${ev.accentColor})` : "none" }}
                  />
                );
              })}

              {/* Needle */}
              <line ref={needleRef}
                x1="150" y1="150"
                x2="150" y2="22"
                stroke={event?.accentColor || "var(--amber)"}
                strokeWidth="1.5"
                strokeLinecap="round"
                style={{ transformOrigin: "150px 150px", transform: `rotate(${(active / EVENTS.length) * 360}deg)`, transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}
              />

              {/* Center dot */}
              <circle cx="150" cy="150" r="4" fill="rgba(255,255,255,0.15)" />
              <circle cx="150" cy="150" r="2" fill="var(--paper-white)" />

              {/* Cardinal labels */}
              {[["N","150","20"],["E","285","155"],["S","150","290"],["W","18","155"]].map(([l,x,y]) => (
                <text key={l} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                  fill="rgba(255,255,255,0.12)" fontSize="11"
                  style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>{l}</text>
              ))}
            </svg>

            {/* Center coordinate display */}
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: 4,
            }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)", letterSpacing: "0.1em" }}>
                {event?.coordinate || "—"}
              </span>
            </div>
          </div>

          {/* Event title list */}
          <div style={{ marginTop: 40, width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
            {EVENTS.map((ev, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                cursor: "default",
                transition: "opacity 0.3s ease",
                opacity: i === active ? 1 : 0.25,
              }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", minWidth: 28 }}>0{i+1}</span>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-lg)",
                  color: i === active ? "var(--paper-white)" : "rgba(238,233,220,0.5)",
                  transition: "color 0.3s ease",
                }}>{ev.title}</span>
                {i === active && (
                  <span style={{
                    marginLeft: "auto",
                    fontFamily: "var(--font-mono)", fontSize: 10,
                    color: ev.accentColor,
                    letterSpacing: "0.06em", textTransform: "uppercase",
                  }}>{ev.tag}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Event detail card */}
        <div key={active} style={{ animation: "fadeUp 0.5s ease forwards" }}>
          <div style={{
            background: "var(--surface)",
            border: `1px solid ${event?.accentColor}28`,
            borderRadius: "var(--radius-lg)",
            padding: "clamp(28px, 3vw, 48px)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Top accent line */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg, transparent, ${event?.accentColor}80, transparent)`,
            }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: event?.accentColor,
                background: `${event?.accentColor}15`,
                border: `1px solid ${event?.accentColor}28`,
                padding: "4px 10px", borderRadius: "var(--radius-sm)",
              }}>{event?.tag}</span>

              <span style={{
                display: "flex", alignItems: "center", gap: 6,
                fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
                color: event?.status === "upcoming" ? "#E8894A" : "var(--text-muted)",
                background: event?.status === "upcoming" ? "rgba(232,137,74,0.1)" : "rgba(255,255,255,0.05)",
                border: event?.status === "upcoming" ? "1px solid rgba(232,137,74,0.25)" : "1px solid rgba(255,255,255,0.08)",
                padding: "4px 12px", borderRadius: "999px",
              }}>
                {event?.status === "upcoming" && (
                  <span className="animate-pulse-amber" style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8894A", display: "inline-block" }} />
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

            <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", minWidth: 48 }}>Date</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "rgba(238,233,220,0.55)" }}>{event?.date}</span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", minWidth: 48 }}>Venue</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "rgba(238,233,220,0.55)" }}>{event?.venue}</span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", minWidth: 48 }}>Coord</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: event?.accentColor }}>{event?.coordinate}</span>
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
        }
      `}</style>
    </section>
  );
}
