import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppBadge } from "../AppBadge";

describe("AppBadge (Atom)", () => {
  it("renders with children text", () => {
    render(<AppBadge>Active</AppBadge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders with custom variants", () => {
    const { container, rerender } = render(
      <AppBadge variant="success">Online</AppBadge>,
    );
    expect(container.firstChild).toHaveClass("text-emerald-600");

    rerender(<AppBadge variant="warning">Pending</AppBadge>);
    expect(container.firstChild).toHaveClass("text-amber-600");
  });

  it("renders with icon slot", () => {
    render(
      <AppBadge icon={<span data-testid="badge-icon">●</span>}>
        Verified
      </AppBadge>,
    );
    expect(screen.getByTestId("badge-icon")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });
});
