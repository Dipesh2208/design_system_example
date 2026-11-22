/**
 * Web Worker for handling API requests, periodic polling,
 * and computationally heavy data manipulation off the main thread.
 */

export type JsonSerializable =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonSerializable }
  | JsonSerializable[];

export interface ApiWorkerRequest {
  id: string;
  type: "FETCH_API" | "START_HEALTH_POLL" | "STOP_HEALTH_POLL" | "PROCESS_DATA";
  payload: {
    origin?: string;
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    timeoutMs?: number;
    intervalMs?: number;
    action?: string;
    items?: Array<{ [key: string]: JsonSerializable }>;
    searchTerm?: string;
    searchKeys?: string[];
  };
}

export interface ApiWorkerResponse {
  id: string;
  type: string;
  success: boolean;
  data?: JsonSerializable;
  error?: string;
}

let healthIntervalId: ReturnType<typeof setInterval> | null = null;

// Self worker scope reference
interface WorkerContext {
  postMessage: (message: ApiWorkerResponse) => void;
  onmessage: ((event: MessageEvent<ApiWorkerRequest>) => void) | null;
  location?: { origin?: string };
}

declare const self: WorkerContext;
const ctx: WorkerContext = self;

// Helper to resolve URL against origin if relative
function resolveUrl(url: string, origin?: string): string {
  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const base = origin || ctx.location?.origin || "";
    if (base && !base.startsWith("blob:")) {
      return new URL(url, base).href;
    }
    return url;
  } catch {
    return url;
  }
}

ctx.onmessage = async (event: MessageEvent<ApiWorkerRequest>) => {
  const { id, type, payload } = event.data;

  try {
    switch (type) {
      case "FETCH_API": {
        const {
          url,
          origin,
          method = "GET",
          headers = {},
          body,
          timeoutMs = 10000,
        } = payload;
        if (!url) {
          throw new Error("URL is required for FETCH_API");
        }

        const targetUrl = resolveUrl(url, origin);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
          const fetchOptions: RequestInit = {
            method,
            headers: {
              "Content-Type": "application/json",
              ...headers,
            },
            signal: controller.signal,
          };

          if (body && method !== "GET" && method !== "HEAD") {
            fetchOptions.body = body;
          }

          const response = await fetch(targetUrl, fetchOptions);
          clearTimeout(timeoutId);

          let responseData: JsonSerializable;
          const contentType = response.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            responseData = (await response.json()) as JsonSerializable;
          } else {
            responseData = await response.text();
          }

          if (!response.ok) {
            ctx.postMessage({
              id,
              type,
              success: false,
              data: responseData,
              error: `API Request failed with status ${response.status}: ${response.statusText}`,
            } satisfies ApiWorkerResponse);
            return;
          }

          ctx.postMessage({
            id,
            type,
            success: true,
            data: responseData,
          } satisfies ApiWorkerResponse);
        } catch (err) {
          clearTimeout(timeoutId);
          throw err;
        }
        break;
      }

      case "START_HEALTH_POLL": {
        const interval = payload.intervalMs || 15000;
        const origin = payload.origin;
        if (healthIntervalId) {
          clearInterval(healthIntervalId);
        }

        const healthUrl = resolveUrl(`/api/health?_t=${Date.now()}`, origin);
        const checkHealth = async () => {
          try {
            const res = await fetch(healthUrl, {
              cache: "no-store",
            });
            const data = (await res.json()) as JsonSerializable;
            ctx.postMessage({
              id,
              type: "HEALTH_TICK",
              success: res.ok,
              data,
            } satisfies ApiWorkerResponse);
          } catch (pollErr) {
            ctx.postMessage({
              id,
              type: "HEALTH_TICK",
              success: false,
              error:
                pollErr instanceof Error
                  ? pollErr.message
                  : "Health check failed",
            } satisfies ApiWorkerResponse);
          }
        };

        // Run immediately then on interval
        checkHealth();
        healthIntervalId = setInterval(checkHealth, interval);

        ctx.postMessage({
          id,
          type,
          success: true,
          data: { polling: true, interval },
        } satisfies ApiWorkerResponse);
        break;
      }

      case "STOP_HEALTH_POLL": {
        if (healthIntervalId) {
          clearInterval(healthIntervalId);
          healthIntervalId = null;
        }
        ctx.postMessage({
          id,
          type,
          success: true,
          data: { polling: false },
        } satisfies ApiWorkerResponse);
        break;
      }

      case "PROCESS_DATA": {
        const { items = [], searchTerm = "", searchKeys = [] } = payload;
        const normalized = searchTerm.trim().toLowerCase();

        if (!normalized || searchKeys.length === 0) {
          ctx.postMessage({
            id,
            type,
            success: true,
            data: items,
          } satisfies ApiWorkerResponse);
          return;
        }

        // Heavy filtering off the main thread
        const filtered = items.filter((item) => {
          if (!item || typeof item !== "object") return false;
          return searchKeys.some((key) => {
            const val = item[key];
            return (
              val != null && String(val).toLowerCase().includes(normalized)
            );
          });
        });

        ctx.postMessage({
          id,
          type,
          success: true,
          data: filtered,
        } satisfies ApiWorkerResponse);
        break;
      }

      default:
        throw new Error(`Unsupported message type: ${type}`);
    }
  } catch (error) {
    ctx.postMessage({
      id,
      type,
      success: false,
      error: error instanceof Error ? error.message : "Unknown worker error",
    } satisfies ApiWorkerResponse);
  }
};
