import { createCookie } from "@remix-run/node";
import type { EntryContext } from "@remix-run/node";
import i18nConfig, { supportedLngs, fallbackLng, defaultNS } from "./i18n";

export const localeCookie = createCookie("i18n", {
  path: "/",
  sameSite: "lax",
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  maxAge: 365 * 24 * 60 * 60, // 1 year
});

interface RouteModuleWithI18n {
  i18n?: string | readonly string[];
}

/**
 * Native server-side internationalization helper replacing remix-i18next/server.
 * Resolves request locale from URL search parameters, cookies, or headers.
 */
export class NativeRemixI18Next {
  async getLocale(request: Request): Promise<string> {
    // 1. URL search parameter (?lng=gu)
    try {
      const url = new URL(request.url);
      const urlLng = url.searchParams.get("lng");
      if (urlLng && (supportedLngs as readonly string[]).includes(urlLng)) {
        return urlLng;
      }
    } catch {
      // Ignore URL parsing errors
    }

    // 2. Cookie resolution via Remix Cookie API
    const cookieHeader = request.headers.get("Cookie") || "";
    try {
      const parsedCookie = (await localeCookie.parse(cookieHeader)) as
        string | null;
      if (
        parsedCookie &&
        (supportedLngs as readonly string[]).includes(parsedCookie)
      ) {
        return parsedCookie;
      }
    } catch {
      // Ignore cookie parsing errors
    }

    // Direct regex match fallback for client-written document.cookie
    const match = cookieHeader.match(/(?:^|;\s*)i18n=([^;]+)/);
    if (match) {
      const val = decodeURIComponent(match[1]).replace(/^"|"$/g, "");
      if ((supportedLngs as readonly string[]).includes(val)) {
        return val;
      }
    }

    // 3. Accept-Language header
    const acceptLanguage = request.headers.get("Accept-Language");
    if (acceptLanguage) {
      for (const item of acceptLanguage.split(",")) {
        const lang = item.split(";")[0].trim().slice(0, 2).toLowerCase();
        if ((supportedLngs as readonly string[]).includes(lang)) {
          return lang;
        }
      }
    }

    return fallbackLng;
  }

  getRouteNamespaces(remixContext: EntryContext): string[] {
    const namespaces = new Set<string>([defaultNS]);
    if (remixContext && remixContext.routeModules) {
      const modules = Object.values(remixContext.routeModules) as Array<
        RouteModuleWithI18n | undefined
      >;
      for (const mod of modules) {
        if (!mod) continue;
        if (typeof mod.i18n === "string") {
          namespaces.add(mod.i18n);
        } else if (Array.isArray(mod.i18n)) {
          for (const ns of mod.i18n) {
            if (typeof ns === "string") {
              namespaces.add(ns);
            }
          }
        }
      }
    }
    return Array.from(namespaces);
  }
}

export const i18next = new NativeRemixI18Next();
