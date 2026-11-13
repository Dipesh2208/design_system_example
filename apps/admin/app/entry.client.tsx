import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import i18next from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import i18nConfig from "./i18n";
import { resources } from "./locales/resources";

async function hydrate() {
  const serverLocale =
    document.documentElement.getAttribute("lang") || i18nConfig.fallbackLng;

  await i18next.use(initReactI18next).init({
    ...i18nConfig,
    lng: serverLocale,
    resources,
    react: {
      useSuspense: false,
    },
  });

  startTransition(() => {
    hydrateRoot(
      document,
      <I18nextProvider i18n={i18next}>
        <StrictMode>
          <RemixBrowser />
        </StrictMode>
      </I18nextProvider>
    );
  });
}

if (typeof window !== "undefined") {
  hydrate();
}
