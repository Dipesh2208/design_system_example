import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30 * 1000,
  expect: {
    timeout: 7000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1, // Single worker avoids database/server race conditions
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3002",
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    // Configurable slowMo so user can visibly watch clicks like in Selenium
    launchOptions: {
      slowMo: process.env.SLOWMO ? parseInt(process.env.SLOWMO, 10) : 0,
    },
  },
  projects: [
    {
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: "Tablet",
      use: {
        ...devices["iPad (gen 7)"],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "Mobile iPhone",
      use: { ...devices["iPhone 13"], viewport: { width: 375, height: 667 } },
    },
    {
      name: "Narrow Non-Responsive Stress",
      use: {
        viewport: { width: 320, height: 568 },
      },
    },
  ],
  webServer: {
    command: "pnpm --filter admin dev --port 3002",
    port: 3002,
    reuseExistingServer: false,
    timeout: 60 * 1000,
  },
});
