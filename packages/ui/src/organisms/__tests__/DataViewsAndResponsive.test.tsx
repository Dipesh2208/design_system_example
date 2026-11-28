import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppAdaptiveDataView } from "../AppAdaptiveDataView";
import { AppVirtualTable } from "../AppVirtualTable";
import { AppVirtualCardList } from "../AppVirtualCardList";

describe("Data View & Responsive / Non-Responsive Suite", () => {
  const sampleData = [
    { id: "1", name: "Alice", email: "alice@example.com", amount: "$100" },
    { id: "2", name: "Bob", email: "bob@example.com", amount: "$250" },
  ];

  const columns = [
    { key: "name", header: "Name", sortable: true },
    { key: "email", header: "Email" },
    { key: "amount", header: "Total Paid" },
  ];

  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1200,
    });
  });

  describe("AppAdaptiveDataView - Responsive Switching", () => {
    it("renders in Table mode on desktop width (>= 1024px)", () => {
      window.innerWidth = 1200;
      render(
        <AppAdaptiveDataView
          data={sampleData}
          columns={columns}
          renderCard={(item) => <div data-testid="card-item">{item.name}</div>}
        />,
      );

      // Verify Table header renders
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.queryByTestId("card-item")).not.toBeInTheDocument();
    });

    it("switches to Card list mode on mobile viewport (< 1024px)", () => {
      window.innerWidth = 500;

      render(
        <AppAdaptiveDataView
          data={sampleData}
          columns={columns}
          breakpoint={1024}
          renderCard={(item) => <div data-testid="card-item">{item.name}</div>}
        />,
      );

      // Card mode button or elements
      const cardToggleBtn = screen.getByRole("button", { name: /card/i });
      fireEvent.click(cardToggleBtn);

      // Table headers are not rendered in card list mode
      expect(screen.queryByText("Total Paid")).not.toBeInTheDocument();
    });
  });

  describe("AppAdaptiveDataView - Explicit NON-RESPONSIVE / Desktop-Lock QA Test", () => {
    it("CRITICAL LEAD QA TEST: Locks to non-responsive Table mode on mobile screens when breakpoint=0 or overridden", () => {
      window.innerWidth = 375;

      // Setting breakpoint=0 or user forcing table mode enforces strictly non-responsive table view
      render(
        <AppAdaptiveDataView
          data={sampleData}
          columns={columns}
          breakpoint={0} // Disables automatic mobile card switching
          allowViewSwitch={false} // Locks view
          renderCard={(item) => <div data-testid="card-item">{item.name}</div>}
        />,
      );

      // Verify table headers are STILL rendered even on narrow 375px screens
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.queryByTestId("card-item")).not.toBeInTheDocument();
    });

    it("allows user manual override to force Table mode despite small screen", () => {
      window.innerWidth = 500;
      render(
        <AppAdaptiveDataView
          data={sampleData}
          columns={columns}
          breakpoint={1024}
          allowViewSwitch={true}
          renderCard={(item) => <div data-testid="card-item">{item.name}</div>}
        />,
      );

      // Click Table mode override toggle
      const tableToggleBtn = screen.getByRole("button", { name: /table/i });
      fireEvent.click(tableToggleBtn);

      // Table headers should now be present
      expect(screen.getByText("Name")).toBeInTheDocument();
    });
  });

  describe("AppVirtualTable - Fixed Minimum Column Widths & Overflow Defense", () => {
    it("renders table with sortable column headers and fires onSort", () => {
      const handleSort = vi.fn();
      render(
        <AppVirtualTable
          data={sampleData}
          columns={columns}
          onSort={handleSort}
        />,
      );

      const nameHeader = screen.getByText("Name");
      fireEvent.click(nameHeader);
      expect(handleSort).toHaveBeenCalledWith("name");
    });

    it("renders empty state when data array is empty", () => {
      render(
        <AppVirtualTable
          data={[]}
          columns={columns}
          emptyState={<div>No customers found in ledger.</div>}
        />,
      );
      expect(
        screen.getByText("No customers found in ledger."),
      ).toBeInTheDocument();
    });

    it("renders expanded accordion row details when isRowExpanded returns true", () => {
      vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(
        600,
      );
      vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(
        600,
      );
      vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
        width: 1000,
        height: 600,
        top: 0,
        left: 0,
        bottom: 600,
        right: 1000,
      } as DOMRect);

      render(
        <AppVirtualTable
          data={sampleData}
          columns={columns}
          getRowId={(row) => row.id}
          isRowExpanded={(row) => row.id === "1"}
          renderExpandedRow={(row) => (
            <div data-testid={`expanded-details-${row.id}`}>
              Accordion Details for {row.name}
            </div>
          )}
        />,
      );

      expect(screen.getByTestId("expanded-details-1")).toBeInTheDocument();
      expect(
        screen.getByText("Accordion Details for Alice"),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("expanded-details-2"),
      ).not.toBeInTheDocument();
    });

    it("fires onRowClick when a table row is clicked to toggle accordion", () => {
      vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(
        600,
      );
      vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(
        600,
      );
      vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
        width: 1000,
        height: 600,
        top: 0,
        left: 0,
        bottom: 600,
        right: 1000,
      } as DOMRect);

      const handleRowClick = vi.fn();
      render(
        <AppVirtualTable
          data={sampleData}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={handleRowClick}
        />,
      );

      const aliceRow = screen.getByText("Alice");
      fireEvent.click(aliceRow);
      expect(handleRowClick).toHaveBeenCalledWith(sampleData[0], 0);
    });
  });

  describe("AppVirtualCardList", () => {
    it("renders empty state when empty", () => {
      render(
        <AppVirtualCardList
          data={[]}
          renderCard={() => null}
          emptyState={<div>Zero cards available</div>}
        />,
      );
      expect(screen.getByText("Zero cards available")).toBeInTheDocument();
    });
  });
});
