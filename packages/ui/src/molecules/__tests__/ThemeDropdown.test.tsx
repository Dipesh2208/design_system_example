import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeDropdown, ThemeItem } from "../ThemeDropdown";

const sampleThemes: ThemeItem[] = [
  { id: "dark", name: "Deep Charcoal", badgeColors: ["#0f172a", "#1e293b"] },
  { id: "light", name: "Pure Light", badgeColors: ["#ffffff", "#f8fafc"] },
  { id: "rose-red", name: "Rose Crimson", badgeColors: ["#881337", "#f43f5e"] },
];

describe("ThemeDropdown (Molecule)", () => {
  it("renders trigger button with current theme display", () => {
    render(
      <ThemeDropdown
        isOpen={false}
        onToggle={() => {}}
        onSelect={() => {}}
        currentTheme="rose-red"
        themes={sampleThemes}
      />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("Rose Crimson");
  });

  it("calls onToggle when trigger button is clicked", () => {
    const handleToggle = vi.fn();
    render(
      <ThemeDropdown
        isOpen={false}
        onToggle={handleToggle}
        onSelect={() => {}}
        currentTheme="dark"
        themes={sampleThemes}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it("renders menu with theme options and calls onSelect", () => {
    const handleSelect = vi.fn();
    render(
      <ThemeDropdown
        isOpen={true}
        onToggle={() => {}}
        onSelect={handleSelect}
        currentTheme="dark"
        themes={sampleThemes}
      />,
    );

    expect(screen.getByRole("menu")).toBeInTheDocument();
    const items = screen.getAllByRole("menuitem");
    expect(items).toHaveLength(3);

    fireEvent.click(screen.getByRole("menuitem", { name: /pure light/i }));
    expect(handleSelect).toHaveBeenCalledWith("light");
  });
});
