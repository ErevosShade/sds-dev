import clsx from "clsx";

/**
 * Button
 * variants: "primary" | "outline" | "ghost"
 * sizes: "sm" | "md" | "lg"
 */
const Button = ({ children, variant = "primary", size = "md", className, ...props }) => {
  // TODO: implement styles using tokens
  return (
    <button className={clsx("sds-btn", `sds-btn--${variant}`, `sds-btn--${size}`, className)} {...props}>
      {children}
    </button>
  );
};

export default Button;
