import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "../useAppStore";

describe("useAppStore (Senior Zustand Store Architecture)", () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      theme: "dark",
      language: "gu",
      isSidebarCollapsed: false,
    });
    localStorage.clear();
  });

  describe("Theme Slice", () => {
    it("should initialize with default dark theme", () => {
      const state = useAppStore.getState();
      expect(state.theme).toBe("dark");
    });

    it("should update theme and sync data-theme on documentElement", () => {
      const { setTheme } = useAppStore.getState();
      setTheme("rose-red");

      expect(useAppStore.getState().theme).toBe("rose-red");
      expect(document.documentElement.getAttribute("data-theme")).toBe(
        "rose-red",
      );
    });

    it("should support all 6 themes", () => {
      const themes = [
        "dark",
        "light",
        "rose-red",
        "azure-blue",
        "magenta-violet",
        "cyan-orange",
      ] as const;

      themes.forEach((t) => {
        useAppStore.getState().setTheme(t);
        expect(useAppStore.getState().theme).toBe(t);
        expect(document.documentElement.getAttribute("data-theme")).toBe(t);
      });
    });
  });

  describe("Sidebar Collapse Slice", () => {
    it("should start with sidebar expanded (false)", () => {
      expect(useAppStore.getState().isSidebarCollapsed).toBe(false);
    });

    it("should toggle sidebar collapse correctly", () => {
      const { toggleSidebar } = useAppStore.getState();

      toggleSidebar();
      expect(useAppStore.getState().isSidebarCollapsed).toBe(true);

      toggleSidebar();
      expect(useAppStore.getState().isSidebarCollapsed).toBe(false);
    });

    it("should explicitly set sidebar collapsed state", () => {
      const { setSidebarCollapsed } = useAppStore.getState();

      setSidebarCollapsed(true);
      expect(useAppStore.getState().isSidebarCollapsed).toBe(true);

      setSidebarCollapsed(false);
      expect(useAppStore.getState().isSidebarCollapsed).toBe(false);
    });
  });

  describe("Language Slice", () => {
    it("should initialize with default language", () => {
      expect(useAppStore.getState().language).toBe("gu");
    });

    it("should update language correctly", () => {
      const { setLanguage } = useAppStore.getState();

      setLanguage("en");
      expect(useAppStore.getState().language).toBe("en");

      setLanguage("hi");
      expect(useAppStore.getState().language).toBe("hi");
    });
  });
});
