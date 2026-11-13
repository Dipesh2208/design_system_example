"use client";

import React, { createContext, useContext, useEffect, useSyncExternalStore } from "react";

export type ThemeType =
  | "dark"
  | "light"
  | "rose-red"
  | "azure-blue"
  | "magenta-violet"
  | "cyan-orange";

export interface ThemeOption {
  id: ThemeType;
  name: string;
  description: string;
  badgeColors: [string, string];
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "dark",
    name: "Dark Obsidian",
    description: "Deep obsidian backdrop with high-contrast text",
    badgeColors: ["#09090b", "#fafafa"],
  },
  {
    id: "light",
    name: "Light Clean",
    description: "Neutral slate and bright surfaces",
    badgeColors: ["#ffffff", "#0f172a"],
  },
  {
    id: "rose-red",
    name: "Rose & Red",
    description: "Crimson warmth and soft blush tones",
    badgeColors: ["#e11d48", "#fff1f2"],
  },
  {
    id: "azure-blue",
    name: "Azure & Blue",
    description: "Oceanic sky and cobalt trust tones",
    badgeColors: ["#0284c7", "#f0f9ff"],
  },
  {
    id: "magenta-violet",
    name: "Magenta & Violet",
    description: "Electric violet with vivid magenta accents",
    badgeColors: ["#9333ea", "#faf5ff"],
  },
  {
    id: "cyan-orange",
    name: "Cyan & Orange (WCAG AA)",
    description: "High-contrast teal and warm amber calibrated for 4.5:1+ contrast",
    badgeColors: ["#0e7490", "#c2410c"],
  },
];

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themes: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "admin-app-theme";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("theme-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("theme-change", callback);
  };
}

export function MultiThemeProvider({
  children,
  defaultTheme = "dark",
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeType;
}) {
  const theme = useSyncExternalStore<ThemeType>(
    subscribe,
    () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY) as ThemeType | null;
        if (stored && THEME_OPTIONS.some((t) => t.id === stored)) {
          return stored;
        }
      } catch {
        // Fallback if localStorage is inaccessible
      }
      return defaultTheme;
    },
    () => defaultTheme
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeType) => {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
      window.dispatchEvent(new Event("theme-change"));
    } catch {
      // Ignore localStorage errors
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEME_OPTIONS }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a MultiThemeProvider");
  }
  return context;
}
