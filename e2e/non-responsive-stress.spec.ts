import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./auth-helper";

test.describe("Lead QA: Explicit Non-Responsive Layout Regression Test", () => {
  test("maintains table structure without destructive wrapping when locked to table mode on small viewport", async ({
    page,
  }) => {
    // 1. Authenticate session
    await loginAsAdmin(page);

    // 2. Set small non-responsive viewport (320px)
    await page.setViewportSize({ width: 320, height: 600 });
    await page.goto("/customers");
    await expect(page).toHaveURL(/.*customers/);

    // 3. Wait for customer records list or Table view button to render
    const tableButton = page
      .getByRole("button", { name: /table view|table/i })
      .first();
    await expect(tableButton).toBeVisible({ timeout: 15000 });

    // 4. Force Table mode via toggle button
    await tableButton.click();

    // 5. In non-responsive table view, the customer item / rows must render without layout collapse
    const customerRow = page.getByText(/cust-10/i).first();
    await expect(customerRow).toBeVisible({ timeout: 10000 });

    // 6. Verify layout container defends minimum width constraints
    const mainContainer = page.locator("main").first();
    const boundingBox = await mainContainer.boundingBox();
    expect(boundingBox?.width).toBeGreaterThanOrEqual(280);
  });
});
