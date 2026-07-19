import { useState } from "react";
import { useWriteReveal } from "../../hooks/useWriteReveal";

const SOCIALS = [
  { label: "Instagram", url: "#", bg: "#F2789F", glyph: "IG" },
  { label: "GitHub",    url: "#", bg: "#E8433D", glyph: "GH" },
  { label: "LinkedIn",  url: "#", bg: "#4FA3E8", glyph: "in" },
];

// One deliberate loud moment, scoped to this section only — everywhere else
// on the site stays on the restrained void/data-blue/amber palette. These
// are NOT design tokens; they exist only in Connect.
const YELLOW = "#F4C430"; // contrast accent kept for the email chip

// Terminal palette — LIGHT "Claude CLI" theme: warm cream panel with Claude's
// coral-red accent. A light card on the dark page = high contrast, and it pops.
const T_BG = "#FAF8F3", T_BAR = "#F0EDE3", T_BORDER = "rgba(20,18,14,0.12)";
const T_PROMPT = "#D9785A", T_CMD = "#26241E", T_LABEL = "rgba(38,36,30,0.5)";
const T_COMMENT = "#918A76", T_CARET = "#C9603E", T_OK = "#3F7D4E", T_DIM = "rgba(38,36,30,0.42)";
const T_BTN_TEXT = "#FBF7F1"; // cream text on the coral submit button

