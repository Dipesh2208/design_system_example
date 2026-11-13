import React from "react";
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
import { MultiThemeProvider } from "./components/ThemeProvider";
import "./globals.css";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const locale = data?.locale || "gu";
  const titles: Record<string, string> = {
    gu: "એડમિન પોર્ટલ - ગૂગલ ઓથ અને મલ્ટી-લેંગ્વેજ",
    hi: "एडमिन पोर्टल - गूगल ऑथ और बहु-भाषी समर्थन",
    en: "Admin Portal - Google Auth & Multilingual Support",
  };

  return [
    { title: titles[locale] || titles.gu },
    {
      name: "description",
      content: "Admin portal application with responsive mobile-first design, shared UI components, and 6-theme system.",
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
  const { i18n } = useTranslation();
  const clientLocale = (i18n.language?.slice(0, 2) || data?.locale || "gu") as string;

  useChangeLanguage(data?.locale || "gu");

  return (
    <html lang={clientLocale} dir={i18n.dir()} data-theme="dark" className="dark" suppressHydrationWarning>
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
          Skip to main content
        </a>
        <MultiThemeProvider defaultTheme="dark">
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
