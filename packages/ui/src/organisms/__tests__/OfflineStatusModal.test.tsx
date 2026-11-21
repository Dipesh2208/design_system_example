import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import {
  OfflineStatusModal,
  probeInternetConnection,
} from "../OfflineStatusModal";

describe("OfflineStatusModal (Organism)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("does not render when online", () => {
    const { container } = render(<OfflineStatusModal isForceOffline={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders big icon and offline alert modal when offline", () => {
    render(<OfflineStatusModal isForceOffline={true} />);

    expect(screen.getByText("No Internet Connection")).toBeInTheDocument();
    expect(
      screen.getByText(
        "We couldn't connect to the network. Please check your internet connection.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Troubleshooting steps:")).toBeInTheDocument();
    expect(
      screen.getByText(/Ensure your Wi-Fi is turned on/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Check that your LAN \/ Ethernet/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Check Connection/i }),
    ).toBeInTheDocument();
  });

  it("accepts custom translations", () => {
    render(
      <OfflineStatusModal
        isForceOffline={true}
        translations={{
          title: "ઇન્ટરનેટ કનેક્શન નથી",
          subtitle: "નેટવર્ક સાથે કનેક્ટ થઈ શક્યું નથી.",
          retryButton: "કનેક્શન ફરીથી તપાસો",
        }}
      />,
    );

    expect(screen.getByText("ઇન્ટરનેટ કનેક્શન નથી")).toBeInTheDocument();
    expect(
      screen.getByText("નેટવર્ક સાથે કનેક્ટ થઈ શક્યું નથી."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /કનેક્શન ફરીથી તપાસો/i }),
    ).toBeInTheDocument();
  });

  it("strictly keeps modal open and shows still offline notice when real internet is not reachable", async () => {
    // Mock global fetch to simulate failed network probe (no internet over Wi-Fi or LAN)
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network down"));

    render(
      <OfflineStatusModal
        isForceOffline={true}
        translations={{
          retryButton: "Check Connection",
          stillOfflineMessage: "Still offline, check Wi-Fi or LAN cable",
        }}
      />,
    );

    const button = screen.getByRole("button", { name: /Check Connection/i });
    fireEvent.click(button);

    // Modal must NOT close, and the warning notice must be shown
    await waitFor(() => {
      expect(
        screen.getByText("Still offline, check Wi-Fi or LAN cable"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("No Internet Connection")).toBeInTheDocument();
  });

  it("probeInternetConnection returns false when isForceOffline is true", async () => {
    const isOnline = await probeInternetConnection(true);
    expect(isOnline).toBe(false);
  });
});
