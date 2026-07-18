import { useState } from "react";
import { useTextReveal } from "../../hooks/useTextReveal";

const SOCIALS = [
  { label: "Instagram", url: "#", bg: "#F2789F", glyph: "IG" },
  { label: "GitHub",    url: "#", bg: "#E8433D", glyph: "GH" },
  { label: "LinkedIn",  url: "#", bg: "#4FA3E8", glyph: "in" },
];

// One deliberate loud moment, scoped to this section only — everywhere else
// on the site stays on the restrained void/data-blue/amber palette. These
// are NOT design tokens; they exist only in Connect.
const LOUD_YELLOW = "#F4C430";
const LOUD_RED    = "#E8433D";
const LOUD_PINK   = "#F2789F";
const LOUD_BLUE   = "#4FA3E8";
const INK         = "#0C0E14"; // same hex as --void, used here as "ink on paper" rather than page background

export default function Connect() {
  const headRef = useTextReveal();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", branch: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      id="connect"
      style={{
        background: "var(--void)",
        padding: "clamp(80px, 10vw, 140px) clamp(24px, 6vw, 96px)",
      }}
    >
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", letterSpacing: "0.18em", textTransform: "uppercase", color: LOUD_RED, fontWeight: 500, marginBottom: 16 }}>
        Connect
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(48px, 7vw, 112px)", alignItems: "start" }}>
        {/* Left */}
        <div>
          <h2 ref={headRef} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 54px)", fontWeight: 400, color: "var(--paper-white)", lineHeight: 1.1, marginBottom: 24 }}>
            Ready to build<br />
            <em style={{ color: "rgba(238,233,220,0.38)", fontStyle: "italic" }}>with data?</em>
          </h2>

          <p style={{ fontFamily: "var(--font-body)", fontSize: "clamp(14px, 1.4vw, 16px)", color: "rgba(238,233,220,0.4)", lineHeight: 1.75, marginBottom: 40, maxWidth: 420 }}>
            Join 120+ students building real projects, attending workshops, and getting placed. Applications open every semester.
          </p>

          {/* Email — flat yellow sticker, black ink, folded corner */}
          <a
            href="mailto:sds@bitmesra.ac.in"
            style={{
              position: "relative",
              display: "block",
              background: LOUD_YELLOW,
              border: `2px solid ${INK}`,
              borderRadius: "var(--radius-sm)",
              padding: "16px 24px",
              textDecoration: "none",
              overflow: "hidden",
              transform: "rotate(-0.6deg)",
              transition: "transform 0.2s var(--ease-out)",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "rotate(0deg)"}
            onMouseLeave={e => e.currentTarget.style.transform = "rotate(-0.6deg)"}
          >
            <span style={{ position: "absolute", top: -14, right: -14, width: 28, height: 28, background: INK, transform: "rotate(45deg)" }} />
            <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: INK, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 6, opacity: 0.7 }}>
              Email
            </span>
            <span style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "var(--text-base)", color: INK, fontWeight: 500 }}>
              sds@bitmesra.ac.in
            </span>
          </a>

          {/* Socials — colorful rotated stamp squares, not a plain list */}
          <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
            {SOCIALS.map(({ label, url, bg, glyph }, i) => (
              <a
                key={label}
                href={url}
                aria-label={label}
                style={{
                  width: 56, height: 56,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: bg,
                  border: `2px solid ${INK}`,
                  borderRadius: "var(--radius-sm)",
                  transform: `rotate(${i % 2 === 0 ? -6 : 6}deg)`,
                  transition: "transform 0.2s var(--ease-out)",
                  textDecoration: "none",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "rotate(0deg) scale(1.06)"}
                onMouseLeave={e => e.currentTarget.style.transform = `rotate(${i % 2 === 0 ? -6 : 6}deg)`}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 500, color: INK }}>{glyph}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Right — form, styled as a paper card dropped onto the dark page */}
        <div style={{ position: "relative" }}>
          {/* Corner tabs peeking above the card */}
          <div style={{ position: "absolute", top: -14, left: 32, right: 32, display: "flex", justifyContent: "space-between", pointerEvents: "none" }}>
            <span style={{ width: 48, height: 20, background: LOUD_PINK, border: `2px solid ${INK}`, borderBottom: "none", borderRadius: "4px 4px 0 0", transform: "rotate(-3deg)" }} />
            <span style={{ width: 48, height: 20, background: LOUD_YELLOW, border: `2px solid ${INK}`, borderBottom: "none", borderRadius: "4px 4px 0 0" }} />
            <span style={{ width: 48, height: 20, background: LOUD_BLUE, border: `2px solid ${INK}`, borderBottom: "none", borderRadius: "4px 4px 0 0", transform: "rotate(3deg)" }} />
          </div>

          <div style={{
            position: "relative",
            background: "var(--paper-white)",
            border: `3px solid ${INK}`,
            borderRadius: "var(--radius-md)",
            boxShadow: `8px 8px 0 rgba(12,14,20,0.9)`,
            padding: "clamp(28px, 3.5vw, 44px)",
            transform: "rotate(0.4deg)",
          }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", color: INK, marginBottom: 12 }}>
                  We got it.
                </div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "rgba(12,14,20,0.55)" }}>
                  Someone from SDS will reach out to you soon.
                </p>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-lg)", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: INK, marginBottom: 8 }}>
                  Membership Inquiry
                </h3>
                <div style={{ height: 2, background: INK, marginBottom: 28 }} />

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {[
                    { field: "name",    label: "Name",    placeholder: "Your full name",       type: "text" },
                    { field: "email",   label: "Email",   placeholder: "you@bitmesra.ac.in",   type: "email" },
                    { field: "branch",  label: "Branch",  placeholder: "CSE / ECE / MCA / ...", type: "text" },
                  ].map(({ field, label, placeholder, type }) => (
                    <div key={field} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(12,14,20,0.5)" }}>
                        {label}
                      </label>
                      <input
                        type={type}
                        value={form[field]}
                        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                        placeholder={placeholder}
                        required={field !== "branch"}
                        style={{
                          fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "var(--text-base)",
                          color: INK,
                          background: "transparent",
                          border: "none",
                          borderBottom: `1.5px solid rgba(12,14,20,0.25)`,
                          borderRadius: 0,
                          padding: "6px 2px",
                          outline: "none",
                          transition: "border-color 0.2s var(--ease-out)",
                        }}
                        onFocus={e => e.target.style.borderColor = INK}
                        onBlur={e => e.target.style.borderColor = "rgba(12,14,20,0.25)"}
                      />
                    </div>
                  ))}

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(12,14,20,0.5)" }}>
                      Message (optional)
                    </label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="What are you interested in working on?"
                      rows={3}
                      style={{
                        fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "var(--text-base)",
                        color: INK,
                        background: "transparent",
                        border: "none",
                        borderBottom: `1.5px solid rgba(12,14,20,0.25)`,
                        borderRadius: 0,
                        padding: "6px 2px",
                        outline: "none", resize: "vertical",
                        transition: "border-color 0.2s var(--ease-out)",
                      }}
                      onFocus={e => e.target.style.borderColor = INK}
                      onBlur={e => e.target.style.borderColor = "rgba(12,14,20,0.25)"}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-press"
                    style={{
                      fontFamily: "var(--font-body)", fontSize: "var(--text-sm)",
                      fontWeight: 500,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--paper-white)",
                      background: INK,
                      border: `2px solid ${INK}`,
                      borderRadius: "var(--radius-sm)",
                      padding: "14px 28px",
                      cursor: "pointer",
                      marginTop: 8,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                      transition: "opacity 0.2s var(--ease-out)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    Send Message ➤
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Cursive tagline — reuses the site's display italic rather than a new font */}
          <p style={{
            fontFamily: "var(--font-display)", fontStyle: "italic",
            fontSize: "var(--text-lg)", color: LOUD_BLUE,
            textAlign: "center", marginTop: 24,
          }}>
            Can't wait to hear from you!
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #connect > div > div { grid-template-columns: 1fr !important; }
        }
        input::placeholder, textarea::placeholder { color: rgba(12,14,20,0.3); }
      `}</style>
    </section>
  );
}
