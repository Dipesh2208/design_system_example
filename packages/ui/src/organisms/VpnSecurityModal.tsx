import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Lock,
  RefreshCw,
  AlertTriangle,
  Smartphone,
  Laptop,
  Monitor,
  CheckCircle2,
  GlobeLock,
  Radio,
} from "lucide-react";
import { AppButton } from "../atoms/AppButton";
import {
  checkNetworkSecurityStatus,
  detectDeviceType,
  VpnSecurityStatus,
} from "../lib/vpn-detector";

export interface VpnSecurityModalTranslations {
  title?: string;
  subtitle?: string;
  instructionTitle?: string;
  stepDisableVpn?: string;
  stepDisableProxy?: string;
  stepReverify?: string;
  reverifyButton?: string;
  reverifyingButton?: string;
  stillDetectedMessage?: string;
  accessRestoredMessage?: string;
  deviceLabel?: string;
  ipLabel?: string;
  networkLabel?: string;
  laptopDeviceName?: string;
  mobileDeviceName?: string;
  tabletDeviceName?: string;
}

export interface VpnSecurityModalProps {
  translations?: VpnSecurityModalTranslations;
  className?: string;
  /** Explicit override for automated testing or manual storybook control */
  isForceVpn?: boolean;
  /** Custom endpoint for server IP verification */
  endpoint?: string;
  /** Periodic poll interval in milliseconds (default: 30000ms / 30s) */
  checkIntervalMs?: number;
  /** Callback fired when VPN state changes */
  onVpnStatusChange?: (isVpn: boolean, status?: VpnSecurityStatus) => void;
}

