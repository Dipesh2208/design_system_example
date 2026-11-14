import { useTranslation } from "react-i18next";
import { useFetcher } from "@remix-run/react";
import {
  LanguageDropdownOrganism,
  DEFAULT_LANGUAGES,
} from "@repo/ui/organisms";
import { useAppStore, type LanguageType } from "@repo/ui/stores";

export function LanguageSelector({ className = "" }: { className?: string }) {
  const { i18n } = useTranslation();
  const fetcher = useFetcher();

  // Centralized Zustand store synchronization
  const storeLanguage = useAppStore((state) => state.language);
  const setStoreLanguage = useAppStore((state) => state.setLanguage);

  const handleLanguageChange = (newLng: string) => {
    // 1. Update i18next runtime
    i18n.changeLanguage(newLng);
    // 2. Update Zustand store
    setStoreLanguage(newLng as LanguageType);
    // 3. Persist to session cookie for Remix SSR
    fetcher.submit(
      { lng: newLng },
      { method: "post", action: "/api/set-language" },
    );
  };

  const currentLang = storeLanguage || i18n.language?.slice(0, 2) || "gu";

  return (
    <LanguageDropdownOrganism
      className={className}
      currentLanguage={currentLang}
      onLanguageSelect={handleLanguageChange}
      languages={DEFAULT_LANGUAGES}
    />
  );
}
