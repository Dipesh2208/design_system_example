import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ThemeType =
  | "dark"
  | "light"
  | "rose-red"
  | "azure-blue"
  | "magenta-violet"
  | "cyan-orange";

export type LanguageType = "gu" | "en" | "hi";

export interface AppState {
  // Theme state
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;

  // Language state
  language: LanguageType;
  setLanguage: (language: LanguageType) => void;

  // Sidebar layout state
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Content width state (Boxed vs Full-Width)
  isContentFullWidth: boolean;
  toggleContentFullWidth: () => void;
  setContentFullWidth: (fullWidth: boolean) => void;

  // Full Browser Height Viewport Mode (hides top header/margins to maximize table/card view)
  isBrowserFullHeight: boolean;
  toggleBrowserFullHeight: () => void;
  setBrowserFullHeight: (fullHeight: boolean) => void;

  // Hydration state
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Default theme
      theme: "dark",
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", theme);
        }
      },

      // Default language
      language: "gu",
      setLanguage: (language) => {
        set({ language });
      },

      // Default sidebar: expanded
      isSidebarCollapsed: false,
      toggleSidebar: () => {
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }));
      },
      setSidebarCollapsed: (isSidebarCollapsed) => {
        set({ isSidebarCollapsed });
      },

      // Content width: default boxed (false)
      isContentFullWidth: true,
      toggleContentFullWidth: () => {
        set((state) => ({ isContentFullWidth: !state.isContentFullWidth }));
      },
      setContentFullWidth: (isContentFullWidth) => {
        set({ isContentFullWidth });
      },

      // Default Browser Full Height: false
      isBrowserFullHeight: false,
      toggleBrowserFullHeight: () => {
        set((state) => ({ isBrowserFullHeight: !state.isBrowserFullHeight }));
      },
      setBrowserFullHeight: (isBrowserFullHeight) => {
        set({ isBrowserFullHeight });
      },

      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: "app_ui_store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        // Automatically sync DOM data-theme upon hydration
        if (state?.theme && typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", state.theme);
        }
      },
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    },
  ),
);

// High-performance atomic selector hooks
export const useTheme = () => useAppStore((state) => state.theme);
export const useSetTheme = () => useAppStore((state) => state.setTheme);

export const useLanguage = () => useAppStore((state) => state.language);
export const useSetLanguage = () => useAppStore((state) => state.setLanguage);

export const useIsSidebarCollapsed = () =>
  useAppStore((state) => state.isSidebarCollapsed);
export const useToggleSidebar = () =>
  useAppStore((state) => state.toggleSidebar);
export const useSetSidebarCollapsed = () =>
  useAppStore((state) => state.setSidebarCollapsed);
export const useHasHydrated = () => useAppStore((state) => state._hasHydrated);
