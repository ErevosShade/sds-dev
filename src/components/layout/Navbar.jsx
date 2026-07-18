import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import gsap from "gsap";
import SDSLogo from "../ui/SDSLogo";

const NAV_LINKS = [
  { label: "Home",     to: "/" },
  { label: "Events",   to: "/#events" },
  { label: "About Us", to: "/#about" },
  { label: "Team",     to: "/team" },
];

export default function Navbar() {
  const [floating, setFloating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setFloating(window.scrollY > 72);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMenuOpen(false), [location]);

  // Immersed → floating morph. Signature moment: full GSAP, not CSS transition.
  // Outer element only positions; the inner bar is what actually shrinks/rounds,
  // since a fixed box with left:0/right:0 won't shrink via max-width + auto margins.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    gsap.to(nav, floating ? {
      marginTop: 14,
      width: "min(1080px, calc(100% - 48px))",
      borderRadius: 14,
      paddingLeft: 28,
      paddingRight: 28,
      backgroundColor: "rgba(19,22,31,0.68)",
      borderColor: "rgba(238,233,220,0.08)",
      boxShadow: "0 16px 48px -12px rgba(0,0,0,0.55)",
      duration: 0.6,
      ease: "power3.out",
    } : {
      marginTop: 0,
      width: "100%",
      borderRadius: 0,
      paddingLeft: 40,
      paddingRight: 40,
      backgroundColor: "rgba(12,14,20,0)",
      borderColor: "rgba(238,233,220,0)",
      boxShadow: "0 0 0 rgba(0,0,0,0)",
      duration: 0.5,
      ease: "power2.inOut",
    });
  }, [floating]);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: "var(--z-nav)", display: "flex", justifyContent: "center" }}>
    <nav
      ref={navRef}
      style={{
        width: "100%",
        margin: "0 auto",
        padding: "0 40px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "rgba(238,233,220,0)",
        backdropFilter: floating ? "blur(18px) saturate(140%)" : "none",
        WebkitBackdropFilter: floating ? "blur(18px) saturate(140%)" : "none",
        transition: "backdrop-filter 0.5s ease",
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
        <SDSLogo size={28} showWordmark />
      </Link>

      {/* Desktop links */}
      <div style={{ display: "flex", alignItems: "center", gap: 36 }} className="sds-nav-links">
        {NAV_LINKS.map(({ label, to }) => (
          <a
            key={label}
            href={to}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              fontWeight: 400,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "rgba(238,233,220,0.55)",
              textDecoration: "none",
              transition: "color 0.2s ease",
              cursor: "pointer",
            }}
            onMouseEnter={e => e.target.style.color = "var(--paper-white)"}
            onMouseLeave={e => e.target.style.color = "rgba(238,233,220,0.55)"}
          >
            {label}
          </a>
        ))}
      </div>

      {/* CTA */}
      <a
        href="/#connect"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-sm)",
          letterSpacing: "0.06em",
          color: "var(--paper-white)",
          textDecoration: "none",
          padding: "8px 20px",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: "var(--radius-sm)",
          transition: "background 0.2s ease, border-color 0.2s ease",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "var(--data-blue)";
          e.currentTarget.style.borderColor = "var(--data-blue)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
        }}
      >
        Connect ↗
      </a>

      {/* Mobile hamburger */}
      <button
        className="sds-hamburger"
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle menu"
        style={{ display: "none", flexDirection: "column", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 8 }}
      >
        {[0,1,2].map(i => (
          <span key={i} style={{ display: "block", width: 22, height: 1.5, background: "var(--paper-white)", transition: "all 0.3s ease",
            transform: menuOpen ? (i===0 ? "rotate(45deg) translateY(9px)" : i===2 ? "rotate(-45deg) translateY(-9px)" : "scaleX(0)") : "none",
          }} />
        ))}
      </button>

      {/* Mobile overlay */}
      {menuOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(12,14,20,0.97)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 40,
        }}>
          {NAV_LINKS.map(({ label, to }) => (
            <a key={label} href={to} onClick={() => setMenuOpen(false)}
              style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)", color: "var(--paper-white)", textDecoration: "none" }}>
              {label}
            </a>
          ))}
          <a href="/#connect" onClick={() => setMenuOpen(false)}
            style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--data-blue)", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}>
            Connect ↗
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .sds-nav-links { display: none !important; }
          .sds-hamburger { display: flex !important; }
        }
      `}</style>
    </nav>
    </div>
  );
}
