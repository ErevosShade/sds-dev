import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * useSmoothScroll
 * Wires Lenis to GSAP's own ticker — ONE unified render loop, not two RAF
 * loops fighting each other. GSAP owns the clock; Lenis reads from it;
 * ScrollTrigger is notified on every Lenis tick so every scroll-driven
 * animation on the site (navbar shrink, Hero drain, Events/Gallery/Speakers
 * pins) reads the exact same interpolated scroll position instead of racing
 * against native scroll independently.
 *
 * Lenis runs in native-window mode (no custom scroller div, no
 * ScrollTrigger.scrollerProxy) — it drives the real window.scrollY each
 * frame, so ScrollTrigger's default window-based reads already see Lenis's
 * smoothed position with zero extra wiring. A proxy is only needed for a
 * transform-based virtual scroller, which is the exact complexity that got
 * this shelved before ("ScrollTrigger proxy conflicts").
 */
export const useSmoothScroll = (lenisRef) => {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // no smoothing layer at all — respects the preference outright

    const lenis = new Lenis({
      autoRaf: false, // we drive it ourselves below — see the single gsap.ticker
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3), // ease-out-cubic, matches the project's exponential-easing rule
    });

    if (lenisRef) lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      if (lenisRef) lenisRef.current = null;
    };
  }, [lenisRef]);
};
