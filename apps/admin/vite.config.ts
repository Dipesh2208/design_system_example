import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, createLogger } from "vite";
import tailwindcss from "@tailwindcss/vite";

const originalConsoleWarn = console.warn;
console.warn = (...args: Array<string | number | boolean | object | null | undefined>) => {
  const msg = args.map((a) => (typeof a === "string" ? a : String(a))).join(" ");
  if (
    msg.includes("`envFile` option is deprecated") ||
    msg.includes('`esbuild` option was specified by "remix" plugin')
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

const customLogger = createLogger();
const originalWarn = customLogger.warn;
customLogger.warn = (msg, options) => {
  if (
    msg.includes("`envFile` option is deprecated") ||
    msg.includes('`esbuild` option was specified by "remix" plugin')
  ) {
    return;
  }
  originalWarn(msg, options);
};

export default defineConfig({
  customLogger,
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tailwindcss(),
  ],
});

