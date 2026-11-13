import * as React from "react";
import { cn } from "../lib/utils";

/**
 * AppDropdownMenu (Stateless Atom)
 * 
 * Strict Atomic Design Principle:
 * - 100% Pure Presentational Renderer.
 * - Solid opaque background (bg-popover text-popover-foreground) to prevent
 *   any glass/see-through text collisions or bleeding from the page underneath.
 * - Elevated z-50 with shadow-2xl.
 */

export interface AppDropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  align?: "left" | "right";
  children: React.ReactNode;
}

export const AppDropdownMenu = React.forwardRef<HTMLDivElement, AppDropdownMenuProps>(
  ({ className, isOpen, align = "right", children, style, ...props }, ref) => {
    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        role="menu"
        aria-orientation="vertical"
        tabIndex={-1}
        style={{
          backgroundColor: "var(--popover)",
          color: "var(--popover-foreground)",
          ...style,
        }}
        className={cn(
          "absolute z-50 mt-2 min-w-56 rounded-2xl border border-border bg-popover text-popover-foreground p-1.5 shadow-2xl transition-all outline-none",
          align === "right" ? "right-0" : "left-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AppDropdownMenu.displayName = "AppDropdownMenu";

/**
 * AppDropdownItem (Stateless Atom)
 * Pure menu item button with 100% solid, high-contrast hover & selected states.
 */
export interface AppDropdownItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSelected?: boolean;
}

export const AppDropdownItem = React.forwardRef<HTMLButtonElement, AppDropdownItemProps>(
  ({ className, isSelected, children, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        role="menuitem"
        className={cn(
          "w-full flex items-center justify-between gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-medium transition-colors text-left outline-none select-none",
          isSelected
            ? "bg-primary text-primary-foreground font-bold shadow-xs"
            : "text-popover-foreground hover:bg-secondary hover:text-secondary-foreground",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

AppDropdownItem.displayName = "AppDropdownItem";
