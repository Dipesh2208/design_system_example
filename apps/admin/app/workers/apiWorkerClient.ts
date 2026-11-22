import type {
  ApiWorkerRequest,
  ApiWorkerResponse,
  JsonSerializable,
} from "./api.worker";

export interface FetchApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: string | { [key: string]: JsonSerializable };
  timeoutMs?: number;
}

class ApiWorkerClient {
  private worker: Worker | null = null;
  private pendingRequests = new Map<
    string,
    { resolve: (val: JsonSerializable) => void; reject: (err: Error) => void }
  >();
  private healthListeners = new Set<
    (healthy: boolean, data?: JsonSerializable) => void
  >();

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof window === "undefined" || typeof Worker === "undefined") {
      return;
    }

    try {
      this.worker = new Worker(new URL("./api.worker.ts", import.meta.url), {
        type: "module",
      });

      this.worker.onmessage = (event: MessageEvent<ApiWorkerResponse>) => {
        const response = event.data;

        if (response.type === "HEALTH_TICK") {
          this.healthListeners.forEach((listener) =>
            listener(response.success, response.data),
          );
          return;
        }

        const pending = this.pendingRequests.get(response.id);
        if (!pending) return;

        this.pendingRequests.delete(response.id);
        if (response.success && response.data !== undefined) {
          pending.resolve(response.data);
        } else {
          pending.reject(
            new Error(response.error || "Worker operation failed"),
          );
        }
      };

      this.worker.onerror = (err) => {
        console.warn("API Web Worker error:", err);
      };
    } catch (err) {
      console.warn(
        "Failed to initialize API Worker, falling back to direct main-thread fetch:",
        err,
      );
      this.worker = null;
    }
  }

  public async fetchApi<T extends JsonSerializable = JsonSerializable>(
    url: string,
    options: FetchApiOptions = {},
  ): Promise<T> {
    const id = `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // Fallback if worker not supported/initialized
    if (!this.worker) {
      const response = await fetch(url, {
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        body: options.body
          ? typeof options.body === "string"
            ? options.body
            : JSON.stringify(options.body)
          : undefined,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return (await response.json()) as T;
    }

    return new Promise<T>((resolve, reject) => {
      this.pendingRequests.set(id, {
        resolve: (val) => resolve(val as T),
        reject,
      });

      const message: ApiWorkerRequest = {
        id,
        type: "FETCH_API",
        payload: {
          url,
          origin:
            typeof window !== "undefined" ? window.location.origin : undefined,
          method: options.method || "GET",
          headers: options.headers,
          body: options.body
            ? typeof options.body === "string"
              ? options.body
              : JSON.stringify(options.body)
            : undefined,
          timeoutMs: options.timeoutMs,
        },
      };

      this.worker?.postMessage(message);
    });
  }

  public async processData<T extends { [key: string]: JsonSerializable }>(
    items: T[],
    searchTerm: string,
    searchKeys: string[],
  ): Promise<T[]> {
    if (!this.worker) {
      const term = searchTerm.trim().toLowerCase();
      if (!term || searchKeys.length === 0) return items;
      return items.filter((item) => {
        if (!item || typeof item !== "object") return false;
        return searchKeys.some((k) =>
          String(item[k] ?? "")
            .toLowerCase()
            .includes(term),
        );
      });
    }

    const id = `proc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    return new Promise<T[]>((resolve, reject) => {
      this.pendingRequests.set(id, {
        resolve: (val) => resolve(val as T[]),
        reject,
      });

      const message: ApiWorkerRequest = {
        id,
        type: "PROCESS_DATA",
        payload: {
          items: items as Array<{ [key: string]: JsonSerializable }>,
          searchTerm,
          searchKeys,
        },
      };

      this.worker?.postMessage(message);
    });
  }

  public subscribeHealth(
    listener: (healthy: boolean, data?: JsonSerializable) => void,
    intervalMs = 15000,
  ): () => void {
    this.healthListeners.add(listener);

    if (this.worker && this.healthListeners.size === 1) {
      const id = `health_start_${Date.now()}`;
      this.worker.postMessage({
        id,
        type: "START_HEALTH_POLL",
        payload: {
          intervalMs,
          origin:
            typeof window !== "undefined" ? window.location.origin : undefined,
        },
      } satisfies ApiWorkerRequest);
    }

    return () => {
      this.healthListeners.delete(listener);
      if (this.worker && this.healthListeners.size === 0) {
        const id = `health_stop_${Date.now()}`;
        this.worker.postMessage({
          id,
          type: "STOP_HEALTH_POLL",
          payload: {},
        } satisfies ApiWorkerRequest);
      }
    };
  }

  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.pendingRequests.clear();
      this.healthListeners.clear();
    }
  }
}

// Export singleton instance
export const apiWorker = new ApiWorkerClient();
