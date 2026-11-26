import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { VpnSecurityModal } from "../VpnSecurityModal";
import * as vpnDetector from "../../lib/vpn-detector";

describe("VpnSecurityModal (Organism)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("does not render when VPN is inactive (isForceVpn=false)", () => {
    const { container } = render(<VpnSecurityModal isForceVpn={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders security modal and block notice when VPN is active (isForceVpn=true)", () => {
    render(<VpnSecurityModal isForceVpn={true} />);

    expect(
      screen.getByText(/VPN અથવા પ્રોક્સી કનેક્શન મળ્યું છે/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/VPN Block Active/i)).toBeInTheDocument();
    expect(
      screen.getByText(/તમારા લેપટોપ, પીસી કે મોબાઈલ ડિવાઇસમાંથી VPN તરત બંધ કરો/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /કનેક્શન ફરીથી તપાસો/i }),
    ).toBeInTheDocument();
  });

  it("accepts custom Gujarati and English translations", () => {
    render(
      <VpnSecurityModal
        isForceVpn={true}
        translations={{
          title: "VPN / Proxy Connection Detected",
          subtitle: "Please disable your VPN on laptop or mobile to continue.",
          reverifyButton: "Re-verify Connection",
          stepDisableVpn: "Turn off your VPN software or app.",
        }}
      />,
    );

    expect(
      screen.getByText("VPN / Proxy Connection Detected"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Please disable your VPN on laptop or mobile to continue.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Turn off your VPN software or app."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Re-verify Connection/i }),
    ).toBeInTheDocument();
  });

  it("shows still detected warning when re-verifying if VPN remains active", async () => {
    vi.spyOn(vpnDetector, "checkNetworkSecurityStatus").mockResolvedValue({
      isVpn: true,
      deviceType: "desktop",
      ip: "198.51.100.1",
      timestamp: Date.now(),
    });

    render(
      <VpnSecurityModal
        translations={{
          stillDetectedMessage: "VPN is still active! Please disconnect it.",
          reverifyButton: "Re-verify Connection",
        }}
      />,
    );

    // Initial check runs and detects VPN
    await waitFor(
      () => {
        expect(
          screen.getByRole("button", { name: /Re-verify Connection/i }),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const reverifyBtn = screen.getByRole("button", {
      name: /Re-verify Connection/i,
    });
    fireEvent.click(reverifyBtn);

    await waitFor(
      () => {
        expect(
          screen.getByText("VPN is still active! Please disconnect it."),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("dismisses and shows restored toast when VPN is turned off upon re-verification", async () => {
    vi.spyOn(vpnDetector, "checkNetworkSecurityStatus")
      .mockResolvedValueOnce({
        isVpn: true,
        deviceType: "mobile",
        ip: "198.51.100.1",
        timestamp: Date.now(),
      })
      .mockResolvedValueOnce({
        isVpn: false,
        deviceType: "mobile",
        ip: "103.21.244.1",
        timestamp: Date.now(),
      });

    render(
      <VpnSecurityModal
        translations={{
          accessRestoredMessage: "Secure access restored! VPN is off.",
          reverifyButton: "Re-verify Connection",
        }}
      />,
    );

    await waitFor(
      () => {
        expect(
          screen.getByRole("button", { name: /Re-verify Connection/i }),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const reverifyBtn = screen.getByRole("button", {
      name: /Re-verify Connection/i,
    });
    fireEvent.click(reverifyBtn);

    await waitFor(
      () => {
        expect(
          screen.getByText("Secure access restored! VPN is off."),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});
