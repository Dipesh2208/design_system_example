import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

/**
 * AppInput (Stateless Atom)
 * Pure presentation form text input. Controlled entirely via props. Zero internal state.
 */

const inputVariants = cva(
  "flex w-full rounded-lg border border-border bg-card px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      inputSize: {
        sm: "h-9 text-xs",
        md: "h-11 text-sm",
        lg: "h-12 text-base",
      },
    },
    defaultVariants: {
      inputSize: "md",
    },
  }
);

export interface AppInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

export const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(
  ({ className, type = "text", inputSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ inputSize, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

AppInput.displayName = "AppInput";
