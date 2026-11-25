import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export interface ColumnDef<T> {
  key: string;
  header: string;
  width?: string | number; // e.g. "200px" or "1fr"
  sortable?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface AppVirtualTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  rowHeight?: number;
  maxHeight?: number | string;
  sortColumn?: string | null;
  sortDirection?: "asc" | "desc" | null;
  onSort?: (columnKey: string) => void;
  onRowClick?: (row: T, index: number) => void;
  getRowId?: (row: T, index: number) => string | number;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
  // Accordion row expansion support
  isRowExpanded?: (row: T, index: number) => boolean;
  renderExpandedRow?: (row: T, index: number) => React.ReactNode;
}

export function AppVirtualTable<T>({
  data,
  columns,
  rowHeight = 64,
  maxHeight = 680,
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  getRowId,
  onEndReached,
  isLoadingMore = false,
  hasMore = false,
  emptyState,
  className = "",
  isRowExpanded,
  renderExpandedRow,
}: AppVirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Dynamic row height virtualizer with element measuring for Accordion expand/collapse
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 8,
    initialRect: {
      width: 1000,
      height: typeof maxHeight === "number" ? maxHeight : 600,
    },
    getItemKey: (index: number) => {
      const item = data[index];
      return item && getRowId ? getRowId(item, index) : index;
    },
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // Infinite Scroll Trigger
  React.useEffect(() => {
    if (!onEndReached || !hasMore || isLoadingMore || data.length === 0) return;
    const lastItem = virtualItems[virtualItems.length - 1];
    if (lastItem && lastItem.index >= data.length - 4) {
      onEndReached();
    }
  }, [virtualItems, onEndReached, hasMore, isLoadingMore, data.length]);

  return (
    <div
      className={`w-full min-h-[300px] rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xs shadow-xs flex flex-col overflow-hidden transition-all ${className}`}
    >
      {/* Sticky Table Header (Glassmorphic Frosted Header) */}
      <div className="bg-muted/80 backdrop-blur-md border-b border-border/80 select-none z-10 sticky top-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center px-4 sm:px-6 py-3.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {columns.map((col) => {
            const isSorted = sortColumn === col.key;
            return (
              <div
                key={col.key}
                style={{
                  flex:
                    typeof col.width === "number"
                      ? `0 0 ${col.width}px`
                      : col.width || 1,
                  minWidth:
                    typeof col.width === "number"
                      ? `${col.width}px`
                      : undefined,
                }}
                className={`flex items-center gap-1.5 ${
                  col.sortable
                    ? "cursor-pointer hover:text-foreground transition-colors"
                    : ""
                }`}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <span>{col.header}</span>
                {col.sortable && (
                  <span>
                    {isSorted ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-primary" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Virtualized Body Container */}
      <div
        ref={parentRef}
        style={{
          maxHeight:
            maxHeight === "100%"
              ? undefined
              : typeof maxHeight === "number"
                ? `${maxHeight}px`
                : maxHeight,
          overflowY: "auto",
        }}
        className={`w-full relative scroll-smooth focus:outline-none ${maxHeight === "100%" ? "flex-1 min-h-0" : ""}`}
      >
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-muted-foreground">
            {emptyState || (
              <p className="text-sm font-medium">
                No records found matching your criteria.
              </p>
            )}
          </div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualItems.map((virtualRow) => {
              const row = data[virtualRow.index];
              if (!row) return null;
              const rowId = getRowId
                ? getRowId(row, virtualRow.index)
                : virtualRow.index;
              const expanded = isRowExpanded
                ? isRowExpanded(row, virtualRow.index)
                : false;

              return (
                <div
                  key={rowId}
                  ref={rowVirtualizer.measureElement}
                  data-index={virtualRow.index}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className={`flex flex-col border-b border-border/40 select-none transition-colors ${
                    expanded ? "bg-muted/10 shadow-xs z-1" : ""
                  }`}
                >
                  {/* Primary Row Content */}
                  <div
                    onClick={() => onRowClick?.(row, virtualRow.index)}
                    style={{ minHeight: `${rowHeight}px` }}
                    className={`flex items-center px-4 sm:px-6 hover:bg-primary/[0.04] transition-all duration-150 ${
                      onRowClick ? "cursor-pointer group" : ""
                    } ${expanded ? "bg-muted/30" : ""}`}
                  >
                    {columns.map((col) => (
                      <div
                        key={col.key}
                        style={{
                          flex:
                            typeof col.width === "number"
                              ? `0 0 ${col.width}px`
                              : col.width || 1,
                          minWidth:
                            typeof col.width === "number"
                              ? `${col.width}px`
                              : undefined,
                        }}
                        className="truncate text-sm text-foreground"
                      >
                        {col.render
                          ? col.render(row, virtualRow.index)
                          : ((
                              row as Record<
                                string,
                                string | number | boolean | React.ReactNode
                              >
                            )[col.key] ?? "—")}
                      </div>
                    ))}
                  </div>

                  {/* Accordion Colspan Expanded Row */}
                  {expanded && renderExpandedRow && (
                    <div className="w-full bg-muted/20 border-t border-border/50 animate-in fade-in duration-200">
                      {renderExpandedRow(row, virtualRow.index)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Infinite Scroll Loading More Indicator */}
        {isLoadingMore && (
          <div className="flex items-center justify-center gap-2 py-3.5 border-t border-border bg-muted/20 text-xs text-muted-foreground animate-pulse">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span>Loading more records...</span>
          </div>
        )}
      </div>
    </div>
  );
}
