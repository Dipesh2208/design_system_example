import React from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "@remix-run/react";
import { LanguageDropdownOrganism, DEFAULT_LANGUAGES } from "@repo/ui/organisms";
import type { SupportedLng } from "../../../app/i18n";

function setClientLanguageCookie(lng: string) {
  if (typeof document !== "undefined") {
    document.cookie = `i18n=${lng}; path=/; credentials=same-origin; max-age=31536000; SameSite=Lax`;
    try {
      localStorage.setItem("i18n_lng", lng);
    } catch {
      // Ignore if localStorage is disabled
    }
  }
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { i18n } = useTranslation();
  const fetcher = useFetcher();
  const currentLng = ((i18n.language || "gu").slice(0, 2) || "gu") as SupportedLng;

  const handleLanguageChange = async (newLng: string) => {
    if (newLng === currentLng) return;

    // 1. Immediately switch client i18next language
    await i18n.changeLanguage(newLng);

    // 2. Update document language attribute immediately
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", newLng);
      setClientLanguageCookie(newLng);
    }

    // 3. Inform Remix via fetcher to persist cookie in HTTP session and trigger background revalidation
    fetcher.submit(
      { lng: newLng },
      { method: "POST", action: "/api/set-language" }
    );
  };

  return (
    <LanguageDropdownOrganism
      className={className}
      currentLanguage={currentLng}
      onLanguageSelect={handleLanguageChange}
      languages={DEFAULT_LANGUAGES}
    />
  );
}
