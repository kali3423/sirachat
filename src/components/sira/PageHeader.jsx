import React from "react";
import { cn } from "@/lib/utils";

/**
 * PageHeader — consistent screen title block used across pages.
 * `eyebrow` = small section label, `title` = screen title, `subtitle` = one line,
 * `actions` = right-aligned controls (e.g. a New button).
 */
export default function PageHeader({ eyebrow, title, subtitle, actions, icon: Icon, className }) {
  return (
    <div className={cn("mb-6 flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            {eyebrow}
          </p>
        )}
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Icon className="h-5 w-5" />
            </span>
          )}
          <h1 className="font-heading text-[22px] font-extrabold leading-tight tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
