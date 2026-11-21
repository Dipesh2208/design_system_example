import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppInput } from "../AppInput";

describe("AppInput (Atom)", () => {
  it("renders input with placeholder and value", () => {
    render(<AppInput placeholder="Enter username" defaultValue="john_doe" />);
    const input = screen.getByPlaceholderText("Enter username") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("john_doe");
  });

  it("handles typing and onChange events", () => {
    const handleChange = vi.fn();
    render(<AppInput placeholder="Search" onChange={handleChange} />);
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "test query" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("renders disabled state", () => {
    render(<AppInput disabled placeholder="Disabled field" />);
    const input = screen.getByPlaceholderText("Disabled field");
    expect(input).toBeDisabled();
  });

  it("applies input size classes", () => {
    const { rerender } = render(<AppInput inputSize="sm" placeholder="Small" />);
    expect(screen.getByPlaceholderText("Small").className).toContain("h-9");

    rerender(<AppInput inputSize="lg" placeholder="Large" />);
    expect(screen.getByPlaceholderText("Large").className).toContain("h-12");
  });
});
