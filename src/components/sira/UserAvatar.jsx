import React from "react";
import { cn } from "@/lib/utils";

/**
 * UserAvatar — image with graceful gradient-initial fallback and optional
 * presence dot. Deterministic gradient per name so each person keeps a
 * consistent color.
 */

const GRADIENTS = [
  "from-orange-500 to-rose-500",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-fuchsia-500",
  "from-sky-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-pink-500 to-rose-500",
];

function hashName(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}

const SIZES = {
  xs: "h-7 w-7 text-[11px]",
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
  "2xl": "h-28 w-28 text-4xl",
};

const DOT = {
  xs: "h-2 w-2", sm: "h-2.5 w-2.5", md: "h-3 w-3", lg: "h-3.5 w-3.5", xl: "h-5 w-5", "2xl": "h-6 w-6",
};

export default function UserAvatar({
  name = "",
  src,
  size = "md",
  status,          // 'online' | 'offline' | undefined
  ring = false,
  className,
}) {
  const [broken, setBroken] = React.useState(false);
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  const grad = GRADIENTS[hashName(name) % GRADIENTS.length];
  const showImg = src && !broken;

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-full font-bold text-white",
          SIZES[size],
          ring && "ring-2 ring-background",
          !showImg && `bg-gradient-to-br ${grad}`
        )}
      >
        {showImg ? (
          <img
            src={src}
            alt={name}
            loading="lazy"
            onError={() => setBroken(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden="true">{initial}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-background",
            DOT[size],
            status === "online" ? "bg-online" : "bg-muted-foreground/50"
          )}
          aria-label={status === "online" ? "online" : "offline"}
        >
          {status === "online" && (
            <span className={cn("block h-full w-full rounded-full bg-online animate-pulse-ring")} />
          )}
        </span>
      )}
    </div>
  );
}
