import { useEffect, useRef } from "react";
import { lerp } from "../utils/math";

/**
 * useMouse
 * Returns a ref containing { x, y } raw mouse position
 * and { lx, ly } lerped (smoothed) position.
 * Used by hero spotlight mask and custom cursor.
 */
export const useMouse = (lerpFactor = 0.08) => {
  const mouse = useRef({ x: 0, y: 0, lx: 0, ly: 0 });
  const rafId = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const tick = () => {
      mouse.current.lx = lerp(mouse.current.lx, mouse.current.x, lerpFactor);
      mouse.current.ly = lerp(mouse.current.ly, mouse.current.y, lerpFactor);
      rafId.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId.current);
    };
  }, [lerpFactor]);

  return mouse;
};
