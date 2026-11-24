import { type Page, expect } from "@playwright/test";

/**
 * Shared helper to authenticate Playwright session as Admin user
 * Supports the Mobile Number + OWASP Password + Cloudflare Turnstile flow
 * and works across all device viewports (Desktop, Tablet, Mobile).
 */
export async function loginAsAdmin(page: Page) {
  await page.goto("/auth");

  // Check if already on dashboard or needs sign-in
  if (page.url().includes("/auth")) {
    // Fill credentials if not already populated
    const mobileInput = page.locator("input[type='tel']").first();
    await expect(mobileInput).toBeVisible({ timeout: 10000 });
    const currentMobile = await mobileInput.inputValue();
    if (!currentMobile) {
      await mobileInput.fill("9876543210");
    }

    const passwordInput = page.locator("input[placeholder*='password' i]").first();
    const currentPassword = await passwordInput.inputValue();
    if (!currentPassword) {
      await passwordInput.fill("Admin@2026!Secure");
    }

    // Click Cloudflare Turnstile human verification if not already verified
    const turnstileLabel = page.getByText(/verify you are human/i);
    if (await turnstileLabel.isVisible()) {
      await turnstileLabel.click();
      // Wait for verification success badge
      await expect(page.getByText(/verification complete/i)).toBeVisible({
        timeout: 8000,
      });
    }

    // Submit form
    const submitButton = page.locator("button[type='submit']").first();
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();

    // Verify successful redirection to dashboard
    await page.waitForURL("**/dashboard", { timeout: 15000 });
  }
}