export default function Connect() {
  const headRef = useWriteReveal();
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
        background: "transparent",
        padding: "clamp(80px, 10vw, 140px) clamp(24px, 6vw, 96px)",
      }}
    >
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", letterSpacing: "0.18em", textTransform: "uppercase", color: T_PROMPT, fontWeight: 500, marginBottom: 16 }}>
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

          {/* Email — terminal-style command chip, matching the /join window */}
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(238,233,220,0.4)", marginBottom: 12 }}>// reach us</div>
          <a
            href="mailto:sds@bitmesra.ac.in"
            style={{
              display: "inline-flex", alignItems: "center", gap: 12, flexWrap: "wrap",
              fontFamily: "var(--font-mono)", fontSize: "clamp(13px, 1.3vw, 15px)",
              textDecoration: "none",
              padding: "14px 20px", borderRadius: 10,
              background: "rgba(244,196,48,0.06)",
              border: `1px solid ${YELLOW}66`,
              transition: "border-color 0.2s var(--ease-out), background 0.2s var(--ease-out)",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = YELLOW; e.currentTarget.style.background = "rgba(244,196,48,0.14)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${YELLOW}66`; e.currentTarget.style.background = "rgba(244,196,48,0.06)"; }}
          >
            <span style={{ color: YELLOW }}>$</span>
            <span style={{ color: "rgba(238,233,220,0.5)" }}>mail</span>
            <span style={{ color: "var(--paper-white)" }}>sds@bitmesra.ac.in</span>
            <span style={{ color: YELLOW, marginLeft: 2 }}>↗</span>
          </a>

          {/* Socials — mono command chips */}
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            {SOCIALS.map(({ label, url, glyph }) => (
              <a
                key={label}
                href={url}
                aria-label={label}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  minWidth: 54, height: 42, padding: "0 14px",
                  fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.04em",
                  color: "rgba(238,233,220,0.7)", textDecoration: "none",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  transition: "border-color 0.2s var(--ease-out), color 0.2s var(--ease-out), background 0.2s var(--ease-out)",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T_PROMPT; e.currentTarget.style.color = T_PROMPT; e.currentTarget.style.background = "rgba(217,120,90,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(238,233,220,0.7)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              >
                {glyph.toLowerCase()}
              </a>
            ))}
          </div>
        </div>

        {/* Right — membership form, reskinned as a terminal ("run to join") */}
        <div style={{ position: "relative" }}>
          <div style={{
            background: T_BG,
            border: `1px solid ${T_BORDER}`,
            borderRadius: 10,
            overflow: "hidden",
            fontFamily: "var(--font-mono)",
            boxShadow: "0 26px 64px -26px rgba(0,0,0,0.6), 0 0 46px -20px rgba(217,120,90,0.4)",
          }}>
            {/* title bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", background: T_BAR, borderBottom: `1px solid ${T_BORDER}` }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5F56" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FFBD2E" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#27C93F" }} />
              <span style={{ marginLeft: 10, fontSize: 11, letterSpacing: "0.06em", color: T_LABEL }}>sds@bitmesra: ~/join</span>
            </div>

            {/* body — Claude Code style: ✻ welcome box, bordered input fields, /command */}
            <div style={{ padding: "clamp(20px, 2.6vw, 30px)", fontSize: 13.5, lineHeight: 1.7 }}>
              {submitted ? (
                <div>
                  <div style={{ fontSize: 14, marginBottom: 12 }}><span style={{ color: T_PROMPT }}>✻</span> <span style={{ color: T_CMD, fontWeight: 600 }}>Running /join…</span></div>
                  <div style={{ border: `1px solid ${T_BORDER}`, borderRadius: 10, padding: "14px 16px", background: "rgba(255,255,255,0.5)" }}>
                    <div style={{ color: T_OK, fontWeight: 500 }}>✓ membership request queued</div>
                    <div style={{ color: T_LABEL, marginTop: 4 }}>→ we&apos;ll reach out at {form.email || "your inbox"}</div>
                  </div>
                  <div style={{ fontSize: 11, color: T_LABEL, marginTop: 12 }}>? we usually reply within 2 days</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* welcome panel */}
                  <div style={{ border: `1px solid ${T_BORDER}`, borderRadius: 10, padding: "13px 16px", marginBottom: 16, background: "rgba(255,255,255,0.5)" }}>
                    <div style={{ fontSize: 14 }}><span style={{ color: T_PROMPT }}>✻</span> <span style={{ color: T_CMD, fontWeight: 600 }}>Welcome to SDS Code</span></div>
                    <div style={{ marginTop: 6, fontSize: 12.5, color: T_LABEL }}>membership signup · run <span style={{ color: T_PROMPT }}>/join</span> to apply</div>
                  </div>

                  <div style={{ fontSize: 12.5, color: T_COMMENT, marginBottom: 14 }}># fill the fields, then run</div>

                  {[
                    { field: "name",   label: "name",   placeholder: "your full name" },
                    { field: "email",  label: "email",  placeholder: "you@bitmesra.ac.in", type: "email" },
                    { field: "branch", label: "branch", placeholder: "CSE / ECE / MCA" },
                  ].map(({ field, label, placeholder, type }) => (
                    <label key={field} className="t-field">
                      <span style={{ color: T_PROMPT, width: 52, flexShrink: 0, fontWeight: 500 }}>{label}</span>
                      <span style={{ color: T_DIM }}>›</span>
                      <input
                        type={type || "text"}
                        value={form[field]}
                        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                        placeholder={placeholder}
                        required={field !== "branch"}
                        className="t-input"
                        style={{ flex: 1, minWidth: 0, fontFamily: "inherit", fontSize: "inherit", color: T_CMD, background: "transparent", border: "none", outline: "none", caretColor: T_CARET, padding: 0 }}
                      />
                    </label>
                  ))}

                  <label className="t-field t-field--msg">
                    <span style={{ color: T_PROMPT, width: 52, flexShrink: 0, fontWeight: 500 }}>msg</span>
                    <span style={{ color: T_DIM }}>›</span>
                    <textarea
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="what do you want to build?"
                      rows={2}
                      className="t-input"
                      style={{ flex: 1, minWidth: 0, fontFamily: "inherit", fontSize: "inherit", color: T_CMD, background: "transparent", border: "none", outline: "none", caretColor: T_CARET, padding: 0, resize: "vertical", lineHeight: 1.6 }}
                    />
                  </label>

                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
                    <button
                      type="submit"
                      className="btn-press"
                      style={{ fontFamily: "inherit", fontSize: 13, letterSpacing: "0.03em", color: T_BTN_TEXT, background: T_PROMPT, border: `1px solid ${T_CARET}`, borderRadius: 7, padding: "9px 18px", cursor: "pointer", transition: "background 0.2s var(--ease-out)" }}
                      onMouseEnter={e => { e.currentTarget.style.background = T_CARET; }}
                      onMouseLeave={e => { e.currentTarget.style.background = T_PROMPT; }}
                    >
                      ⏎ /join
                    </button>
                    <span style={{ fontSize: 11, color: T_LABEL }}>↵ submit · we reply within 2 days</span>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* mono tagline, matching the terminal voice */}
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(238,233,220,0.35)", textAlign: "center", marginTop: 16 }}>
            // SDS · Society for Data Science
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #connect > div > div { grid-template-columns: 1fr !important; }
        }
        .t-input::placeholder { color: rgba(38,36,30,0.32); }
        .t-field { display: flex; align-items: center; gap: 10px; border: 1px solid rgba(20,18,14,0.14); border-radius: 8px; padding: 9px 12px; margin-bottom: 10px; background: rgba(255,255,255,0.4); cursor: text; transition: border-color 0.18s var(--ease-out), box-shadow 0.18s var(--ease-out); }
        .t-field:focus-within { border-color: #D9785A; box-shadow: 0 0 0 3px rgba(217,120,90,0.12); }
        .t-field--msg { align-items: flex-start; }
      `}</style>
    </section>
  );
}
