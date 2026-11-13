import { useTranslation } from "react-i18next";
import { useFetcher } from "@remix-run/react";
import { LanguageDropdownOrganism, DEFAULT_LANGUAGES } from "@repo/ui/organisms";

export function LanguageSelector({ className = "" }: { className?: string }) {
  const { i18n } = useTranslation();
  const fetcher = useFetcher();

  const handleLanguageChange = (newLng: string) => {
    i18n.changeLanguage(newLng);
    fetcher.submit({ lng: newLng }, { method: "post", action: "/api/set-language" });
  };

  const currentLang = i18n.language?.slice(0, 2) || "gu";

  return (
    <LanguageDropdownOrganism
      className={className}
      currentLanguage={currentLang}
      onLanguageSelect={handleLanguageChange}
      languages={DEFAULT_LANGUAGES}
    />
  );
}
