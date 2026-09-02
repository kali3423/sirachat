import React from "react";
import { cn } from "@/lib/utils";

/**
 * Chip — compact pill for filters, tags and status. `tone` maps to semantic
 * colors so categories stop collapsing into one orange.
 */
const TONES = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary-soft text-primary",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning-foreground dark:text-warning",
  danger: "bg-danger/12 text-danger",
  study: "bg-study/15 text-study-foreground dark:text-study",
  focus: "bg-focus/15 text-focus",
  scheduled: "bg-scheduled/12 text-scheduled",
  completed: "bg-completed/12 text-completed",
};

export default function Chip({
  children,
  tone = "neutral",
  dot = false,
  icon: Icon,
  active = false,
  onClick,
  className,
}) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
        TONES[tone],
        onClick && "press cursor-pointer hover:brightness-95",
        active && "ring-2 ring-primary ring-offset-1 ring-offset-background",
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </Comp>
  );
}
