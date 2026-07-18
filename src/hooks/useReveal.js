import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * useReveal
 * Attaches a GSAP fade-up reveal to a ref'd element.
 * @param {object} options - GSAP fromVars override
 * @returns ref to attach to the element
 */
export const useReveal = (options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      gsap.from(el, {
        opacity: 0,
        y: reduce ? 0 : 32,
        duration: reduce ? 0.3 : 0.9,
        ease: "power3.out",
        ...options,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
          ...options.scrollTrigger,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return ref;
};
