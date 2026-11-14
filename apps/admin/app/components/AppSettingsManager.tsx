"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "@remix-run/react";
import {
  AppSettingsModal,
  type ThemeOptionItem,
  type LanguageOptionItem,
} from "@repo/ui/organisms";
import {
  useAppStore,
  type ThemeType,
  type LanguageType,
} from "@repo/ui/stores";
import { THEME_OPTIONS } from "./ThemeProvider";

const SETTINGS_LANGUAGES: LanguageOptionItem[] = [
  {
    id: "gu",
    code: "gu",
    label: "ગુજરાતી",
    nativeLabel: "Gujarati",
  },
  {
    id: "en",
    code: "en",
    label: "English",
    nativeLabel: "English (US)",
  },
  {
    id: "hi",
    code: "hi",
    label: "हिंदी",
    nativeLabel: "Hindi",
  },
];

export interface AppSettingsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSettingsManager({
  isOpen,
  onClose,
}: AppSettingsManagerProps) {
  const { i18n } = useTranslation();
  const fetcher = useFetcher();

  const currentTheme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  const currentLanguage = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);

  const handleLanguageChange = (newLng: LanguageType) => {
    i18n.changeLanguage(newLng);
    setLanguage(newLng);
    fetcher.submit(
      { lng: newLng },
      { method: "post", action: "/api/set-language" },
    );
  };

  return (
    <AppSettingsModal
      isOpen={isOpen}
      onClose={onClose}
      currentTheme={currentTheme}
      onThemeSelect={(t) => setTheme(t)}
      currentLanguage={currentLanguage}
      onLanguageSelect={handleLanguageChange}
      themes={THEME_OPTIONS as ThemeOptionItem[]}
      languages={SETTINGS_LANGUAGES}
    />
  );
}
