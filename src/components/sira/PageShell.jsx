import React from "react";
import { cn } from "@/lib/utils";

/**
 * PageShell — the single scroll container every non-chat page uses.
 * Handles max width, horizontal padding, vertical rhythm and bottom-nav
 * clearance on mobile. Replaces the copy-pasted
 * `h-full overflow-y-auto ... mx-auto max-w-... px-4 py-6` on every page.
 */
const MAXW = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
  "2xl": "max-w-6xl",
};

export default function PageShell({
  children,
  width = "lg",
  className,
  contentClassName,
  // extra bottom padding so content clears the mobile bottom nav
  bottomPad = true,
}) {
  return (
    <div className={cn("h-full overflow-y-auto scrollbar-thin bg-background", className)}>
      <div
        className={cn(
          "mx-auto w-full px-4 pt-5 sm:px-6 sm:pt-7",
          MAXW[width],
          bottomPad ? "pb-28 md:pb-10" : "pb-6",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
