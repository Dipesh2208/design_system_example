import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Custom native hook replacing remix-i18next/react.
 * Synchronizes client i18next instance when server loader locale changes.
 */
export function useChangeLanguage(locale: string): void {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (locale && i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);
}
