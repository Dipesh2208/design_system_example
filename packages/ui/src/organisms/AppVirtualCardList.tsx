import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

export interface AppVirtualCardListProps<T> {
  data: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  estimatedCardHeight?: number;
  maxHeight?: number | string;
  getItemId?: (item: T, index: number) => string | number;
  emptyState?: React.ReactNode;
  className?: string;
  gap?: number;
}

export function AppVirtualCardList<T>({
  data,
  renderCard,
  estimatedCardHeight = 160,
  maxHeight = 600,
  getItemId,
  emptyState,
  className = "",
  gap = 12,
}: AppVirtualCardListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedCardHeight + gap,
    overscan: 6,
  });

  return (
    <div
      ref={parentRef}
      style={{
        maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
        overflowY: "auto",
      }}
      className={`w-full relative scroll-smooth focus:outline-none ${className}`}
    >
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          {emptyState || <p className="text-sm">No items found.</p>}
        </div>
      ) : (
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = data[virtualItem.index];
            if (!item) return null;
            const itemId = getItemId
              ? getItemId(item, virtualItem.index)
              : virtualItem.index;

            return (
              <div
                key={itemId}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size - gap}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {renderCard(item, virtualItem.index)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
