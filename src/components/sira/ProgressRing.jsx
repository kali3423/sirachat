import React from "react";
import { cn } from "@/lib/utils";

/**
 * ProgressRing — SVG circular progress. `value` is 0..100.
 * Renders optional centered content (percentage, icon, etc.).
 */
export default function ProgressRing({
  value = 0,
  size = 72,
  stroke = 7,
  className,
  trackClassName = "text-muted",
  barClassName = "text-primary",
  children,
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - (pct / 100) * c;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className={trackClassName}
          stroke="currentColor"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={cn("transition-[stroke-dashoffset] duration-700 ease-out", barClassName)}
          stroke="currentColor"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      {children != null && (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  );
}
