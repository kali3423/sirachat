import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * BottomNav — primary mobile navigation. Five thumb-reachable hubs with an
 * animated active pill, optional unread badge, and safe-area padding.
 * Hidden on md+ (desktop uses the sidebar rail).
 *
 * items: [{ to, label, icon, end?, badge? }]
 */
export default function BottomNav({ items }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 glass border-t border-border pb-safe md:hidden"
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1.5">
        {items.map(({ to, label, icon: Icon, end, badge }) => (
          <li key={to} className="flex-1">
            <NavLink to={to} end={end} className="block">
              {({ isActive }) => (
                <div className="relative flex flex-col items-center gap-1 px-1 pb-1.5 pt-2.5">
                  {isActive && (
                    <motion.span
                      layoutId="bottomnav-pill"
                      className="absolute -top-px h-0.5 w-8 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <span
                    className={cn(
                      "relative flex h-7 w-7 items-center justify-center transition-transform press",
                      isActive && "-translate-y-0.5"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-[22px] w-[22px] transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                      strokeWidth={isActive ? 2.4 : 2}
                    />
                    {badge > 0 && (
                      <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-unread px-1 text-[10px] font-bold text-white ring-2 ring-background">
                        {badge > 9 ? "9+" : badge}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-semibold leading-none transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                </div>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
