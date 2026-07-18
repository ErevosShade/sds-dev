/**
 * SDS Math Utilities
 * Core interpolation helpers used across GSAP animations,
 * cursor tracking, and scroll-driven effects.
 */

/** Linear interpolation */
export const lerp = (a, b, t) => a + (b - a) * t;

/** Clamp value between min and max */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/** Map a value from one range to another */
export const mapRange = (value, inMin, inMax, outMin, outMax) => {
  const t = (value - inMin) / (inMax - inMin);
  return outMin + clamp(t, 0, 1) * (outMax - outMin);
};

/** Normalize a value to 0–1 within a range */
export const normalize = (value, min, max) => clamp((value - min) / (max - min), 0, 1);

/** Round to N decimal places */
export const round = (value, decimals = 2) =>
  Math.round(value * 10 ** decimals) / 10 ** decimals;

/** Degrees to radians */
export const degToRad = (deg) => (deg * Math.PI) / 180;

/** Radians to degrees */
export const radToDeg = (rad) => (rad * 180) / Math.PI;

/** Distance between two 2D points */
export const dist2D = (x1, y1, x2, y2) =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

/** Get scroll progress of an element (0 = enters viewport, 1 = leaves) */
export const getScrollProgress = (element) => {
  const rect = element.getBoundingClientRect();
  const windowH = window.innerHeight;
  return clamp((windowH - rect.top) / (windowH + rect.height), 0, 1);
};

/** Smooth step (ease in-out) */
export const smoothStep = (t) => t * t * (3 - 2 * t);

/** Modulo that handles negative numbers correctly */
export const mod = (n, m) => ((n % m) + m) % m;
