import React from "react";
import { cn } from "@/lib/utils";

/**
 * IconButton — square, tap-friendly icon control with consistent sizing and
 * variants. Always give it an `aria-label`.
 */
const VARIANTS = {
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  soft: "bg-muted text-foreground hover:bg-muted/70",
  primary: "bg-primary text-primary-foreground shadow-accent hover:bg-primary-strong",
  "primary-soft": "bg-primary-soft text-primary hover:bg-primary/15",
  danger: "text-danger hover:bg-danger/10",
  glass: "glass-card text-foreground hover:bg-card",
};

const SIZES = {
  sm: "h-8 w-8 [&_svg]:h-4 [&_svg]:w-4",
  md: "h-10 w-10 [&_svg]:h-5 [&_svg]:w-5",
  lg: "h-11 w-11 [&_svg]:h-5 [&_svg]:w-5",
};

const IconButton = React.forwardRef(function IconButton(
  { children, variant = "ghost", size = "md", className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-colors press disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

export default IconButton;
