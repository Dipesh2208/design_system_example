import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";
import { AppSpinner } from "./AppSpinner";

/**
 * AppButton (Stateless Atom)
 * 
 * Complies with:
 * - Pure Atomic Design: 100% Stateless (zero useState, useReducer, or useEffect).
 * - Full 13-Container Query Scale (@3xs: 16rem/256px to @7xl: 80rem/1280px).
 * - WCAG 2.1 Level AAA Target Size Criterion 2.5.5 (minimum 44x44px touch targets).
 * - Polymorphism via Radix Slot (asChild).
 * - Async protection via controlled props (disabled, isLoading).
 */

export const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 select-none outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:scale-100",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm active:bg-primary",
        payment:
          "bg-payment text-payment-foreground hover:bg-payment-hover border border-payment-border shadow-md active:bg-payment",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover border border-border shadow-2xs",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-secondary hover:text-secondary-foreground",
        ghost:
          "bg-transparent text-foreground hover:bg-secondary hover:text-secondary-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive-hover shadow-sm active:bg-destructive",
      },
      size: {
        sm: "min-h-11 px-3 text-xs gap-1.5",
        md: "min-h-11 px-4 text-sm gap-2",
        lg: "min-h-12 px-6 text-base gap-2.5",
        icon: "min-h-11 min-w-11 p-0 shrink-0",
      },
      containerResponsive: {
        true: [
          /* Base & Sub-@3xs + @3xs: 16rem (256px) - compact mini cards / narrow sidebars */
          "w-full min-h-11 px-2.5 text-xs truncate justify-center",
          /* @2xs: 18rem (288px) - small mobile containers */
          "@2xs:px-3 @2xs:text-xs",
          /* @xs: 20rem (320px) - standard narrow mobile */
          "@xs:px-3.5 @xs:text-sm",
          /* @sm: 24rem (384px) - large mobile */
          "@sm:px-4 @sm:text-sm",
          /* @md: 28rem (448px) - phablet / modal width -> transitions to inline auto */
          "@md:w-auto @md:px-4.5 @md:text-sm",
          /* @lg: 32rem (512px) - standard dialog / card */
          "@lg:px-5 @lg:text-sm",
          /* @xl: 36rem (576px) - wide card / drawer */
          "@xl:px-5.5 @xl:text-sm",
          /* @2xl: 42rem (672px) - small tablet / split pane */
          "@2xl:px-6 @2xl:text-base",
          /* @3xl: 48rem (768px) - tablet portrait */
          "@3xl:px-6.5 @3xl:text-base @3xl:gap-2.5",
          /* @4xl: 56rem (896px) - tablet landscape / compact laptop */
          "@4xl:px-7 @4xl:text-base",
          /* @5xl: 64rem (1024px) - laptop / standard desktop */
          "@5xl:min-h-12 @5xl:px-8 @5xl:text-base",
          /* @6xl: 72rem (1152px) - wide desktop */
          "@6xl:min-h-12 @6xl:px-8.5 @6xl:text-lg",
          /* @7xl: 80rem (1280px) - ultrawide container */
          "@7xl:min-h-12 @7xl:px-9 @7xl:text-lg",
        ],
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      containerResponsive: true,
    },
  }
);

export interface AppButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerResponsive?: boolean;
}

export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      containerResponsive = true,
      asChild = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isPaymentVariant = variant === "payment";
    const isDisabled = disabled || isLoading;

    if (asChild) {
      return (
        <Slot
          className={cn(
            buttonVariants({ variant, size, containerResponsive, className })
          )}
          aria-disabled={isDisabled ? "true" : undefined}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading ? "true" : undefined}
        className={cn(
          buttonVariants({ variant, size, containerResponsive, className })
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <AppSpinner size={size === "sm" ? "sm" : "md"} />
            <span className="truncate">{loadingText || children}</span>
          </>
        ) : (
          <>
            {isPaymentVariant && !leftIcon && (
              <ShieldCheck className="h-4 w-4 shrink-0 opacity-90" aria-hidden="true" />
            )}
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span className="truncate">{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

AppButton.displayName = "AppButton";
