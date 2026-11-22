import * as React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppAdminLayout } from "../AppAdminLayout";
import { useAppStore } from "../../stores/useAppStore";

describe("AppAdminLayout (Organism)", () => {
  beforeEach(() => {
    useAppStore.setState({
      isSidebarCollapsed: false,
    });
  });

  it("renders layout with brand name, navigation items, and main children", () => {
    render(
      <AppAdminLayout brandName="Enterprise Cloud" currentPath="/dashboard">
        <div data-testid="main-content">Dashboard Content</div>
      </AppAdminLayout>,
    );

    expect(screen.getByText("Enterprise Cloud")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Customers")).toBeInTheDocument();
    expect(screen.getByTestId("main-content")).toBeInTheDocument();
  });

  it("collapses and expands the sidebar via toggle button", () => {
    render(
      <AppAdminLayout brandName="Enterprise Cloud">
        <div>Content</div>
      </AppAdminLayout>,
    );

    // Initial state: expanded (false)
    expect(useAppStore.getState().isSidebarCollapsed).toBe(false);

    // Find collapse button
    const collapseBtn = screen.getByRole("button", {
      name: /collapse sidebar/i,
    });
    fireEvent.click(collapseBtn);
    expect(useAppStore.getState().isSidebarCollapsed).toBe(true);

    const expandBtn = screen.getByRole("button", { name: /expand sidebar/i });
    fireEvent.click(expandBtn);
    expect(useAppStore.getState().isSidebarCollapsed).toBe(false);
  });

  it("opens mobile drawer navigation on small screens", () => {
    render(
      <AppAdminLayout brandName="Enterprise Cloud">
        <div>Content</div>
      </AppAdminLayout>,
    );

    const mobileMenuBtn = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    fireEvent.click(mobileMenuBtn);

    // Mobile drawer navigation backdrop and items render
    const closeDrawerBtn = screen.getByRole("button", {
      name: /close navigation/i,
    });
    expect(closeDrawerBtn).toBeInTheDocument();
  });
});
