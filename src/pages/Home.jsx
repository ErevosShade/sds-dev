import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Hero          from "../components/sections/Hero";
import AboutUs       from "../components/sections/AboutUs";
import Events        from "../components/sections/Events";
import Speakers      from "../components/sections/Speakers";
import Projects      from "../components/sections/Projects";
import Testimonials  from "../components/sections/Testimonials";
import Sponsors      from "../components/sections/Sponsors";
import Gallery       from "../components/sections/Gallery";
import Connect       from "../components/sections/Connect";

gsap.registerPlugin(ScrollTrigger);

// Sections whose inner content is ScrollTrigger-pinned — a transform on their
// wrapper would break the pin's position:fixed, so they get opacity-only.
const PINNED = new Set(["events", "gallery", "speakers"]);

const Home = ({ introDone = true }) => {
  const mainRef = useRef(null);

  // Scroll-linked reveals for every section: rise + fade in as it enters on the
  // way down, and fade back out as you scroll up past it (toggleActions reverse)
  // — content only occupies attention while it's in view.
  useEffect(() => {
    const root = mainRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      root.querySelectorAll("section[id]").forEach((el) => {
        if (el.id === "home") return; // hero runs its own intro
        const opacityOnly = PINNED.has(el.id);
        gsap.from(el, {
          opacity: 0,
          ...(opacityOnly ? {} : { y: 48 }),
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            end: "bottom 15%",
            toggleActions: "play none none reverse",
          },
        });
      });
      ScrollTrigger.refresh();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={mainRef}>
      <Hero introDone={introDone} />
      <AboutUs />
      <Events />
      <Speakers />
      <Projects />
      <Testimonials />
      <Sponsors />
      <Gallery />
      <Connect />
    </main>
  );
};

export default Home;
