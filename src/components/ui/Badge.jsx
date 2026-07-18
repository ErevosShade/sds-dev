import clsx from "clsx";

/**
 * Badge
 * For event tags, project tech stack labels
 */
const Badge = ({ children, color = "blue", className }) => (
  <span className={clsx("sds-badge", `sds-badge--${color}`, className)}>
    {children}
  </span>
);

export default Badge;
