import { test, expect } from "@playwright/test";

test.describe("Multi-Device Authentication Flow (Mobile, Tablet, Desktop)", () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test for clean test isolation
    await page.goto("/auth");
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
  });

  test("Login: Rejects submission when Cloudflare Turnstile is missing", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");

    // Attempt to submit without checking Cloudflare
    const submitBtn = page.locator("button[type='submit']").first();
    await expect(submitBtn).toBeVisible({ timeout: 15000 });
    await submitBtn.click();

    // Verify error alert
    const errorBanner = page.getByText(/cloudflare turnstile human verification/i);
    await expect(errorBanner).toBeVisible({ timeout: 10000 });
  });

  test("Login: Successful login with credentials and Turnstile check on all viewports", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");

    // Verify Mobile and Password fields are present
    const mobileInput = page.locator("input[type='tel']").first();
    await expect(mobileInput).toBeVisible({ timeout: 15000 });
    await mobileInput.click();
    await mobileInput.clear();
    await mobileInput.fill("9876543210");
    await expect(mobileInput).toHaveValue("9876543210");

    const passwordInput = page.locator("input[placeholder*='password' i]").first();
    await passwordInput.click();
    await passwordInput.clear();
    await passwordInput.fill("Admin@2026!Secure");
    await expect(passwordInput).toHaveValue("Admin@2026!Secure");

    // Complete Turnstile
    const turnstileLabel = page.getByText(/verify you are human/i);
    await turnstileLabel.scrollIntoViewIfNeeded();
    await turnstileLabel.click();
    await expect(page.getByText(/verification complete/i)).toBeVisible({ timeout: 12000 });

    // Submit
    const submitBtn = page.locator("button[type='submit']").first();
    await submitBtn.click();

    // Redirects to Dashboard
    await page.waitForURL("**/dashboard", { timeout: 20000 });
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("Signup Stepper: 3-step registration flow works seamlessly", async ({ page }) => {
    await page.goto("/signup");
    await page.waitForLoadState("networkidle");

    // Step 1: Mobile + Turnstile
    const mobileInput = page.locator("input[type='tel']").first();
    await expect(mobileInput).toBeVisible({ timeout: 15000 });
    // Unique phone per test to avoid collision
    const testPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    await mobileInput.click();
    await mobileInput.pressSequentially(testPhone, { delay: 30 });
    await expect(mobileInput).toHaveValue(testPhone);

    const turnstileLabel = page.getByText(/verify you are human/i);
    await turnstileLabel.scrollIntoViewIfNeeded();
    await turnstileLabel.click();
    await expect(page.getByText(/verification complete/i)).toBeVisible({ timeout: 12000 });

    const step1Btn = page.getByRole("button", { name: /continue to otp verification/i });
    await step1Btn.click();

    // Step 2: 4-digit OTP
    await expect(page.getByText(/enter the 4-digit code sent to/i)).toBeVisible({ timeout: 12000 });
    await expect(page.getByText(/valid for:/i)).toBeVisible();

    // Enter mock OTP "1234"
    const otpBoxes = page.locator("input[inputmode='numeric']");
    await expect(otpBoxes).toHaveCount(4);
    await otpBoxes.nth(0).fill("1");
    await otpBoxes.nth(1).fill("2");
    await otpBoxes.nth(2).fill("3");
    await otpBoxes.nth(3).fill("4");

    const verifyOtpBtn = page.getByRole("button", { name: /verify otp/i });
    await verifyOtpBtn.click();

    // Step 3: OWASP Password
    await expect(page.getByText(/set password \(owasp standard\)/i)).toBeVisible({ timeout: 12000 });
    await expect(page.getByText(/owasp password criteria/i)).toBeVisible();

    const passwordInputs = page.locator("input[placeholder*='password' i]");
    await passwordInputs.nth(0).fill("Secure@Pass2026!");
    await passwordInputs.nth(1).fill("Secure@Pass2026!");

    const completeBtn = page.getByRole("button", { name: /complete registration/i });
    await expect(completeBtn).toBeEnabled({ timeout: 6000 });
    await completeBtn.click();

    // Verified redirect to auth
    await page.waitForURL("**/auth", { timeout: 20000 });
  });

  test("Forgot Password Stepper: Reset password with OTP and OWASP standards", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.waitForLoadState("networkidle");

    // Step 1
    const mobileInput = page.locator("input[type='tel']").first();
    await expect(mobileInput).toBeVisible({ timeout: 15000 });
    await mobileInput.click();
    await mobileInput.clear();
    await mobileInput.fill("9876543210");
    await expect(mobileInput).toHaveValue("9876543210");

    const turnstileLabel = page.getByText(/verify you are human/i);
    await turnstileLabel.scrollIntoViewIfNeeded();
    await turnstileLabel.click();
    await expect(page.getByText(/verification complete/i)).toBeVisible({ timeout: 12000 });

    await page.getByRole("button", { name: /send otp/i }).click();

    // Step 2
    await expect(page.getByText(/enter the 4-digit code/i)).toBeVisible({ timeout: 12000 });
    const otpBoxes = page.locator("input[inputmode='numeric']");
    await otpBoxes.nth(0).fill("1");
    await otpBoxes.nth(1).fill("2");
    await otpBoxes.nth(2).fill("3");
    await otpBoxes.nth(3).fill("4");

    await page.getByRole("button", { name: /verify otp/i }).click();

    // Step 3
    await expect(page.getByText(/new password \(owasp standard\)/i)).toBeVisible({ timeout: 12000 });
    const passwordInputs = page.locator("input[placeholder*='password' i]");
    await passwordInputs.nth(0).fill("Reset@Secure2026!");
    await passwordInputs.nth(1).fill("Reset@Secure2026!");

    await page.getByRole("button", { name: /regenerate password/i }).click();
    await page.waitForURL("**/auth", { timeout: 20000 });
  });
});
