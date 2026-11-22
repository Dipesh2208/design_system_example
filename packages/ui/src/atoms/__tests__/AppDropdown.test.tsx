import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppDropdownMenu, AppDropdownItem } from "../AppDropdown";

describe("AppDropdown (Atom)", () => {
  describe("AppDropdownMenu", () => {
    it("returns null when isOpen is false", () => {
      const { container } = render(
        <AppDropdownMenu isOpen={false}>
          <div>Dropdown Content</div>
        </AppDropdownMenu>,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders menu with role and children when isOpen is true", () => {
      render(
        <AppDropdownMenu isOpen={true} align="left">
          <AppDropdownItem>Item 1</AppDropdownItem>
        </AppDropdownMenu>,
      );
      const menu = screen.getByRole("menu");
      expect(menu).toBeInTheDocument();
      expect(menu.className).toContain("left-0");
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });
  });

  describe("AppDropdownItem", () => {
    it("renders button with role menuitem", () => {
      const handleClick = vi.fn();
      render(<AppDropdownItem onClick={handleClick}>Option A</AppDropdownItem>);
      const item = screen.getByRole("menuitem", { name: "Option A" });
      expect(item).toBeInTheDocument();
      fireEvent.click(item);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("applies selected styling when isSelected is true", () => {
      render(<AppDropdownItem isSelected>Selected Option</AppDropdownItem>);
      const item = screen.getByRole("menuitem");
      expect(item.className).toContain("bg-primary");
      expect(item.className).toContain("text-primary-foreground");
    });
  });
});
