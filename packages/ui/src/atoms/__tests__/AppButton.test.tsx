import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppButton } from "../AppButton";

describe("AppButton (Atom)", () => {
  it("renders with default props and text content", () => {
    render(<AppButton>Click Me</AppButton>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("handles user click events", () => {
    const handleClick = vi.fn();
    render(<AppButton onClick={handleClick}>Submit</AppButton>);
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders disabled state and prevents click execution", () => {
    const handleClick = vi.fn();
    render(
      <AppButton disabled onClick={handleClick}>
        Disabled
      </AppButton>,
    );
    const button = screen.getByRole("button", { name: /disabled/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders loading state with spinner and sets aria-busy and disabled", () => {
    render(<AppButton isLoading>Save Changes</AppButton>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("renders with custom left and right icons", () => {
    render(
      <AppButton
        leftIcon={<span data-testid="left-icon">L</span>}
        rightIcon={<span data-testid="right-icon">R</span>}
      >
        Icon Button
      </AppButton>,
    );
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("renders payment shield icon automatically for payment variant", () => {
    const { container } = render(
      <AppButton variant="payment">Secure Pay</AppButton>,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("bg-payment");
  });

  it("applies variant and size classes appropriately", () => {
    const { rerender } = render(
      <AppButton variant="destructive" size="lg">
        Delete
      </AppButton>,
    );
    let button = screen.getByRole("button");
    expect(button.className).toContain("bg-destructive");

    rerender(
      <AppButton variant="secondary" size="sm">
        Cancel
      </AppButton>,
    );
    button = screen.getByRole("button");
    expect(button.className).toContain("bg-secondary");
  });

  it("supports polymorphism with asChild", () => {
    render(
      <AppButton asChild>
        <a href="/login">Login Link</a>
      </AppButton>,
    );
    const link = screen.getByRole("link", { name: /login link/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
  });
});
