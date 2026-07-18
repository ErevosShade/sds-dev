import { useRef, useState } from "react";
import { useReveal } from "../../hooks/useReveal";

const SOCIAL_LINKS = [
  { label: "Instagram", handle: "@sds.bitmesra", url: "#", color: "var(--amber)" },
  { label: "LinkedIn",  handle: "SDS BIT Mesra", url: "#", color: "var(--data-blue)" },
  { label: "GitHub",    handle: "sds-bitmesra",  url: "#", color: "var(--paper-white)" },
];

export default function Connect() {
  const headRef = useReveal();
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
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 16 }}>
        Connect
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(48px, 7vw, 112px)", alignItems: "start" }}>
        {/* Left */}
        <div>
          <h2 ref={headRef} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 54px)", fontWeight: 400, color: "var(--paper-white)", lineHeight: 1.1, marginBottom: 24 }}>
            Ready to build<br />
            <em style={{ color: "rgba(238,233,220,0.38)", fontStyle: "italic" }}>with data?</em>
          </h2>

          <p style={{ fontFamily: "var(--font-body)", fontSize: "clamp(14px, 1.4vw, 16px)", color: "rgba(238,233,220,0.4)", lineHeight: 1.75, marginBottom: 48, maxWidth: 420 }}>
            Join 120+ students building real projects, attending workshops, and getting placed. Applications open every semester.
          </p>

          {/* Social links */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {SOCIAL_LINKS.map(({ label, handle, url, color }) => (
              <a key={label} href={url} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                textDecoration: "none",
                transition: "opacity 0.2s",
                opacity: 1,
                cursor: "pointer",
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.6"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "rgba(238,233,220,0.45)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color }}>{handle} ↗</span>
              </a>
            ))}
          </div>

          {/* Contact info */}
          <div style={{ marginTop: 40, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
              Email
            </p>
            <a href="mailto:sds@bitmesra.ac.in" style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-base)", color: "var(--data-blue)", textDecoration: "none" }}>
              sds@bitmesra.ac.in
            </a>
          </div>
        </div>

        {/* Right — form */}
        <div>
          {submitted ? (
            <div style={{
              background: "var(--surface)", border: "1px solid rgba(59,111,232,0.2)",
              borderRadius: "var(--radius-lg)", padding: "48px 36px",
              textAlign: "center",
            }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", color: "var(--paper-white)", marginBottom: 12 }}>
                We got it.
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "rgba(238,233,220,0.4)" }}>
                Someone from SDS will reach out to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { field: "name",    label: "Name",    placeholder: "Your full name",       type: "text" },
                { field: "email",   label: "Email",   placeholder: "you@bitmesra.ac.in",   type: "email" },
                { field: "branch",  label: "Branch",  placeholder: "CSE / ECE / MCA / ...", type: "text" },
              ].map(({ field, label, placeholder, type }) => (
                <div key={field} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)" }}>
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={placeholder}
                    required={field !== "branch"}
                    style={{
                      fontFamily: "var(--font-body)", fontSize: "var(--text-sm)",
                      color: "var(--paper-white)",
                      background: "var(--surface)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "var(--radius-sm)",
                      padding: "12px 16px",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor = "var(--data-blue)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                  />
                </div>
              ))}

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)" }}>
                  Message (optional)
                </label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="What are you interested in working on?"
                  rows={4}
                  style={{
                    fontFamily: "var(--font-body)", fontSize: "var(--text-sm)",
                    color: "var(--paper-white)",
                    background: "var(--surface)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "var(--radius-sm)",
                    padding: "12px 16px",
                    outline: "none", resize: "vertical",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--data-blue)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                />
              </div>

              <button
                type="submit"
                style={{
                  fontFamily: "var(--font-body)", fontSize: "var(--text-sm)",
                  letterSpacing: "0.04em",
                  color: "var(--paper-white)",
                  background: "var(--data-blue)",
                  border: "1px solid var(--data-blue)",
                  borderRadius: "var(--radius-sm)",
                  padding: "13px 28px",
                  cursor: "pointer",
                  marginTop: 4,
                  alignSelf: "flex-start",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                Send →
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #connect > div > div { grid-template-columns: 1fr !important; }
        }
        input::placeholder, textarea::placeholder { color: rgba(238,233,220,0.2); }
      `}</style>
    </section>
  );
}
