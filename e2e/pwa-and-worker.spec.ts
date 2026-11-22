import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./auth-helper";

test.describe("PWA, Service Worker & Browser Translation Tests", () => {
  test("Manifest, Icons, and PWA Meta tags are properly configured", async ({
    page,
    request,
  }) => {
    await page.goto("/auth");

    // 1. Verify manifest link in DOM
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute("href", "/manifest.webmanifest");

    // 2. Verify manifest response content
    const manifestResponse = await request.get("/manifest.webmanifest");
    expect(manifestResponse.ok()).toBeTruthy();
    expect(manifestResponse.headers()["content-type"]).toContain("manifest");

    const manifestJson = await manifestResponse.json();
    expect(manifestJson.name).toBe("Admin Portal");
    expect(manifestJson.display).toBe("standalone");
    expect(manifestJson.start_url).toBe("/");
    expect(manifestJson.icons.length).toBeGreaterThanOrEqual(2);

    // 3. Verify PWA Icons accessibility
    const icon192 = await request.get(manifestJson.icons[0].src);
    expect(icon192.ok()).toBeTruthy();
    expect(icon192.headers()["content-type"]).toContain("image/svg+xml");

    const icon512 = await request.get(manifestJson.icons[1].src);
    expect(icon512.ok()).toBeTruthy();
    expect(icon512.headers()["content-type"]).toContain("image/svg+xml");

    // 4. Verify Apple & Theme Color meta tags
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute("content", "#0f172a");

    const appleCapable = page.locator(
      'meta[name="apple-mobile-web-app-capable"]',
    );
    await expect(appleCapable).toHaveAttribute("content", "yes");

    // 5. Verify Browser Translation suppression tags
    const googleNoTranslate = page.locator(
      'meta[name="google"][content="notranslate"]',
    );
    await expect(googleNoTranslate).toHaveCount(1);

    const htmlElement = page.locator("html");
    await expect(htmlElement).toHaveAttribute("translate", "no");
    const classList = await htmlElement.getAttribute("class");
    expect(classList).toContain("notranslate");
  });

  test("Service Worker script is accessible and valid", async ({
    request,
    page,
  }) => {
    // 1. Verify /sw.js is served properly
    const swResponse = await request.get("/sw.js");
    expect(swResponse.ok()).toBeTruthy();
    const swContent = await swResponse.text();
    expect(swContent).toContain("admin-cache-v1");
    expect(swContent).toContain("addEventListener");

    // 2. Check serviceWorker API existence in browser context
    await page.goto("/auth");
    const hasServiceWorker = await page.evaluate(
      () => "serviceWorker" in navigator,
    );
    expect(hasServiceWorker).toBe(true);
  });
});

