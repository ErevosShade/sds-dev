/**
 * SDSLogo — inline SVG recreation of the two gaussian bell curves.
 * Orange bell (left) overlaps Blue bell (right).
 * No raster dependency — scales infinitely clean.
 * Props: size (height in px), showWordmark (bool), wordmarkColor
 */
const SDSLogo = ({ size = 32, showWordmark = false, className = "" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }} className={className}>
    <svg
      width={size * 1.4}
      height={size}
      viewBox="0 0 56 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="SDS logo — two overlapping gaussian curves"
    >
      {/* Orange bell — left/front */}
      <path
        d="M2 36 C4 36 6 28 10 18 C13 10 16 4 20 4 C24 4 27 10 30 18 C33 26 35 34 37 36 Z"
        fill="#E8894A"
        opacity="0.95"
      />
      {/* Blue bell — right/behind */}
      <path
        d="M16 36 C18 36 20 28 24 18 C27 10 30 4 34 4 C38 4 41 10 44 18 C47 26 50 34 52 36 Z"
        fill="#3B6FE8"
        opacity="0.95"
      />
      {/* Overlap blend — darker intersection */}
      <path
        d="M25 36 C25.5 34 26 30 27 24 C28 18 29 12 30 8 C31 12 32 18 33 24 C34 30 34.5 34 35 36 Z"
        fill="#2A4FC0"
        opacity="0.5"
      />
    </svg>
    {showWordmark && (
      <span style={{
        fontFamily: "'DM Serif Display', Georgia, serif",
        fontSize: size * 0.55,
        color: "var(--paper-white)",
        letterSpacing: "0.02em",
        lineHeight: 1,
      }}>
        SDS
      </span>
    )}
  </div>
);

export default SDSLogo;
