import * as React from "react";
import { CreditCard, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";
import { AppButton } from "../atoms/AppButton";
import { AppBadge } from "../atoms/AppBadge";

/**
 * PaymentActionCard (Stateless Molecule)
 * Combines AppButton atom + AppBadge atom + Payment metadata.
 * 100% Stateless: All actions, loading state, and success feedback are passed via props.
 */

export interface PaymentActionCardProps {
  className?: string;
  title?: string;
  description?: string;
  badgeLabel?: string;
  amountLabel: string;
  buttonLabel?: string;
  statusMessage?: string;
  isLoading?: boolean;
  loadingText?: string;
  onPay: () => void;
  disabled?: boolean;
}

export const PaymentActionCard = React.forwardRef<HTMLDivElement, PaymentActionCardProps>(
  (
    {
      className,
      title = "High-Trust Payment Trigger",
      description = "Protected against double clicking and verified via encrypted TLS gateway.",
      badgeLabel = "Encrypted TLS",
      amountLabel,
      buttonLabel,
      statusMessage,
      isLoading = false,
      loadingText = "Authorizing...",
      onPay,
      disabled = false,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn("p-4 rounded-xl bg-secondary/50 border border-border space-y-3", className)}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-payment" />
            <h3 className="text-xs font-bold uppercase tracking-wider">{title}</h3>
          </div>
          {badgeLabel && (
            <AppBadge variant="success">
              {badgeLabel}
            </AppBadge>
          )}
        </div>

        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}

        <div className="flex flex-col @md:flex-row @md:items-center gap-3">
          <AppButton
            variant="payment"
            isLoading={isLoading}
            loadingText={loadingText}
            onClick={onPay}
            disabled={disabled}
          >
            {buttonLabel || `Authorize Payment (${amountLabel})`}
          </AppButton>

          {statusMessage && (
            <span className="text-xs text-payment flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> {statusMessage}
            </span>
          )}
        </div>
      </div>
    );
  }
);

PaymentActionCard.displayName = "PaymentActionCard";
