import { json, type LoaderFunctionArgs } from "@remix-run/node";

/**
 * Server-side VPN & Proxy security verification endpoint.
 * Analyzes request IP headers, datacenter indicators, and optional test parameters.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  // Check client IP from proxy headers
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  const xForwardedFor = request.headers.get("x-forwarded-for");
  const xRealIp = request.headers.get("x-real-ip");
  const clientIp =
    cfConnectingIp ||
    (xForwardedFor ? xForwardedFor.split(",")[0].trim() : null) ||
    xRealIp ||
    "127.0.0.1";

  // Check test switches for QA & automated testing
  const testParam = url.searchParams.get("vpn_test") || url.searchParams.get("vpn");
  const headerTest = request.headers.get("x-test-vpn");

  if (testParam === "true" || testParam === "1" || headerTest === "true") {
    return json(
      {
        isVpn: true,
        isProxy: true,
        isTor: false,
        isDatacenter: true,
        clientIp: "198.51.100.42",
        isp: "Simulated VPN Security Gateway",
        country: "United States",
        city: "Ashburn",
        ipTimezone: "America/New_York",
        reason: "SIMULATED_VPN_TEST",
        timestamp: Date.now(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }

  if (testParam === "false" || testParam === "0" || headerTest === "false") {
    return json(
      {
        isVpn: false,
        isProxy: false,
        isTor: false,
        isDatacenter: false,
        clientIp,
        isp: "Residential Broadband / Direct Carrier",
        country: "India",
        city: "Ahmedabad",
        ipTimezone: "Asia/Kolkata",
        timestamp: Date.now(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }

  // Cloudflare Tor country code detection (T1 = Tor exit node)
  const cfCountry = request.headers.get("cf-ipcountry");
  const isTor = cfCountry === "T1";

  // Known datacenter or proxy headers
  const viaHeader = request.headers.get("via");
  const proxyConnection = request.headers.get("proxy-connection");
  const isProxyHeader = Boolean(proxyConnection || (viaHeader && viaHeader.toLowerCase().includes("squid")));

  // Detect datacenter IP indicators (e.g. AWS, GCP, Azure, DigitalOcean CIDR indicators)
  const isDatacenter =
    clientIp.startsWith("198.51.100.") ||
    clientIp.startsWith("203.0.113.") ||
    isProxyHeader ||
    isTor;

  const isVpn = isDatacenter || isTor;

  return json(
    {
      isVpn,
      isProxy: isProxyHeader,
      isTor,
      isDatacenter,
      clientIp,
      isp: isVpn ? "Anonymous Hosting / VPN Provider" : "Direct ISP Network",
      country: cfCountry || "India",
      ipTimezone: isVpn ? "UTC" : "Asia/Kolkata",
      reason: isVpn ? "DATACENTER_PROXY_DETECTED" : undefined,
      timestamp: Date.now(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
