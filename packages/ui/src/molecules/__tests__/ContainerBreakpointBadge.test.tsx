import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContainerBreakpointBadge } from "../ContainerBreakpointBadge";

describe("ContainerBreakpointBadge (Molecule)", () => {
  it("renders breakpoint label and pixel width", () => {
    render(<ContainerBreakpointBadge variantLabel="@lg" widthPx={1024} />);
    expect(screen.getByText("Active Breakpoint:")).toBeInTheDocument();
    expect(screen.getByText(/@lg \(1024px\)/)).toBeInTheDocument();
  });

  it("renders custom icon slot", () => {
    render(
      <ContainerBreakpointBadge
        variantLabel="@sm"
        widthPx={640}
        icon={<span data-testid="screen-icon">📱</span>}
      />,
    );
    expect(screen.getByTestId("screen-icon")).toBeInTheDocument();
  });
});
