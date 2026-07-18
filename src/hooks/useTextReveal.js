import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * useTextReveal
 * A clip-path "wipe" reveal for headline text — the section-title equivalent
 * of Hero's own line-stagger entrance, so sections feel like they're loading
 * in as you scroll to them rather than just appearing statically. Unlike a
 * per-word split, this never touches the element's markup (safe for
 * headlines with nested <br/>/<em> children), it just animates the whole
 * heading's clip-path + position on scroll-into-view.
 * @param {object} options - GSAP fromVars override
 * @returns ref to attach to the heading element
 */
export const useTextReveal = (options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      gsap.from(el, {
        clipPath: reduce ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
        y: reduce ? 0 : 24,
        opacity: 0,
        duration: reduce ? 0.3 : 1,
        ease: "power4.out",
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
