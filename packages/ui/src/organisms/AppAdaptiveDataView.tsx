import React, { useState, useEffect } from "react";
import { AppVirtualTable, ColumnDef } from "./AppVirtualTable";
import { AppVirtualCardList } from "./AppVirtualCardList";
import { LayoutGrid, Table as TableIcon } from "lucide-react";

export interface AppAdaptiveDataViewProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  renderCard: (item: T, index: number) => React.ReactNode;
  rowHeight?: number;
  estimatedCardHeight?: number;
  maxHeight?: number | string;
  sortColumn?: string | null;
  sortDirection?: "asc" | "desc" | null;
  onSort?: (columnKey: string) => void;
  onRowClick?: (row: T, index: number) => void;
  getId?: (item: T, index: number) => string | number;
  emptyState?: React.ReactNode;
  breakpoint?: number; // default: 1024 (Tailwind lg)
  allowViewSwitch?: boolean;
  className?: string;
  isRowExpanded?: (row: T, index: number) => boolean;
  renderExpandedRow?: (row: T, index: number) => React.ReactNode;
}

export function AppAdaptiveDataView<T>({
  data,
  columns,
  renderCard,
  rowHeight = 56,
  estimatedCardHeight = 160,
  maxHeight = 620,
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  getId,
  emptyState,
  breakpoint = 1024,
  allowViewSwitch = true,
  className = "",
  isRowExpanded,
  renderExpandedRow,
}: AppAdaptiveDataViewProps<T>) {
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [userModeOverride, setUserModeOverride] = useState<
    "table" | "card" | null
  >(null);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobileScreen(window.innerWidth < breakpoint);
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, [breakpoint]);

  const activeMode = userModeOverride || (isMobileScreen ? "card" : "table");

  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      {/* Controls Bar */}
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
        <span>
          Showing{" "}
          <strong className="text-zinc-900 dark:text-white font-semibold">
            {data.length}
          </strong>{" "}
          items
        </span>

        {allowViewSwitch && (
          <div className="inline-flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60">
            <button
              type="button"
              onClick={() => setUserModeOverride("table")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium ${
                activeMode === "table"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs"
                  : "hover:text-zinc-900 dark:hover:text-white"
              }`}
              title="Table view"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => setUserModeOverride("card")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium ${
                activeMode === "card"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs"
                  : "hover:text-zinc-900 dark:hover:text-white"
              }`}
              title="Card view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        )}
      </div>

      {/* Render Mode */}
      {activeMode === "table" ? (
        <AppVirtualTable
          data={data}
          columns={columns}
          rowHeight={rowHeight}
          maxHeight={maxHeight}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={onSort}
          onRowClick={onRowClick}
          getRowId={getId}
          emptyState={emptyState}
          isRowExpanded={isRowExpanded}
          renderExpandedRow={renderExpandedRow}
        />
      ) : (
        <AppVirtualCardList
          data={data}
          renderCard={renderCard}
          estimatedCardHeight={estimatedCardHeight}
          maxHeight={maxHeight}
          getItemId={getId}
          emptyState={emptyState}
        />
      )}
    </div>
  );
}
