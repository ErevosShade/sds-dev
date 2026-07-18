import { createContext, useContext, useRef } from "react";

/**
 * ScrollContext
 * Shares the single Lenis instance across the tree (e.g. so Navbar can
 * smooth-scroll to anchor links using the same clock everything else reads).
 */
const ScrollContext = createContext(null);

export const ScrollProvider = ({ children }) => {
  const lenisRef = useRef(null); // set once useSmoothScroll's effect runs

  return (
    <ScrollContext.Provider value={{ lenisRef }}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScrollContext = () => {
  const ctx = useContext(ScrollContext);
  if (!ctx) throw new Error("useScrollContext must be used inside <ScrollProvider>");
  return ctx;
};
