import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import gsap from "gsap";
import { useScrollContext } from "../../context/ScrollContext";
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
  const { lenisRef } = useScrollContext();

  // Same-page hash links (e.g. "/#events") would otherwise jump instantly via
  // native browser anchor behavior, which feels disconnected next to Lenis's
  // smoothed wheel scroll. Route them through the same Lenis instance instead
  // — one scroll feel across every interaction, not just wheel/touch.
  const handleAnchorClick = (e, to) => {
    if (!to.includes("#")) return;
    const [path, hash] = to.split("#");
    const onHome = location.pathname === "/" || location.pathname === "";
    if (!onHome || (path && path !== "/")) return; // cross-page hash — let normal navigation happen
    const target = document.getElementById(hash);
    if (!target || !lenisRef.current) return;
    e.preventDefault();
    lenisRef.current.scrollTo(target, { offset: -20 });
  };

  // Drive the shrink threshold directly off window.scrollY, read on every
  // tick of the same GSAP ticker that already powers Lenis/ScrollTrigger
  // elsewhere on the page (see useSmoothScroll). Confirmed via console
  // logging: an earlier version of this effect gated registration behind
  // `document.fonts.ready.then(...)` — an async callback. React's dev-only
  // StrictMode double-invoke (mount → cleanup → mount) raced against that
  // `.then()`, so the first mount's tick could register on gsap.ticker
  // before its own cleanup tore it down, leaving two independent tick
  // closures alive briefly (each driving its own orphaned `floating` state)
  // — logged as two near-identical "expanded -> shrunk" transitions 2ms
  // apart. Registering synchronously here closes that gap: StrictMode's
  // double-invoke has no async window to race across, so cleanup always
  // removes the first tick before the second one is added.
  useEffect(() => {
    const SHRINK_AT = 80;
    const EXPAND_AT = 40;

    const tick = () => {
      const y = window.scrollY;
      setFloating((prev) => {
        if (!prev && y > SHRINK_AT) return true;
        if (prev && y < EXPAND_AT) return false;
        return prev;
      });
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMenuOpen(false), [location]);

  // Immersed → floating morph. Signature moment: full GSAP, not CSS transition.
  // Outer element only positions; the inner bar is what actually shrinks/rounds,
  // since a fixed box with left:0/right:0 won't shrink via max-width + auto margins.
  //
  // Width must be a plain pixel number, not the CSS `min(1080px, calc(100% -
  // 48px))` string this used to be. GSAP can only numerically interpolate
  // between two values that share the same structure — going from "100%" to
  // that min()/calc() expression has no common numeric skeleton, so GSAP just
  // snapped width instantly to its end value while every sibling property
  // (margin, padding, radius, background, border, shadow) kept animating
  // smoothly over the full duration. That mismatch — the box instantly
  // narrowing while everything else was still mid-tween — is what read as
  // "shrinks completely, then reopens, then resettles."
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const floatingWidth = () => Math.min(1080, window.innerWidth - 48);

    gsap.killTweensOf(nav); // guarantee a new toggle never races a half-finished tween
    gsap.to(nav, floating ? {
      marginTop: 14,
      width: floatingWidth(),
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

    // Width is now a computed pixel number rather than a self-adjusting CSS
    // min()/calc() string, so it needs a resize listener to stay responsive
    // while shrunk — snap (no animation) rather than tween, since a resize
    // isn't a shrink/expand transition.
    const onResize = () => {
      if (floating) gsap.set(nav, { width: floatingWidth() });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
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
        transition: "backdrop-filter 0.5s var(--ease-out)",
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
        <SDSLogo size={28} showWordmark />
      </Link>

      {/* Desktop links */}
      <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="sds-nav-links">
        {NAV_LINKS.map(({ label, to }) => (
          <a
            key={label}
            href={to}
            onClick={e => handleAnchorClick(e, to)}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              fontWeight: 400,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "rgba(238,233,220,0.55)",
              textDecoration: "none",
              transition: "color 0.2s var(--ease-out)",
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
        onClick={e => handleAnchorClick(e, "/#connect")}
        className="btn-press"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-sm)",
          letterSpacing: "0.06em",
          color: "var(--paper-white)",
          textDecoration: "none",
          padding: "8px 20px",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: "var(--radius-sm)",
          transition: "background 0.2s var(--ease-out), border-color 0.2s var(--ease-out)",
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
          <span key={i} style={{ display: "block", width: 22, height: 1.5, background: "var(--paper-white)", transition: "all 0.3s var(--ease-out)",
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
            <a key={label} href={to} onClick={e => { handleAnchorClick(e, to); setMenuOpen(false); }}
              style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)", color: "var(--paper-white)", textDecoration: "none" }}>
              {label}
            </a>
          ))}
          <a href="/#connect" onClick={e => { handleAnchorClick(e, "/#connect"); setMenuOpen(false); }}
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
