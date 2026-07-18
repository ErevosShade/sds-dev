import clsx from "clsx";

/**
 * Card
 * Base card primitive — used by Projects, Events, Speakers
 */
const Card = ({ children, className, elevated = false, ...props }) => (
  <div
    className={clsx("sds-card", elevated && "sds-card--elevated", className)}
    {...props}
  >
    {children}
  </div>
);

export default Card;
