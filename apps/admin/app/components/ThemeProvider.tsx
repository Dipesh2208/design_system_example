"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useAppStore, type ThemeType } from "@repo/ui/stores";

export { type ThemeType };

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
    description:
      "High-contrast teal and warm amber calibrated for 4.5:1+ contrast",
    badgeColors: ["#0e7490", "#c2410c"],
  },
];

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  initialTheme = "dark",
  defaultTheme = "dark",
}: {
  children: React.ReactNode;
  initialTheme?: ThemeType;
  defaultTheme?: ThemeType | string;
}) {
  // Sync directly with the centralized Zustand store
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  // Apply theme to HTML attribute immediately
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  const storeTheme = useAppStore((state) => state.theme);
  const storeSetTheme = useAppStore((state) => state.setTheme);

  if (context) return context;
  return { theme: storeTheme, setTheme: storeSetTheme };
}

export const MultiThemeProvider = ThemeProvider;
