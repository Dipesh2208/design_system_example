import React, { useState, useEffect } from "react";
import {
  WifiOff,
  Cable,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from "lucide-react";
import { AppButton } from "../atoms/AppButton";

export interface OfflineStatusModalTranslations {
  title?: string;
  subtitle?: string;
  checkTipsTitle?: string;
  tipWifi?: string;
  tipLan?: string;
  tipRouter?: string;
  retryButton?: string;
  checkingButton?: string;
  onlineRestoredMessage?: string;
  stillOfflineMessage?: string;
}

export interface OfflineStatusModalProps {
  translations?: OfflineStatusModalTranslations;
  className?: string;
  // Optional override for testing/manual control
  isForceOffline?: boolean;
}

/**
 * Tests external WAN internet via native image probe.
 * Browsers never apply CORS restrictions to image loading.
 */
function probeExternalImage(url: string, timeoutMs = 2500): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof Image === "undefined") {
      resolve(false);
      return;
    }

    let isSettled = false;
    const img = new Image();

    const cleanup = () => {
      isSettled = true;
      img.onload = null;
      img.onerror = null;
    };

    const timer = setTimeout(() => {
      if (!isSettled) {
        cleanup();
        resolve(false);
      }
    }, timeoutMs);

    img.onload = () => {
      if (!isSettled) {
        clearTimeout(timer);
        cleanup();
        resolve(true);
      }
    };

    img.onerror = () => {
      if (!isSettled) {
        clearTimeout(timer);
        cleanup();
        resolve(false);
      }
    };

    // Cache-bust query to guarantee a live network packet is sent
    img.src = `${url}?_cb=${Date.now()}`;
  });
}

/**
 * Tests direct application health endpoint (/api/health)
 */
async function probeAppHealth(timeoutMs = 2500): Promise<boolean> {
  if (typeof fetch === "undefined") return false;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`/api/health?_cb=${Date.now()}`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);

    return res.ok || res.status === 200;
  } catch {
    return false;
  }
}

/**
 * Comprehensive, foolproof check for internet and network connection:
 * 1. Checks navigator.onLine
 * 2. Runs dual probes: Image probe to high-availability CDN + app /api/health probe
 */
export async function probeInternetConnection(
  isForceOffline?: boolean,
): Promise<boolean> {
  // If explicitly forced offline in props/testing, always report offline
  if (isForceOffline) {
    return false;
  }

  // If navigator itself reports offline (e.g. Chrome DevTools Offline or Wi-Fi disabled), device is offline
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return false;
  }

  // Fast-path dual probe:
  // - App health endpoint (/api/health)
  // - High-availability favicon from Google CDN
  const appProbePromise = probeAppHealth(2500);
  const cdnProbePromise = probeExternalImage(
    "https://www.gstatic.com/images/branding/product/1x/avatar_square_blue_512dp.png",
    2500,
  );

  // If EITHER probe succeeds, the device has working connectivity!
  const results = await Promise.allSettled([appProbePromise, cdnProbePromise]);

  for (const result of results) {
    if (result.status === "fulfilled" && result.value === true) {
      return true;
    }
  }

  // Fallback third probe: Cloudflare CDN favicon
  const cloudflareProbe = await probeExternalImage(
    "https://cdnjs.cloudflare.com/favicon.ico",
    2000,
  );
  if (cloudflareProbe) {
    return true;
  }

  return false;
}

