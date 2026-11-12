import * as React from "react";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

/**
 * AppSpinner (Stateless Atom)
 * Pure presentational indicator. Zero state.
 */

const spinnerVariants = cva("animate-spin shrink-0 text-current", {
  variants: {
    size: {
      sm: "h-3.5 w-3.5",
      md: "h-4 w-4",
      lg: "h-5 w-5",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface AppSpinnerProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {}

export const AppSpinner = React.forwardRef<SVGSVGElement, AppSpinnerProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <Loader2
        ref={ref}
        aria-hidden="true"
        className={cn(spinnerVariants({ size, className }))}
        {...props}
      />
    );
  }
);

AppSpinner.displayName = "AppSpinner";