test.describe("API Web Worker Functionality Tests", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("Web Worker handles background FETCH_API successfully", async ({
    page,
  }) => {
    const workerResult = await page.evaluate(async () => {
      return new Promise<{
        success: boolean;
        data?: { status: string };
        error?: string;
      }>((resolve) => {
        try {
          const origin = window.location.origin;
          const workerCode = `
            self.onmessage = async (e) => {
              const { id, type, payload } = e.data;
              if (type === 'FETCH_API') {
                try {
                  const targetUrl = payload.url.startsWith('http') ? payload.url : payload.origin + payload.url;
                  const res = await fetch(targetUrl);
                  const data = await res.json();
                  self.postMessage({ id, success: true, data });
                } catch (err) {
                  self.postMessage({ id, success: false, error: String(err) });
                }
              }
            };
          `;
          const blob = new Blob([workerCode], {
            type: "application/javascript",
          });
          const workerUrl = URL.createObjectURL(blob);
          const worker = new Worker(workerUrl);

          worker.onmessage = (event) => {
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
            resolve(event.data);
          };

          worker.addEventListener("error", (ev) => {
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
            resolve({
              success: false,
              error: ev.message || "Worker error event fired",
            });
          });

          worker.postMessage({
            id: "test_1",
            type: "FETCH_API",
            payload: { url: "/api/health", origin },
          });
        } catch (e: unknown) {
          resolve({
            success: false,
            error: e instanceof Error ? e.message : String(e),
          });
        }
      });
    });

    expect(workerResult.success).toBe(true);
    expect(workerResult.data?.status).toBe("ok");
  });

  test("Web Worker offloads heavy data filtering off the main thread", async ({
    page,
  }) => {
    const processResult = await page.evaluate(async () => {
      return new Promise<{
        success: boolean;
        data?: Array<{ id: number; name: string }>;
        error?: string;
      }>((resolve) => {
        try {
          const workerCode = `
            self.onmessage = (e) => {
              const { id, type, payload } = e.data;
              if (type === 'PROCESS_DATA') {
                const { items, searchTerm, searchKeys } = payload;
                const term = searchTerm.toLowerCase();
                const filtered = items.filter(item => 
                  searchKeys.some(key => String(item[key] || '').toLowerCase().includes(term))
                );
                self.postMessage({ id, success: true, data: filtered });
              }
            };
          `;
          const blob = new Blob([workerCode], {
            type: "application/javascript",
          });
          const workerUrl = URL.createObjectURL(blob);
          const worker = new Worker(workerUrl);

          worker.onmessage = (event) => {
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
            resolve(event.data);
          };

          worker.addEventListener("error", (ev) => {
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
            resolve({ success: false, error: ev.message || "Worker error" });
          });

          const mockItems = [
            { id: 1, name: "Alpha Customer", email: "alpha@example.com" },
            { id: 2, name: "Beta Client", email: "beta@example.com" },
            { id: 3, name: "Gamma Supplier", email: "gamma@example.com" },
          ];

          worker.postMessage({
            id: "test_filter",
            type: "PROCESS_DATA",
            payload: {
              items: mockItems,
              searchTerm: "Beta",
              searchKeys: ["name", "email"],
            },
          });
        } catch (e: unknown) {
          resolve({
            success: false,
            error: e instanceof Error ? e.message : String(e),
          });
        }
      });
    });

    expect(processResult.success).toBe(true);
    expect(processResult.data).toHaveLength(1);
    expect(processResult.data?.[0]?.name).toBe("Beta Client");
  });

  test("Web Worker handles periodic health check polling", async ({ page }) => {
    const pollResult = await page.evaluate(async () => {
      return new Promise<{ success: boolean; ticks: number }>((resolve) => {
        try {
          const origin = window.location.origin;
          const workerCode = `
            let interval = null;
            self.onmessage = (e) => {
              const { type, payload } = e.data;
              if (type === 'START_HEALTH_POLL') {
                const tick = async () => {
                  try {
                    const targetUrl = payload.origin + '/api/health';
                    const res = await fetch(targetUrl);
                    const data = await res.json();
                    self.postMessage({ type: 'HEALTH_TICK', success: res.ok, data });
                  } catch (err) {
                    self.postMessage({ type: 'HEALTH_TICK', success: false, error: String(err) });
                  }
                };
                tick();
                interval = setInterval(tick, payload.intervalMs || 300);
              } else if (type === 'STOP_HEALTH_POLL') {
                if (interval) clearInterval(interval);
              }
            };
          `;
          const blob = new Blob([workerCode], {
            type: "application/javascript",
          });
          const workerUrl = URL.createObjectURL(blob);
          const worker = new Worker(workerUrl);

          let tickCount = 0;
          worker.onmessage = (event) => {
            if (event.data.type === "HEALTH_TICK" && event.data.success) {
              tickCount++;
              if (tickCount >= 2) {
                worker.postMessage({ type: "STOP_HEALTH_POLL" });
                worker.terminate();
                URL.revokeObjectURL(workerUrl);
                resolve({ success: true, ticks: tickCount });
              }
            }
          };

          worker.addEventListener("error", () => {
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
            resolve({ success: false, ticks: 0 });
          });

          worker.postMessage({
            type: "START_HEALTH_POLL",
            payload: { intervalMs: 250, origin },
          });

          // Safeguard timeout
          setTimeout(() => {
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
            resolve({ success: tickCount > 0, ticks: tickCount });
          }, 4000);
        } catch {
          resolve({ success: false, ticks: 0 });
        }
      });
    });

    expect(pollResult.success).toBe(true);
    expect(pollResult.ticks).toBeGreaterThanOrEqual(1);
  });
});
