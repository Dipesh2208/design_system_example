/**
 * Client-side and hybrid VPN & Proxy Detection Utility
 * Designed for laptops, desktops, and mobile browsers.
 */

export interface VpnSecurityStatus {
  isVpn: boolean;
  isProxy?: boolean;
  isTor?: boolean;
  isDatacenter?: boolean;
  ip?: string;
  isp?: string;
  country?: string;
  city?: string;
  ipTimezone?: string;
  clientTimezone?: string;
  deviceType: "mobile" | "tablet" | "desktop";
  reason?: string;
  timestamp: number;
}

export const MOCK_VPN_STORAGE_KEY = "AGY_MOCK_VPN_ACTIVE";

/**
 * Detects whether the current device is a mobile phone, tablet, or laptop/desktop PC.
 */
export function detectDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "desktop";
  }

  const ua = navigator.userAgent || "";
  const isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /(iPad|Tablet|(Android(?!.*Mobile)))/i.test(ua);

  if (isTablet) return "tablet";
  if (isMobile) return "mobile";
  return "desktop";
}

/**
 * Gets the device's local timezone as reported by the browser/OS.
 */
export function getClientTimezone(): string {
  if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }
  return "UTC";
}

/**
 * Checks for a mock testing override via URL parameter (?vpn_test=true/1) or localStorage.
 */
export function getMockVpnOverride(): boolean | null {
  if (typeof window === "undefined") return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const testParam = urlParams.get("vpn_test") || urlParams.get("vpn");
    if (testParam === "true" || testParam === "1") return true;
    if (testParam === "false" || testParam === "0") return false;

    const stored = window.localStorage.getItem(MOCK_VPN_STORAGE_KEY);
    if (stored !== null) {
      return stored === "true" || stored === "1";
    }
  } catch {
    // Ignore sandbox or security errors in reading storage
  }

  return null;
}

/**
 * Sets a mock VPN status for QA/testing without requiring an actual paid VPN.
 */
export function setMockVpnOverride(enabled: boolean | null): void {
  if (typeof window === "undefined") return;
  try {
    if (enabled === null) {
      window.localStorage.removeItem(MOCK_VPN_STORAGE_KEY);
    } else {
      window.localStorage.setItem(MOCK_VPN_STORAGE_KEY, enabled ? "true" : "false");
    }
  } catch {
    // Ignore
  }
}

/**
 * Verifies network status against the server-side API or mock testing environment.
 */
export async function checkNetworkSecurityStatus(
  apiEndpoint = "/api/security/network-check"
): Promise<VpnSecurityStatus> {
  const device = detectDeviceType();
  const clientTz = getClientTimezone();

  // Check manual/URL override first for QA testing
  const override = getMockVpnOverride();
  if (override !== null) {
    return {
      isVpn: override,
      isProxy: override,
      isDatacenter: override,
      ip: override ? "198.51.100.42 (VPN Tunnel)" : "103.21.244.0 (Direct)",
      isp: override ? "NordVPN / Express Gateway" : "Local ISP / Broadband",
      country: override ? "United States" : "India",
      city: override ? "Ashburn" : "Ahmedabad",
      ipTimezone: override ? "America/New_York" : clientTz,
      clientTimezone: clientTz,
      deviceType: device,
      reason: override ? "MOCK_TEST_OVERRIDE_VPN" : undefined,
      timestamp: Date.now(),
    };
  }

  if (typeof window === "undefined") {
    return {
      isVpn: false,
      deviceType: "desktop",
      clientTimezone: clientTz,
      timestamp: Date.now(),
    };
  }

  try {
    const res = await fetch(`${apiEndpoint}?_cb=${Date.now()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Client-Timezone": clientTz,
        "X-Device-Type": device,
      },
    });

    if (res.ok) {
      const data = await res.json();
      return {
        isVpn: Boolean(data.isVpn),
        isProxy: Boolean(data.isProxy),
        isTor: Boolean(data.isTor),
        isDatacenter: Boolean(data.isDatacenter),
        ip: data.clientIp || data.ip,
        isp: data.isp,
        country: data.country,
        city: data.city,
        ipTimezone: data.ipTimezone,
        clientTimezone: clientTz,
        deviceType: device,
        reason: data.reason,
        timestamp: Date.now(),
      };
    }
  } catch (err) {
    // If network check fails, don't falsely lock out unless offline (OfflineModal handles pure offline)
  }

  return {
    isVpn: false,
    deviceType: device,
    clientTimezone: clientTz,
    timestamp: Date.now(),
  };
}
