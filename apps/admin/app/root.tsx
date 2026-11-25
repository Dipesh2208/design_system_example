import React from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next/react";
import { OfflineStatusModal, VpnSecurityModal } from "@repo/ui/organisms";
import { ClientOnly } from "./components/ClientOnly";
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
      content:
        "Admin portal application with responsive mobile-first design, shared UI components, and 6-theme system.",
    },
    { name: "google", content: "notranslate" },
    { name: "theme-color", content: "#0f172a" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    {
      name: "apple-mobile-web-app-status-bar-style",
      content: "black-translucent",
    },
    { name: "apple-mobile-web-app-title", content: "AdminPortal" },
  ];
};

export const links: LinksFunction = () => [
  { rel: "manifest", href: "/manifest.webmanifest" },
  { rel: "icon", href: "/icons/icon-192.svg", type: "image/svg+xml" },
  { rel: "alternate icon", href: "/favicon.ico" },
  { rel: "apple-touch-icon", href: "/icons/icon-192.svg" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const locale = await i18next.getLocale(request);
  return json({ locale });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const { i18n, t } = useTranslation();
  const clientLocale = (i18n.language?.slice(0, 2) ||
    data?.locale ||
    "gu") as string;

  useChangeLanguage(data?.locale || "gu");

  return (
    <html
      lang={clientLocale}
      dir={i18n.dir()}
      translate="no"
      data-theme="dark"
      className="dark notranslate"
      suppressHydrationWarning
    >
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
          <ClientOnly>
            {() => (
              <>
                <OfflineStatusModal
                  translations={{
                    title: t("offline.title", "No Internet Connection"),
                    subtitle: t(
                      "offline.subtitle",
                      "We can't reach the server right now. Please check your network connection.",
                    ),
                    checkTipsTitle: t(
                      "offline.checkTipsTitle",
                      "Troubleshooting steps:",
                    ),
                    tipWifi: t(
                      "offline.tipWifi",
                      "Check Wi-Fi or router connection",
                    ),
                    tipLan: t(
                      "offline.tipLan",
                      "Ensure LAN / Ethernet cable is firmly plugged in",
                    ),
                    tipRouter: t(
                      "offline.tipRouter",
                      "Verify your modem / ISP is providing active data",
                    ),
                    retryButton: t("offline.retryButton", "Check Connection"),
                    checkingButton: t(
                      "offline.checkingButton",
                      "Checking connection...",
                    ),
                    onlineRestoredMessage: t(
                      "offline.onlineRestored",
                      "Internet connection restored. Syncing data...",
                    ),
                    stillOfflineMessage: t(
                      "offline.stillOffline",
                      "Internet is still disconnected. Please check your connection and try again.",
                    ),
                  }}
                />
                <VpnSecurityModal
                  translations={{
                    title: t("vpnSecurity.title"),
                    subtitle: t("vpnSecurity.subtitle"),
                    instructionTitle: t("vpnSecurity.instructionTitle"),
                    stepDisableVpn: t("vpnSecurity.stepDisableVpn"),
                    stepDisableProxy: t("vpnSecurity.stepDisableProxy"),
                    stepReverify: t("vpnSecurity.stepReverify"),
                    reverifyButton: t("vpnSecurity.reverifyButton"),
                    reverifyingButton: t("vpnSecurity.reverifyingButton"),
                    stillDetectedMessage: t("vpnSecurity.stillDetected"),
                    accessRestoredMessage: t("vpnSecurity.accessRestored"),
                    deviceLabel: t("vpnSecurity.deviceLabel"),
                    ipLabel: t("vpnSecurity.ipLabel"),
                    networkLabel: t("vpnSecurity.networkLabel"),
                    laptopDeviceName: t("vpnSecurity.laptopDevice"),
                    mobileDeviceName: t("vpnSecurity.mobileDevice"),
                    tabletDeviceName: t("vpnSecurity.tabletDevice"),
                  }}
                />
              </>
            )}
          </ClientOnly>
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
