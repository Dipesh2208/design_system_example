import { createCookie } from "@remix-run/node";
import { RemixI18Next } from "remix-i18next/server";
import i18nConfig from "./i18n";
import { resources } from "./locales/resources";

export const localeCookie = createCookie("i18n", {
  path: "/",
  sameSite: "lax",
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  maxAge: 365 * 24 * 60 * 60, // 1 year
});

export const i18next = new RemixI18Next({
  detection: {
    supportedLanguages: [...i18nConfig.supportedLngs],
    fallbackLanguage: i18nConfig.fallbackLng,
    cookie: localeCookie,
    order: ["cookie", "custom", "searchParams"],
    async findLocale(request: Request) {
      // Direct raw cookie reader fallback for client-written document.cookie
      const cookieHeader = request.headers.get("Cookie") || "";
      const match = cookieHeader.match(/(?:^|;\s*)i18n=([^;]+)/);
      if (match) {
        const val = decodeURIComponent(match[1]).replace(/^"|"$/g, "");
        if (i18nConfig.supportedLngs.includes(val as any)) {
          return val;
        }
      }
      return null;
    },
  },
  i18next: {
    ...i18nConfig,
    resources,
  },
});
