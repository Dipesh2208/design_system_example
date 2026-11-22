import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeDropdownOrganism } from "../ThemeDropdownOrganism";
import { LanguageDropdownOrganism } from "../LanguageDropdownOrganism";
import { UserAvatarDropdownOrganism } from "../UserAvatarDropdownOrganism";

describe("Dropdown Organisms Suite", () => {
  describe("ThemeDropdownOrganism", () => {
    const sampleThemes = [
      {
        id: "dark",
        name: "Dark Theme",
        badgeColors: ["#000", "#111"] as [string, string],
      },
      {
        id: "light",
        name: "Light Theme",
        badgeColors: ["#fff", "#eee"] as [string, string],
      },
    ];

    it("opens on click, selects a theme, and closes", () => {
      const handleSelect = vi.fn();
      render(
        <ThemeDropdownOrganism
          currentTheme="dark"
          onThemeSelect={handleSelect}
          themes={sampleThemes}
        />,
      );

      const trigger = screen.getByRole("button", { name: /dark theme/i });
      fireEvent.click(trigger);
      expect(screen.getByRole("menu")).toBeInTheDocument();

      const option = screen.getByRole("menuitem", { name: /light theme/i });
      fireEvent.click(option);
      expect(handleSelect).toHaveBeenCalledWith("light");
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("closes on Escape key press", () => {
      render(
        <ThemeDropdownOrganism
          currentTheme="dark"
          onThemeSelect={() => {}}
          themes={sampleThemes}
        />,
      );

      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByRole("menu")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  describe("LanguageDropdownOrganism", () => {
    it("handles toggle and selection", () => {
      const handleSelect = vi.fn();
      render(
        <LanguageDropdownOrganism
          currentLanguage="en"
          onLanguageSelect={handleSelect}
        />,
      );

      const trigger = screen.getByRole("button");
      fireEvent.click(trigger);
      expect(screen.getByRole("menu")).toBeInTheDocument();

      const guItem = screen.getByRole("menuitem", { name: /gujarati/i });
      fireEvent.click(guItem);
      expect(handleSelect).toHaveBeenCalledWith("gu");
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  describe("UserAvatarDropdownOrganism", () => {
    const mockUser = {
      name: "Alice Developer",
      email: "alice@example.com",
      role: "Lead QA",
    };

    it("displays user info and handles actions", () => {
      const handleSettings = vi.fn();
      const handleLogout = vi.fn();

      render(
        <UserAvatarDropdownOrganism
          user={mockUser}
          onSettingsClick={handleSettings}
          onLogoutClick={handleLogout}
        />,
      );

      const trigger = screen.getByRole("button", {
        name: /user account menu/i,
      });
      fireEvent.click(trigger);

      expect(screen.getAllByText("Alice Developer").length).toBeGreaterThan(0);
      expect(screen.getAllByText("alice@example.com").length).toBeGreaterThan(
        0,
      );

      const settingsBtn = screen.getByRole("menuitem", { name: /settings/i });
      fireEvent.click(settingsBtn);
      expect(handleSettings).toHaveBeenCalledTimes(1);

      // Reopen and test logout
      fireEvent.click(trigger);
      const logoutBtn = screen.getByRole("menuitem", { name: /sign out/i });
      fireEvent.click(logoutBtn);
      expect(handleLogout).toHaveBeenCalledTimes(1);
    });
  });
});
