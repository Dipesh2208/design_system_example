import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PaymentActionCard } from "../PaymentActionCard";

describe("PaymentActionCard (Molecule)", () => {
  it("renders title, description, amount, and badge", () => {
    render(
      <PaymentActionCard
        amountLabel="$499.00 USD"
        onPay={() => {}}
      />
    );

    expect(screen.getByText("High-Trust Payment Trigger")).toBeInTheDocument();
    expect(screen.getByText(/Authorize Payment \(\$499\.00 USD\)/)).toBeInTheDocument();
    expect(screen.getByText("Encrypted TLS")).toBeInTheDocument();
  });

  it("triggers onPay callback on payment button click", () => {
    const handlePay = vi.fn();
    render(
      <PaymentActionCard
        amountLabel="$99.00"
        buttonLabel="Authorize Card"
        onPay={handlePay}
      />
    );

    const button = screen.getByRole("button", { name: /authorize card/i });
    fireEvent.click(button);
    expect(handlePay).toHaveBeenCalledTimes(1);
  });

  it("handles loading state properly", () => {
    render(
      <PaymentActionCard
        amountLabel="$99.00"
        isLoading={true}
        loadingText="Processing..."
        onPay={() => {}}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });

  it("renders status message when provided", () => {
    render(
      <PaymentActionCard
        amountLabel="$99.00"
        statusMessage="Payment Successful"
        onPay={() => {}}
      />
    );
    expect(screen.getByText("Payment Successful")).toBeInTheDocument();
  });
});
