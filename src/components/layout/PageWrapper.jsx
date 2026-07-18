import { useScrollContext } from "../../context/ScrollContext";
import { useSmoothScroll } from "../../hooks/useSmoothScroll";

/**
 * PageWrapper
 * Wires the single Lenis + GSAP ticker instance (see useSmoothScroll) once
 * at the top of the tree, and shares the Lenis instance via ScrollContext
 * so other components (e.g. Navbar's anchor links) can drive it too.
 */
const PageWrapper = ({ children }) => {
  const { lenisRef } = useScrollContext();
  useSmoothScroll(lenisRef);

  return (
    <div id="scroll-container">
      {children}
    </div>
  );
};

export default PageWrapper;
