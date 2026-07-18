/**
 * PageWrapper
 * Simple scroll container. Locomotive Scroll can be layered in
 * once all sections are stable — wiring it too early creates
 * ScrollTrigger proxy conflicts during development.
 */
const PageWrapper = ({ children }) => (
  <div id="scroll-container">
    {children}
  </div>
);

export default PageWrapper;
