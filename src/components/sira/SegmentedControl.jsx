import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * SegmentedControl — iOS-style tab switcher with a sliding pill.
 * options: [{ value, label, count? }]
 */
export default function SegmentedControl({ options, value, onChange, className, size = "md" }) {
  const layoutId = React.useId();
  const pad = size === "sm" ? "p-0.5" : "p-1";
  const btn = size === "sm" ? "px-3 py-1.5 text-xs" : "px-3.5 py-2 text-[13px]";

  return (
    <div className={cn("inline-flex items-center rounded-full bg-muted", pad, className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative z-10 flex items-center gap-1.5 rounded-full font-semibold transition-colors press",
              btn,
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${layoutId}`}
                className="absolute inset-0 -z-10 rounded-full bg-primary shadow-accent"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="whitespace-nowrap">{opt.label}</span>
            {opt.count != null && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] font-bold",
                  active ? "bg-white/25 text-primary-foreground" : "bg-foreground/10 text-muted-foreground"
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
