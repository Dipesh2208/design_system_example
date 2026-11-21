import * as React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AppSpinner } from "../AppSpinner";

describe("AppSpinner (Atom)", () => {
  it("renders with svg animate-spin class", () => {
    const { container } = render(<AppSpinner />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("class")).toContain("animate-spin");
  });

  it("applies different size classes", () => {
    const { container, rerender } = render(<AppSpinner size="sm" />);
    let svg = container.querySelector("svg");
    expect(svg?.getAttribute("class")).toContain("h-3.5");

    rerender(<AppSpinner size="lg" />);
    svg = container.querySelector("svg");
    expect(svg?.getAttribute("class")).toContain("h-5");
  });
});