export function OfflineStatusModal({
  translations = {},
  className = "",
  isForceOffline,
}: OfflineStatusModalProps) {
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof isForceOffline === "boolean") return isForceOffline;
    if (typeof navigator !== "undefined") return !navigator.onLine;
    return false;
  });
  const [isChecking, setIsChecking] = useState(false);
  const [showRestored, setShowRestored] = useState(false);
  const [showStillOffline, setShowStillOffline] = useState(false);

  const t = {
    title: translations.title || "No Internet Connection",
    subtitle:
      translations.subtitle ||
      "We couldn't connect to the network. Please check your internet connection.",
    checkTipsTitle: translations.checkTipsTitle || "Troubleshooting steps:",
    tipWifi:
      translations.tipWifi || "Ensure your Wi-Fi is turned on and connected.",
    tipLan:
      translations.tipLan ||
      "Check that your LAN / Ethernet network cable is firmly plugged in.",
    tipRouter:
      translations.tipRouter ||
      "Verify that your router or modem has an active internet connection.",
    retryButton: translations.retryButton || "Check Connection",
    checkingButton: translations.checkingButton || "Checking...",
    onlineRestoredMessage:
      translations.onlineRestoredMessage ||
      "Internet connection restored. Syncing data...",
    stillOfflineMessage:
      translations.stillOfflineMessage ||
      "Internet is still disconnected. Please check your connection and try again.",
  };

  useEffect(() => {
    if (typeof isForceOffline === "boolean") {
      return;
    }

    // Automatically check and dismiss when the browser signals reconnection
    const handleOnline = async () => {
      const isReallyOnline = await probeInternetConnection(isForceOffline);
      if (isReallyOnline) {
        setIsOffline(false);
        setShowStillOffline(false);
        setShowRestored(true);
        const timer = setTimeout(() => {
          setShowRestored(false);
        }, 3500);
        return () => clearTimeout(timer);
      } else {
        setIsOffline(true);
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowStillOffline(false);
      setShowRestored(false);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, [isForceOffline]);

  const handleCheckConnection = async () => {
    setIsChecking(true);
    setShowStillOffline(false);

    try {
      // Small visual delay so user sees button loading state
      await new Promise((resolve) => setTimeout(resolve, 400));

      const isReallyOnline = await probeInternetConnection(isForceOffline);

      if (isReallyOnline) {
        // Online confirmed: close modal & display restored confirmation toast
        setIsOffline(false);
        setShowStillOffline(false);
        setShowRestored(true);
        setTimeout(() => setShowRestored(false), 3000);
      } else {
        // Still offline: keep modal open & show alert
        setIsOffline(true);
        setShowStillOffline(true);
      }
    } catch {
      setIsOffline(true);
      setShowStillOffline(true);
    } finally {
      setIsChecking(false);
    }
  };

  // Toast notification when back online
  if (showRestored && !isOffline) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-500 text-white shadow-xl text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{t.onlineRestoredMessage}</span>
        </div>
      </div>
    );
  }

  if (!isOffline) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 ${className}`}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="offline-modal-title"
      aria-describedby="offline-modal-desc"
    >
      {/* Backdrop with solid blur */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-300" />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-card border border-border/80 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center transform transition-all animate-in zoom-in-95 duration-200">
        {/* BIG PULSING ICON CONTAINER */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-rose-500/10 border-2 border-rose-500/20 flex items-center justify-center text-rose-500 animate-pulse shadow-inner">
            <WifiOff className="w-12 h-12 stroke-[2.2]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-500">
            <Cable className="w-4 h-4" />
          </div>
        </div>

        {/* Modal Titles */}
        <h2
          id="offline-modal-title"
          className="text-xl sm:text-2xl font-bold text-foreground tracking-tight"
        >
          {t.title}
        </h2>
        <p
          id="offline-modal-desc"
          className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed max-w-sm"
        >
          {t.subtitle}
        </p>

        {/* Troubleshooting Guidance Card (Wi-Fi & LAN) */}
        <div className="w-full mt-6 p-4 rounded-2xl bg-muted/40 border border-border text-left space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{t.checkTipsTitle}</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-2 pl-1">
            <li className="flex items-start gap-2">
              <Radio className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span>{t.tipWifi}</span>
            </li>
            <li className="flex items-start gap-2">
              <Cable className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span>{t.tipLan}</span>
            </li>
            <li className="flex items-start gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span>{t.tipRouter}</span>
            </li>
          </ul>
        </div>

        {/* Still Disconnected Alert Notice */}
        {showStillOffline && (
          <div className="w-full mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2.5 text-left animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertTriangle className="w-4 h-4 shrink-0 text-destructive" />
            <span className="leading-snug">{t.stillOfflineMessage}</span>
          </div>
        )}

        {/* Action Button: Check Connection (strictly single-line inline layout) */}
        <div className="w-full mt-6">
          <AppButton
            type="button"
            variant="primary"
            size="md"
            fullWidth
            iconLayout="inline"
            containerResponsive={false}
            isLoading={isChecking}
            loadingText={t.checkingButton}
            disabled={isChecking}
            onClick={handleCheckConnection}
            leftIcon={
              <RefreshCw
                className={`w-4 h-4 shrink-0 ${isChecking ? "animate-spin" : ""}`}
              />
            }
            className="w-full !flex-row !items-center !justify-center gap-2 font-semibold text-sm shadow-md whitespace-nowrap"
          >
            <span>{t.retryButton}</span>
          </AppButton>
        </div>
      </div>
    </div>
  );
}
