import React, { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Sira Chat brand mark — an orange chat-bubble ring wrapped around an open
 * book on a soft cream tile. Rendered as a crisp inline SVG so it scales
 * perfectly at any size, and transparently upgrades to the real raster art
 * if a file is dropped at `public/logo.png` (no broken-image flash: the SVG
 * shows until the raster actually loads).
 */
export default function Logo({ className = "h-9 w-9", withWordmark = false, wordmarkClassName }) {
  const id = React.useId();
  const [raster, setRaster] = useState(false);

  const g = (n) => `sira-${n}-${id}`;

  const mark = (
    <span className={cn("relative inline-block shrink-0 overflow-hidden rounded-[23%]", className)}>
      {/* Raster override — invisible until it loads successfully */}
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        onLoad={() => setRaster(true)}
        onError={() => setRaster(false)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
          raster ? "opacity-100" : "opacity-0"
        )}
      />
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-full w-full transition-opacity duration-200", raster ? "opacity-0" : "opacity-100")}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={g("tile")} x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFDF9" />
            <stop offset="1" stopColor="#F1EADF" />
          </linearGradient>
          <linearGradient id={g("ring")} x1="120" y1="70" x2="400" y2="430" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFA23A" />
            <stop offset="0.55" stopColor="#FF7A12" />
            <stop offset="1" stopColor="#F0530A" />
          </linearGradient>
          <linearGradient id={g("book")} x1="150" y1="190" x2="360" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFC069" />
            <stop offset="0.5" stopColor="#FF8A2A" />
            <stop offset="1" stopColor="#FF6A12" />
          </linearGradient>
        </defs>

        {/* Cream tile */}
        <rect x="16" y="16" width="480" height="480" rx="116" fill={`url(#${g("tile")})`} />
        <rect x="16.5" y="16.5" width="479" height="479" rx="115.5" fill="none" stroke="#000000" strokeOpacity="0.05" />

        {/* Speech-bubble tail (lower-left) */}
        <path
          d="M150 374 C150 344 158 328 178 308 L226 348 C206 366 182 376 150 374 Z"
          fill={`url(#${g("ring")})`}
        />
        {/* Chat-bubble ring */}
        <circle cx="256" cy="238" r="150" fill="none" stroke={`url(#${g("ring")})`} strokeWidth="42" />

        {/* Open book */}
        <path
          d="M256 200 C230 186 196 181 166 185 C156 186 149 194 149 204 L149 286 C149 286 192 279 224 288 C238 292 250 299 256 304 Z"
          fill={`url(#${g("book")})`}
        />
        <path
          d="M256 200 C282 186 316 181 346 185 C356 186 363 194 363 204 L363 286 C363 286 320 279 288 288 C274 292 262 299 256 304 Z"
          fill={`url(#${g("book")})`}
        />
        <path d="M256 200 L256 304" stroke="#E8560A" strokeOpacity="0.35" strokeWidth="6" strokeLinecap="round" />
      </svg>
    </span>
  );

  if (!withWordmark) return mark;
  return (
    <span className="inline-flex items-center gap-2.5">
      {mark}
      <span className={cn("font-heading text-lg font-extrabold tracking-tight text-foreground", wordmarkClassName)}>
        Sira<span className="text-primary">Chat</span>
      </span>
    </span>
  );
}
