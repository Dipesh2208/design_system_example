"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeType =
  | "light"
  | "dark"
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
    id: "light",
    name: "Light Clean",
    description: "Neutral slate and bright surfaces",
    badgeColors: ["#ffffff", "#0f172a"],
  },
  {
    id: "dark",
    name: "Dark Obsidian",
    description: "Deep obsidian backdrop with high-contrast text",
    badgeColors: ["#09090b", "#fafafa"],
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

export function MultiThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "app-theme",
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeType;
  storageKey?: string;
}) {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey) as ThemeType | null;
      if (stored && THEME_OPTIONS.some((t) => t.id === stored)) {
        return stored;
      }
    }
    return defaultTheme;
  });

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

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