export function VpnSecurityModal({
  translations = {},
  className = "",
  isForceVpn,
  endpoint = "/api/security/network-check",
  checkIntervalMs = 30000,
  onVpnStatusChange,
}: VpnSecurityModalProps) {
  const [isVpnActive, setIsVpnActive] = useState<boolean>(() => {
    if (typeof isForceVpn === "boolean") return isForceVpn;
    return false;
  });

  const isVpnActiveRef = React.useRef(isVpnActive);
  useEffect(() => {
    isVpnActiveRef.current = isVpnActive;
  }, [isVpnActive]);

  const isEffectiveVpnActive =
    typeof isForceVpn === "boolean" ? isForceVpn : isVpnActive;

  const [statusDetails, setStatusDetails] = useState<VpnSecurityStatus | null>(
    null,
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [showStillDetected, setShowStillDetected] = useState(false);
  const [showRestored, setShowRestored] = useState(false);

  const t = {
    title:
      translations.title ||
      "VPN અથવા પ્રોક્સી કનેક્શન મળ્યું છે (VPN / Proxy Detected)",
    subtitle:
      translations.subtitle ||
      "સુરક્ષા નિયમો અનુસાર આ સિસ્ટમનો ઉપયોગ કરતી વખતે VPN કે પ્રોક્સી ચાલુ રાખવાની મંજૂરી નથી. આગળ વધવા માટે કૃપા કરીને તેને બંધ કરો.",
    instructionTitle:
      translations.instructionTitle || "એક્સેસ ફરી શરૂ કરવાના પગલાં:",
    stepDisableVpn:
      translations.stepDisableVpn ||
      "તમારા લેપટોપ, પીસી કે મોબાઈલ ડિવાઇસમાંથી VPN તરત બંધ કરો.",
    stepDisableProxy:
      translations.stepDisableProxy ||
      "કોઈપણ બ્રાઉઝર પ્રોક્સી કે સિક્યોરિટી ટનલ એક્સ્ટેંશન બંધ કરો.",
    stepReverify:
      translations.stepReverify ||
      "VPN બંધ કર્યા પછી નીચે આપેલ 'કનેક્શન ફરીથી તપાસો' બટન દબાવો.",
    reverifyButton: translations.reverifyButton || "કનેક્શન ફરીથી તપાસો",
    reverifyingButton: translations.reverifyingButton || "ચકાસી રહ્યું છે...",
    stillDetectedMessage:
      translations.stillDetectedMessage ||
      "VPN હજુ પણ ચાલુ છે! કૃપા કરીને તમારા ડિવાઇસમાં VPN સંપૂર્ણપણે બંધ કરો.",
    accessRestoredMessage:
      translations.accessRestoredMessage ||
      "VPN સુરક્ષિત રીતે બંધ થઈ ગયું છે. એક્સેસ પુનઃસ્થાપિત થયો!",
    deviceLabel: translations.deviceLabel || "ડિવાઇસ પ્રકાર:",
    ipLabel: translations.ipLabel || "ડિટેક્ટ થયેલ IP:",
    networkLabel: translations.networkLabel || "નેટવર્ક:",
    laptopDeviceName: translations.laptopDeviceName || "લેપટોપ / પીસી બ્રાઉઝર",
    mobileDeviceName: translations.mobileDeviceName || "મોબાઇલ બ્રાઉઝર",
    tabletDeviceName: translations.tabletDeviceName || "ટેબ્લેટ બ્રાઉઝર",
  };

  const verifyStatus = useCallback(
    async (isManualRetry = false): Promise<boolean> => {
      if (typeof isForceVpn === "boolean") {
        if (onVpnStatusChange) onVpnStatusChange(isForceVpn);
        return isForceVpn;
      }

      try {
        const status = await checkNetworkSecurityStatus(endpoint);
        setStatusDetails(status);
        const active = Boolean(status.isVpn);

        const wasActive = isVpnActiveRef.current;
        setIsVpnActive(active);
        if (onVpnStatusChange) onVpnStatusChange(active, status);

        if (!active && wasActive && isManualRetry) {
          setShowRestored(true);
          setShowStillDetected(false);
          setTimeout(() => setShowRestored(false), 3500);
        } else if (active && isManualRetry) {
          setShowStillDetected(true);
        }

        return active;
      } catch {
        return false;
      }
    },
    [endpoint, isForceVpn, onVpnStatusChange],
  );

  // Initial and reactive event listeners for live detection on laptop/mobile
  useEffect(() => {
    if (typeof isForceVpn === "boolean") {
      return;
    }

    let isMounted = true;

    const performCheck = async () => {
      try {
        const status = await checkNetworkSecurityStatus(endpoint);
        if (isMounted) {
          setStatusDetails(status);
          const active = Boolean(status.isVpn);
          setIsVpnActive(active);
          if (onVpnStatusChange) onVpnStatusChange(active, status);
        }
      } catch {
        // Ignore network errors
      }
    };

    performCheck();

    // Re-check whenever tab becomes visible (user returns from switching VPN in settings)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        verifyStatus();
      }
    };

    // Re-check whenever network interface toggles online/offline
    const handleNetworkChange = () => {
      verifyStatus();
    };

    if (typeof window !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("online", handleNetworkChange);
      window.addEventListener("focus", handleVisibilityChange);

      // Periodic security heartbeat check (e.g. Every 30 seconds)
      const intervalId = setInterval(() => {
        verifyStatus();
      }, checkIntervalMs);

      return () => {
        isMounted = false;
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
        window.removeEventListener("online", handleNetworkChange);
        window.removeEventListener("focus", handleVisibilityChange);
        clearInterval(intervalId);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [checkIntervalMs, endpoint, isForceVpn, onVpnStatusChange, verifyStatus]);

  const handleManualReverify = async () => {
    setIsVerifying(true);
    setShowStillDetected(false);

    try {
      // Intentional short delay for UI feedback
      await new Promise((r) => setTimeout(r, 450));
      const active = await verifyStatus(true);
      if (active) {
        setShowStillDetected(true);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const device = statusDetails?.deviceType || detectDeviceType();

  // Render restored confirmation toast
  if (showRestored && !isEffectiveVpnActive) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl text-sm font-semibold border border-emerald-400/40">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-100" />
          <span>{t.accessRestoredMessage}</span>
        </div>
      </div>
    );
  }

  if (!isEffectiveVpnActive) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 ${className}`}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="vpn-modal-title"
      aria-describedby="vpn-modal-desc"
    >
      {/* Heavy Security Backdrop Blur */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300" />

      {/* Modal Security Card */}
      <div className="relative w-full max-w-lg bg-card border-2 border-rose-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center transform transition-all animate-in zoom-in-95 duration-200">
        {/* Pulsing Security Shield Icon */}
        <div className="relative mb-5">
          <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-rose-500/15 border-2 border-rose-500/30 flex items-center justify-center text-rose-500 animate-pulse shadow-inner">
            <ShieldAlert className="w-12 h-12 stroke-[2.2]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-500/25 border-2 border-amber-500/50 flex items-center justify-center text-amber-500">
            <GlobeLock className="w-4 h-4" />
          </div>
        </div>

        {/* Security Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold uppercase tracking-wider mb-3">
          <Lock className="w-3.5 h-3.5" />
          <span>VPN Block Active</span>
        </div>

        {/* Title & Subtitle */}
        <h2
          id="vpn-modal-title"
          className="text-lg sm:text-2xl font-bold text-foreground tracking-tight"
        >
          {t.title}
        </h2>
        <p
          id="vpn-modal-desc"
          className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed max-w-md"
        >
          {t.subtitle}
        </p>

        {/* Context metadata (device, IP info) */}
        <div className="w-full mt-4 p-3 rounded-2xl bg-muted/30 border border-border/70 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            {device === "mobile" && (
              <Smartphone className="w-4 h-4 text-primary" />
            )}
            {device === "tablet" && (
              <Smartphone className="w-4 h-4 text-primary" />
            )}
            {device === "desktop" && (
              <Laptop className="w-4 h-4 text-primary" />
            )}
            <span>
              {t.deviceLabel}{" "}
              {device === "mobile"
                ? t.mobileDeviceName
                : device === "tablet"
                  ? t.tabletDeviceName
                  : t.laptopDeviceName}
            </span>
          </div>
          {statusDetails?.ip && (
            <div className="text-[11px] font-mono text-muted-foreground">
              {t.ipLabel}{" "}
              <span className="font-semibold text-rose-500">
                {statusDetails.ip}
              </span>
            </div>
          )}
        </div>

        {/* Troubleshooting Instructions Card */}
        <div className="w-full mt-4 p-4 rounded-2xl bg-muted/50 border border-border text-left space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{t.instructionTitle}</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-2 pl-1">
            <li className="flex items-start gap-2">
              <Radio className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
              <span className="font-medium text-foreground">
                {t.stepDisableVpn}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <GlobeLock className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span>{t.stepDisableProxy}</span>
            </li>
            <li className="flex items-start gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>{t.stepReverify}</span>
            </li>
          </ul>
        </div>

        {/* Still Active Warning */}
        {showStillDetected && (
          <div className="w-full mt-4 p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-semibold flex items-center gap-2.5 text-left animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertTriangle className="w-4 h-4 shrink-0 text-destructive" />
            <span className="leading-snug">{t.stillDetectedMessage}</span>
          </div>
        )}

        {/* Re-verify Button */}
        <div className="w-full mt-6">
          <AppButton
            type="button"
            variant="primary"
            size="md"
            fullWidth
            iconLayout="inline"
            containerResponsive={false}
            isLoading={isVerifying}
            loadingText={t.reverifyingButton}
            disabled={isVerifying}
            onClick={handleManualReverify}
            leftIcon={
              <RefreshCw
                className={`w-4 h-4 shrink-0 ${isVerifying ? "animate-spin" : ""}`}
              />
            }
            className="w-full !flex-row !items-center !justify-center gap-2 font-semibold text-sm shadow-md whitespace-nowrap bg-rose-600 hover:bg-rose-700 focus:ring-rose-500"
          >
            <span>{t.reverifyButton}</span>
          </AppButton>
        </div>
      </div>
    </div>
  );
}
