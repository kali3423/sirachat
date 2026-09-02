import React from "react";
import { cn } from "@/lib/utils";

/** EmptyState — friendly, on-brand empty screens with an optional CTA. */
export default function EmptyState({
  icon: Icon,
  emoji,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/30 px-6 py-14 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary shadow-soft">
        {emoji ? (
          <span className="text-3xl emoji" aria-hidden="true">{emoji}</span>
        ) : Icon ? (
          <Icon className="h-8 w-8" />
        ) : null}
      </div>
      <h3 className="font-heading text-base font-bold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
