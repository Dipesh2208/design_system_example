import React from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "@remix-run/react";
import { Languages } from "lucide-react";
import { supportedLngs, type SupportedLng } from "../../../app/i18n";

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

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const fetcher = useFetcher();
  const currentLng = ((i18n.language || "gu").slice(0, 2) || "gu") as SupportedLng;

  const handleLanguageChange = async (newLng: SupportedLng) => {
    if (newLng === currentLng) return;

    // 1. Immediately switch client i18next language (triggers instant React re-render of useTranslation components)
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
    <nav
      aria-label={t("a11y.languageSelector", "Language selector")}
      className="inline-flex items-center gap-1.5 p-1 bg-secondary rounded-xl border border-border text-xs font-medium"
      role="region"
    >
      <span className="flex items-center gap-1 px-2 text-muted-foreground select-none" aria-hidden="true">
        <Languages className="w-3.5 h-3.5" />
      </span>
      <div className="flex items-center gap-1" role="group" aria-label={t("a11y.languageSelector", "Language selector")}>
        {supportedLngs.map((lng: SupportedLng) => {
          const isSelected = currentLng === lng;
          return (
            <button
              key={lng}
              type="button"
              onClick={() => handleLanguageChange(lng)}
              aria-pressed={isSelected}
              className={`px-2.5 py-1.5 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                isSelected
                  ? "bg-card shadow-xs text-primary font-bold border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              }`}
            >
              {t(`languages.${lng}`)}
            </button>
          );
        })}
      </div>
    </nav>
  );
}