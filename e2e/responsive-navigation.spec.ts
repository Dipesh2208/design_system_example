import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./auth-helper";

test.describe("Enterprise Responsive Breakpoint Suite", () => {
  test("renders navigation bar and switches mobile/desktop layouts accordingly", async ({
    page,
  }) => {
    // 1. Authenticate session
    await loginAsAdmin(page);

    // 2. Navigate to dashboard
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*dashboard/);

    const viewport = page.viewportSize();
    const isDesktop = (viewport?.width || 0) >= 1024;

    if (isDesktop) {
      // Desktop Sidebar is visible
      const sidebarNav = page.locator("aside nav");
      await expect(sidebarNav).toBeVisible();

      // Check brand link is displayed
      await expect(page.locator("a", { hasText: "SaaS Matrix" }).first()).toBeVisible();
    } else {
      // Mobile hamburger trigger should be available
      const mobileMenuBtn = page.getByRole("button", { name: /open navigation menu/i });
      await expect(mobileMenuBtn).toBeVisible();

      // Open mobile drawer
      await mobileMenuBtn.click();
      const closeBtn = page.getByRole("button", { name: /close navigation/i });
      await expect(closeBtn).toBeVisible();

      // Close drawer
      await closeBtn.click();
      await expect(closeBtn).not.toBeVisible();
    }
  });
});
