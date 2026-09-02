import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

/**
 * BottomSheet — mobile-first sheet built on vaul. Slides from the bottom with a
 * grab handle. Use for menus, pickers and quick forms instead of desktop modals.
 */
export default function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  contentClassName,
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={cn("rounded-t-3xl border-border", className)}>
        {(title || description) && (
          <DrawerHeader className="text-left">
            {title && <DrawerTitle className="font-heading">{title}</DrawerTitle>}
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
        )}
        <div className={cn("px-4 pb-[max(1rem,env(safe-area-inset-bottom))]", contentClassName)}>
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
