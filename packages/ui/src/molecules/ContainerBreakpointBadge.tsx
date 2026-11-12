import * as React from "react";
import { cn } from "../lib/utils";
import { AppBadge } from "../atoms/AppBadge";

/**
 * ContainerBreakpointBadge (Stateless Molecule)
 * Combines an icon + AppBadge + description text. Zero state.
 */

export interface ContainerBreakpointBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variantLabel: string;
  widthPx: number;
  icon?: React.ReactNode;
}

export const ContainerBreakpointBadge = React.forwardRef<
  HTMLDivElement,
  ContainerBreakpointBadgeProps
>(({ className, variantLabel, widthPx, icon, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3 bg-secondary/80 px-4 py-2 rounded-xl border border-border",
        className
      )}
      {...props}
    >
      <span className="text-xs text-muted-foreground">Active Breakpoint:</span>
      <AppBadge variant="default" icon={icon} className="font-mono text-xs font-bold py-1 px-2.5">
        {variantLabel} ({widthPx}px)
      </AppBadge>
    </div>
  );
});

ContainerBreakpointBadge.displayName = "ContainerBreakpointBadge";
