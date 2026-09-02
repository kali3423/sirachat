import React, { useEffect, useState } from "react";
import { Logo } from "@/components/sira";
import { cn } from "@/lib/utils";

/**
 * First-paint splash. Shows the brand mark centered on a mobile-sized canvas,
 * then fades out. Honors prefers-reduced-motion (shorter, no bounce).
 */
export default function Splash() {
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const hold = reduce ? 350 : 1150;
    const t1 = setTimeout(() => setFading(true), hold);
    const t2 = setTimeout(() => setHidden(true), hold + 420);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (hidden) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[120] flex flex-col items-center justify-center bg-background transition-opacity duration-400 ease-out",
        fading && "pointer-events-none opacity-0"
      )}
    >
      {/* Ambient brand glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[38%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-5 px-8">
        <div className="animate-pop rounded-[28px] shadow-float motion-reduce:animate-none">
          <Logo className="h-24 w-24" />
        </div>
        <div className="text-center">
          <p className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
            Sira<span className="text-primary">Chat</span>
          </p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">Study together</p>
        </div>
        <span className="mt-1 h-6 w-6 animate-spin rounded-full border-[2.5px] border-primary/25 border-t-primary" />
      </div>
    </div>
  );
}
