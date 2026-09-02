import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sira Button — the one interactive button primitive.
 *
 * variant: primary | gradient | study | secondary | soft | outline | ghost | danger | success | glass
 * size:    sm | md | lg | xl
 * shape:   rounded (rounded-xl) | pill (rounded-full) | soft (rounded-2xl)
 * icon / iconRight: lucide icon components rendered before / after the label
 * loading: shows a spinner and disables the button
 */
const VARIANTS = {
  primary: "bg-primary text-primary-foreground shadow-accent hover:bg-primary-strong hover:-translate-y-0.5 btn-sheen",
  gradient: "bg-sira text-white shadow-accent hover:-translate-y-0.5 btn-sheen",
  study: "bg-sira-study text-white shadow-accent hover:-translate-y-0.5 btn-sheen",
  danger: "bg-danger text-danger-foreground shadow-sm hover:-translate-y-0.5 hover:brightness-95 btn-sheen",
  success: "bg-success text-success-foreground shadow-sm hover:-translate-y-0.5 hover:brightness-95 btn-sheen",
  secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
  soft: "bg-primary-soft text-primary hover:bg-primary-soft/70",
  outline: "border border-border bg-background text-foreground hover:bg-muted hover:border-primary/50",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  glass: "glass-card border border-border/60 text-foreground hover:bg-card",
};

const SIZES = {
  sm: "h-9 px-3.5 text-xs gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-sm gap-2",
  xl: "h-14 px-6 text-base gap-2.5",
};

const SHAPES = { rounded: "rounded-xl", pill: "rounded-full", soft: "rounded-2xl" };

export default function Button({
  as: Comp = "button",
  variant = "primary",
  size = "md",
  shape = "rounded",
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}) {
  const iconSize = size === "sm" ? "h-4 w-4" : size === "xl" ? "h-5 w-5" : "h-[18px] w-[18px]";
  return (
    <Comp
      className={cn(
        "relative inline-flex select-none items-center justify-center font-semibold tracking-tight",
        "transition-all duration-200 active:scale-[0.97] focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-55",
        "[&>*]:relative [&>*]:z-[1]",
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        SHAPES[shape] || SHAPES.rounded,
        fullWidth && "w-full",
        className
      )}
      disabled={Comp === "button" ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 className={cn(iconSize, "animate-spin")} />
      ) : Icon ? (
        <Icon className={iconSize} />
      ) : null}
      {children != null && <span>{children}</span>}
      {IconRight && !loading ? <IconRight className={iconSize} /> : null}
    </Comp>
  );
}
