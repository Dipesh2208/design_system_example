import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

/**
 * ButtonGroup (Stateless Molecule)
 * Combines multiple AppButton atoms into a cohesive responsive grouping.
 * Pure presentation, zero internal state.
 */

const buttonGroupVariants = cva("flex", {
  variants: {
    orientation: {
      horizontal: "flex-row items-center",
      vertical: "flex-col items-stretch",
      responsive: "flex-col @md:flex-row @md:items-center",
    },
    spacing: {
      none: "gap-0",
      sm: "gap-1.5",
      md: "gap-2.5",
      lg: "gap-4",
    },
    attached: {
      true: "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:-ml-[1px]",
      false: "",
    },
  },
  defaultVariants: {
    orientation: "responsive",
    spacing: "md",
    attached: false,
  },
});

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation, spacing, attached, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        className={cn(buttonGroupVariants({ orientation, spacing, attached, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = "ButtonGroup";
