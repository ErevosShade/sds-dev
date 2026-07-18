import { useEffect } from "react";
import { useLocomotiveContext } from "../context/LocomotiveContext";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * useLocomotive
 * Initialises Locomotive Scroll v5 (Lenis-based) and wires it
 * to GSAP ScrollTrigger via scrollerProxy + initCustomTicker.
 * Call once at the top-level layout component.
 */
export const useLocomotive = () => {
  const { scrollRef, locomotiveRef } = useLocomotiveContext();

  useEffect(() => {
    if (!scrollRef.current) return;

    let locoScroll;

    const init = async () => {
      const LocomotiveScroll = (await import("locomotive-scroll")).default;

      locoScroll = new LocomotiveScroll({
        el: scrollRef.current,
        smooth: true,
        multiplier: 1,
        class: "is-revealed",
      });

      locomotiveRef.current = locoScroll;

      // Wire ScrollTrigger proxy so GSAP reads Locomotive's scroll position
      ScrollTrigger.scrollerProxy(scrollRef.current, {
        scrollTop(value) {
          return arguments.length
            ? locoScroll.scrollTo(value, { duration: 0, disableLerp: true })
            : locoScroll.scroll.instance.scroll.y;
        },
        getBoundingClientRect() {
          return {
            top: 0, left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
        pinType: scrollRef.current.style.transform ? "transform" : "fixed",
      });

      locoScroll.on("scroll", ScrollTrigger.update);
      ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
      ScrollTrigger.refresh();
    };

    init();

    return () => {
      if (locomotiveRef.current) {
        locomotiveRef.current.destroy();
        locomotiveRef.current = null;
      }
      ScrollTrigger.removeEventListener("refresh", () => {});
    };
  }, []);
};
