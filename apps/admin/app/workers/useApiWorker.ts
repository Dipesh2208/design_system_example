import { useState, useCallback, useEffect } from "react";
import type { JsonSerializable } from "./api.worker";
import { apiWorker, type FetchApiOptions } from "./apiWorkerClient";

interface UseApiWorkerState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export function useApiWorker<T extends JsonSerializable = JsonSerializable>() {
  const [state, setState] = useState<UseApiWorkerState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (url: string, options?: FetchApiOptions): Promise<T> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await apiWorker.fetchApi<T>(url, options);
        setState({ data: result, error: null, isLoading: false });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ data: null, error, isLoading: false });
        throw error;
      }
    },
    [],
  );

  const processData = useCallback(
    async <Item extends { [key: string]: JsonSerializable }>(
      items: Item[],
      searchTerm: string,
      searchKeys: string[],
    ): Promise<Item[]> => {
      return apiWorker.processData<Item>(items, searchTerm, searchKeys);
    },
    [],
  );

  return {
    ...state,
    execute,
    processData,
  };
}

/**
 * Hook to monitor system health via Web Worker background polling
 */
export function useSystemHealthWorker(intervalMs = 20000) {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = apiWorker.subscribeHealth((healthy) => {
      setIsHealthy(healthy);
      setLastCheck(Date.now());
    }, intervalMs);

    return unsubscribe;
  }, [intervalMs]);

  return { isHealthy, lastCheck };
}
