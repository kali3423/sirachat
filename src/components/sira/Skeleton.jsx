import React from "react";
import { cn } from "@/lib/utils";

/** Skeleton primitives that match the real UI shapes (shimmer sweep). */

export function SkeletonBox({ className }) {
  return <div className={cn("skeleton-shimmer rounded-md bg-muted", className)} />;
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox key={i} className={cn("h-3.5", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

/** A conversation-row shaped skeleton. */
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-3 py-3">
      <SkeletonBox className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <SkeletonBox className="h-3.5 w-1/3" />
        <SkeletonBox className="h-3 w-2/3" />
      </div>
      <SkeletonBox className="h-3 w-8" />
    </div>
  );
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4", className)}>
      <div className="flex items-center gap-3">
        <SkeletonBox className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonBox className="h-3.5 w-2/5" />
          <SkeletonBox className="h-3 w-3/5" />
        </div>
      </div>
    </div>
  );
}

export default SkeletonBox;
