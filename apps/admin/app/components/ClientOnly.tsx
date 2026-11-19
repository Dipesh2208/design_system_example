import * as React from "react";

export interface ClientOnlyProps {
  children: () => React.ReactNode;
  fallback?: React.ReactNode;
}

const emptySubscribe = () => () => {};

/**
 * ClientOnly (Remix Idiomatic Component)
 *
 * Renders fallback during SSR and mounts children only in the browser.
 * Uses useSyncExternalStore to avoid synchronous setState inside useEffect.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isServer = React.useSyncExternalStore(
    emptySubscribe,
    () => false,
    () => true,
  );

  return isServer ? <>{fallback}</> : <>{children()}</>;
}
