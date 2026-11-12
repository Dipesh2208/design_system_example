import React, { useEffect } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next/react";
import { i18next } from "./i18next.server";
import { MultiThemeProvider } from "@/components/theme/MultiThemeProvider";
import "./globals.css";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const locale = data?.locale || "gu";
  const titles: Record<string, string> = {
    gu: "રીમિક્સ + ટેઇલવિન્ડ v4 કન્ટેનર ક્વેરી ડિઝાઇન સિસ્ટમ - એપબટન",
    hi: "रीमिक्स + टेलविंड v4 कंटेनर क्वेरी डिज़ाइन सिस्टम - ऐपबटन",
    en: "Remix + Tailwind v4 Container Query Design System - AppButton",
  };
  const descriptions: Record<string, string> = {
    gu: "૧૩-બ્રેકપોઇન્ટ કન્ટેનર ક્વેરી અનુકૂલનક્ષમતા અને ૬ થીમ્સ સાથે યુનિવર્સલ એટોમિક એપબટનનું રીમિક્સ ફ્રેમવર્ક અમલીકરણ",
    hi: "१३-ब्रेकपॉइंट कंटेनर क्वेरी अनुकूलनशीलता और ६ थीम्स के साथ यूनिवर्सल एटॉमिक ऐपबटन का रीमिक્સ फ्रेमवर्क कार्यान्वयन",
    en: "Remix Framework implementation of Universal Atomic AppButton with 13-Breakpoint Container Query Adaptability and 6 Themes",
  };

  return [
    { title: titles[locale] || titles.gu },
    {
      name: "description",
      content: descriptions[locale] || descriptions.gu,
    },
  ];
};

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Noto+Sans+Gujarati:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const locale = await i18next.getLocale(request);
  return json({ locale });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const { i18n, t } = useTranslation();

  // If client i18n has initialized, prioritize active client language for instant switching
  const clientLocale = (i18n.language?.slice(0, 2) || data?.locale || "gu") as string;

  useChangeLanguage(data?.locale || "gu");

  // Keep dynamic document.title synchronized instantly whenever language changes without refresh
  useEffect(() => {
    const titleKey = t("meta.title");
    if (titleKey && typeof document !== "undefined") {
      document.title = titleKey;
    }
  }, [i18n.language, t]);

  return (
    <html lang={clientLocale} dir={i18n.dir()} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary transition-colors duration-200">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          {t("a11y.skipToContent", "Skip to main content")}
        </a>
        <MultiThemeProvider defaultTheme="light">
          {children}
        </MultiThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}