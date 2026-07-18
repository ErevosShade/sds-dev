import { createContext, useContext, useRef, useState } from "react";

/**
 * LocomotiveContext
 * Shares the Locomotive Scroll instance across the tree.
 * Consumed by useLocomotive hook and ScrollTrigger proxy setup.
 */
const LocomotiveContext = createContext(null);

export const LocomotiveProvider = ({ children }) => {
  const scrollRef = useRef(null);       // ref for the scroll container DOM node
  const locomotiveRef = useRef(null);   // the Locomotive Scroll instance

  return (
    <LocomotiveContext.Provider value={{ scrollRef, locomotiveRef }}>
      {children}
    </LocomotiveContext.Provider>
  );
};

export const useLocomotiveContext = () => {
  const ctx = useContext(LocomotiveContext);
  if (!ctx) throw new Error("useLocomotiveContext must be used inside <LocomotiveProvider>");
  return ctx;
};
