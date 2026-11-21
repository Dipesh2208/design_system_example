import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ButtonGroup } from "../ButtonGroup";
import { AppButton } from "../../atoms/AppButton";

describe("ButtonGroup (Molecule)", () => {
  it("renders children buttons within a group role", () => {
    render(
      <ButtonGroup>
        <AppButton>Btn 1</AppButton>
        <AppButton>Btn 2</AppButton>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group");
    expect(group).toBeInTheDocument();
    expect(screen.getByText("Btn 1")).toBeInTheDocument();
    expect(screen.getByText("Btn 2")).toBeInTheDocument();
  });

  it("applies vertical orientation class", () => {
    const { container } = render(
      <ButtonGroup orientation="vertical">
        <AppButton>First</AppButton>
      </ButtonGroup>,
    );
    expect(container.firstChild).toHaveClass("flex-col");
  });

  it("applies attached styling class", () => {
    const { container } = render(
      <ButtonGroup attached>
        <AppButton>Left</AppButton>
        <AppButton>Right</AppButton>
      </ButtonGroup>,
    );
    expect(container.firstChild).toHaveClass(
      "[&>*:not(:first-child)]:rounded-l-none",
    );
  });
});
