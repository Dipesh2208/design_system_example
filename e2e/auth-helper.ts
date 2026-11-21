import { type Page, expect } from "@playwright/test";

/**
 * Shared helper to authenticate Playwright session as Admin user
 * via the mock Google Sign-in flow.
 */
export async function loginAsAdmin(page: Page) {
  await page.goto("/auth");
  // Check if already on dashboard or needs sign-in
  if (page.url().includes("/auth")) {
    // Select the form submit button directly regardless of locale language (Gujarati/Hindi/English)
    const submitButton = page.locator("form[method='post'] button[type='submit']");
    await expect(submitButton).toBeVisible({ timeout: 10000 });
    await submitButton.click();
    await page.waitForURL("**/dashboard", { timeout: 15000 });
  }
}
