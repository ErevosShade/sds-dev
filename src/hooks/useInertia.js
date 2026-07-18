import { useEffect, useRef } from "react";
import { lerp } from "../utils/math";

/**
 * useInertia
 * Applies lerp-based inertia to any numeric value.
 * Useful for scroll-driven parallax and smooth number counters.
 * @param {number} target - target value
 * @param {number} factor - lerp factor (0.01 sluggish → 0.2 snappy)
 * @returns ref containing { current: value }
 */
export const useInertia = (target, factor = 0.1) => {
  const value = useRef(target);
  const rafId = useRef(null);

  useEffect(() => {
    const tick = () => {
      value.current = lerp(value.current, target, factor);
      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [target, factor]);

  return value;
};
