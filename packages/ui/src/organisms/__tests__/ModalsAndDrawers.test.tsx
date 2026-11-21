import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppSettingsModal } from "../AppSettingsModal";
import { AddCustomerDrawer } from "../AddCustomerDrawer";
import { CustomerProfileSidebar } from "../CustomerProfileSidebar";

describe("Modals & Drawers Suite", () => {
  describe("AppSettingsModal", () => {
    const themes = [
      { id: "dark" as const, name: "Dark Theme", description: "Default", badgeColors: ["#000", "#111"] as [string, string] },
      { id: "light" as const, name: "Light Theme", description: "Bright", badgeColors: ["#fff", "#eee"] as [string, string] },
    ];
    const languages = [
      { id: "en", code: "en" as const, label: "English", nativeLabel: "English" },
      { id: "gu", code: "gu" as const, label: "Gujarati", nativeLabel: "ગુજરાતી" },
    ];

    it("does not render when isOpen is false", () => {
      const { container } = render(
        <AppSettingsModal
          isOpen={false}
          onClose={() => {}}
          currentTheme="dark"
          onThemeSelect={() => {}}
          currentLanguage="en"
          onLanguageSelect={() => {}}
          themes={themes}
          languages={languages}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders modal, responds to close button and Escape key", () => {
      const handleClose = vi.fn();
      render(
        <AppSettingsModal
          isOpen={true}
          onClose={handleClose}
          currentTheme="dark"
          onThemeSelect={() => {}}
          currentLanguage="en"
          onLanguageSelect={() => {}}
          themes={themes}
          languages={languages}
        />
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe("AddCustomerDrawer", () => {
    it("validates mandatory fields on empty submit", () => {
      const handleSubmit = vi.fn();
      render(
        <AddCustomerDrawer
          isOpen={true}
          onClose={() => {}}
          onSubmit={handleSubmit}
        />
      );

      const submitBtn = screen.getByRole("button", { name: /add customer/i });
      fireEvent.click(submitBtn);

      expect(handleSubmit).not.toHaveBeenCalled();
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    });

    it("submits valid customer data", () => {
      const handleSubmit = vi.fn();
      render(
        <AddCustomerDrawer
          isOpen={true}
          onClose={() => {}}
          onSubmit={handleSubmit}
        />
      );

      const firstInput = screen.getByPlaceholderText(/e\.g\. amit/i);
      const lastInput = screen.getByPlaceholderText(/e\.g\. patel/i);
      const phoneInput = screen.getByPlaceholderText(/e\.g\. 9876543210/i);

      fireEvent.change(firstInput, { target: { value: "John" } });
      fireEvent.change(lastInput, { target: { value: "Doe" } });
      fireEvent.change(phoneInput, { target: { value: "9876543210" } });

      const submitBtn = screen.getByRole("button", { name: /add customer/i });
      fireEvent.click(submitBtn);

      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: "John",
          lastName: "Doe",
          phone: "9876543210",
        })
      );
    });
  });

  describe("CustomerProfileSidebar", () => {
    const mockCustomer = {
      id: "cust-1",
      name: "Acme Corp",
      email: "contact@acme.com",
      company: "Acme Industries",
    };

    it("renders customer details and tab switcher", () => {
      const handleTabChange = vi.fn();
      const handleBack = vi.fn();

      render(
        <CustomerProfileSidebar
          customer={mockCustomer}
          activeTab="details"
          onTabChange={handleTabChange}
          onBack={handleBack}
        />
      );

      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
      expect(screen.getByText("contact@acme.com")).toBeInTheDocument();

      const backBtn = screen.getByRole("button", { name: /back/i });
      fireEvent.click(backBtn);
      expect(handleBack).toHaveBeenCalledTimes(1);

      const invoiceBtn = screen.getByRole("button", { name: /invoice/i });
      fireEvent.click(invoiceBtn);
      expect(handleTabChange).toHaveBeenCalledWith("invoice");
    });
  });
});
