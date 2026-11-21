import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../button";
import { Card } from "../card";
import { Code } from "../code";

describe("Legacy Base Components", () => {
  describe("Button", () => {
    it("renders children and triggers alert on click", () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      render(<Button appName="Docs">Click Legacy</Button>);

      const btn = screen.getByRole("button", { name: "Click Legacy" });
      expect(btn).toBeInTheDocument();
      fireEvent.click(btn);
      expect(alertSpy).toHaveBeenCalledWith("Hello from your Docs app!");
      alertSpy.mockRestore();
    });
  });

  describe("Card", () => {
    it("renders title, description and target link with UTM params", () => {
      render(
        <Card title="Turborepo" href="https://turbo.build">
          Fast build system
        </Card>
      );

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("target", "_blank");
      expect(screen.getByText("Fast build system")).toBeInTheDocument();
      expect(screen.getByText(/Turborepo/)).toBeInTheDocument();
    });
  });

  describe("Code", () => {
    it("renders code snippet with className", () => {
      render(<Code className="font-mono">npm install</Code>);
      const codeEl = screen.getByText("npm install");
      expect(codeEl).toBeInTheDocument();
      expect(codeEl).toHaveClass("font-mono");
    });
  });
});
