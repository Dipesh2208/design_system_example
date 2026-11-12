"use client";

import React, { useState, useEffect, useRef } from "react";
// Import pure stateless atoms & molecules directly from shared @repo/ui
import { AppButton } from "@repo/ui/atoms/AppButton";
import { AppBadge } from "@repo/ui/atoms/AppBadge";
import { ButtonGroup } from "@repo/ui/molecules/ButtonGroup";
import { FormFieldAction } from "@repo/ui/molecules/FormFieldAction";
import { PaymentActionCard } from "@repo/ui/molecules/PaymentActionCard";
import { ContainerBreakpointBadge } from "@repo/ui/molecules/ContainerBreakpointBadge";

// Theme Context from Organism level
import { useTheme, THEME_OPTIONS } from "@/components/theme/MultiThemeProvider";

import {
  Trash2,
  ExternalLink,
  Sliders,
  Sparkles,
  RefreshCw,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Send,
} from "lucide-react";

interface BreakpointSpec {
  variant: string;
  rem: string;
  px: number;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const BREAKPOINT_TABLE: BreakpointSpec[] = [
  {
    variant: "@3xs",
    rem: "16rem",
    px: 256,
    label: "Compact Mini-Card / Sidebar",
    icon: <Smartphone className="w-3.5 h-3.5" />,
    description: "w-full, px-2.5, min-h-11 touch target, text-xs, truncate",
  },
  {
    variant: "@2xs",
    rem: "18rem",
    px: 288,
    label: "Small Mobile Container",
    icon: <Smartphone className="w-3.5 h-3.5" />,
    description: "w-full, px-3, text-xs",
  },
  {
    variant: "@xs",
    rem: "20rem",
    px: 320,
    label: "Standard Narrow Mobile (320px)",
    icon: <Smartphone className="w-3.5 h-3.5" />,
    description: "w-full, px-3.5, text-sm",
  },
  {
    variant: "@sm",
    rem: "24rem",
    px: 384,
    label: "Large Mobile (384px)",
    icon: <Smartphone className="w-3.5 h-3.5" />,
    description: "w-full @md:w-auto option, px-4, text-sm",
  },
  {
    variant: "@md",
    rem: "28rem",
    px: 448,
    label: "Phablet / Modal Width",
    icon: <Tablet className="w-3.5 h-3.5" />,
    description: "Transitions cleanly from stacked full-width to inline auto-width (@md:w-auto)",
  },
  {
    variant: "@lg",
    rem: "32rem",
    px: 512,
    label: "Standard Dialog / Card",
    icon: <Tablet className="w-3.5 h-3.5" />,
    description: "Balanced padding (@lg:px-5), text-sm",
  },
  {
    variant: "@xl",
    rem: "36rem",
    px: 576,
    label: "Wide Card / Drawer",
    icon: <Tablet className="w-3.5 h-3.5" />,
    description: "Comfortable spacing (@xl:px-6)",
  },
  {
    variant: "@2xl",
    rem: "42rem",
    px: 672,
    label: "Small Tablet / Split Pane",
    icon: <Tablet className="w-3.5 h-3.5" />,
    description: "Scaled font-size (@2xl:text-base)",
  },
  {
    variant: "@3xl",
    rem: "48rem",
    px: 768,
    label: "Tablet Portrait (768px)",
    icon: <Laptop className="w-3.5 h-3.5" />,
    description: "Crisp inline button group alignment (@3xl:gap-2.5)",
  },
  {
    variant: "@4xl",
    rem: "56rem",
    px: 896,
    label: "Tablet Landscape / Compact Laptop",
    icon: <Laptop className="w-3.5 h-3.5" />,
    description: "Expansive padding (@4xl:px-7)",
  },
  {
    variant: "@5xl",
    rem: "64rem",
    px: 1024,
    label: "Standard Desktop / Laptop (1024px)",
    icon: <Laptop className="w-3.5 h-3.5" />,
    description: "Refined hover & focus transitions (@5xl:px-8)",
  },
  {
    variant: "@6xl",
    rem: "72rem",
    px: 1152,
    label: "Wide Desktop (1152px)",
    icon: <Monitor className="w-3.5 h-3.5" />,
    description: "Wide desktop scaling (@6xl:text-base)",
  },
  {
    variant: "@7xl",
    rem: "80rem",
    px: 1280,
    label: "Ultrawide Container (1280px)",
    icon: <Monitor className="w-3.5 h-3.5" />,
    description: "Generous proportional padding (@7xl:px-9) without awkward stretching",
  },
];

/**
 * ButtonContainerTest (Organism / Sandbox Page)
 * In Atomic Design, this Organism acts as the state container.
 * All Atoms and Molecules inside are 100% Stateless and controlled via props.
 */
export function ButtonContainerTest() {
  const { theme, setTheme } = useTheme();

  // Organism-level State (Cleanly lifted from atoms & molecules)
  const [containerWidth, setContainerWidth] = useState<number>(448); // default @md
  const [clickCount, setClickCount] = useState<number>(0);
  const [formInput, setFormInput] = useState<string>("Enterprise Workspace Seat #1");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string>("");
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [viewMode, setViewMode] = useState<"interactive" | "matrix" | "all-breakpoints">(
    "interactive"
  );

  // Timer refs to prevent memory leaks on unmount
  const formTimerRef = useRef<NodeJS.Timeout | null>(null);
  const paymentTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (formTimerRef.current) clearTimeout(formTimerRef.current);
      if (paymentTimerRef.current) clearTimeout(paymentTimerRef.current);
    };
  }, []);

  // Identify active breakpoint
  const activeBreakpoint = [...BREAKPOINT_TABLE]
    .reverse()
    .find((b) => containerWidth >= b.px) || {
    variant: "< @3xs",
    rem: "<16rem",
    px: containerWidth,
    label: "Sub-Container Mini (Touch Enforced)",
    icon: <Smartphone className="w-3.5 h-3.5" />,
    description: "Narrower than 256px: retains WCAG 44px touch target & truncation",
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormSuccessMessage("");
    formTimerRef.current = setTimeout(() => {
      setIsSubmitting(false);
      setFormSuccessMessage(`Form payload "${formInput}" dispatched securely!`);
    }, 1500);
  };

  const handlePaymentCheckout = () => {
    if (isPaying) return;
    setIsPaying(true);
    setPaymentStatus("");
    paymentTimerRef.current = setTimeout(() => {
      setIsPaying(false);
      setPaymentStatus("Payment verified & authenticated via 256-bit TLS gateway!");
    }, 1500);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="border border-border/80 bg-card rounded-2xl p-6 sm:p-8 shadow-sm backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2">
              <AppBadge variant="default" icon={<Sparkles className="w-3 h-3" />}>
                Atomic Design Architecture: Pure Stateless Atoms & Molecules
              </AppBadge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Production-Ready Atomic Design System Sandbox
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Strictly adheres to Atomic Design principles: shared stateless atoms (<code>AppButton</code>, <code>AppBadge</code>, <code>AppInput</code>, <code>AppSpinner</code>) and stateless composite molecules (<code>ButtonGroup</code>, <code>FormFieldAction</code>, <code>PaymentActionCard</code>) in <code>@repo/ui</code>.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="inline-flex p-1 bg-secondary rounded-xl border border-border text-xs font-medium self-start md:self-center shrink-0">
            <button
              onClick={() => setViewMode("interactive")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "interactive"
                  ? "bg-card shadow-xs text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Interactive Slider
            </button>
            <button
              onClick={() => setViewMode("all-breakpoints")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "all-breakpoints"
                  ? "bg-card shadow-xs text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              13-Breakpoint Grid
            </button>
            <button
              onClick={() => setViewMode("matrix")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "matrix"
                  ? "bg-card shadow-xs text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              6-Theme Matrix
            </button>
          </div>
        </div>

        {/* 6-Theme Selector Bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2">
            Active Theme:
          </span>
          {THEME_OPTIONS.map((item) => {
            const isSelected = theme === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTheme(item.id)}
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/30"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/80"
                }`}
              >
                <span className="flex -space-x-1">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-border shadow-xs"
                    style={{ backgroundColor: item.badgeColors[0] }}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-border shadow-xs"
                    style={{ backgroundColor: item.badgeColors[1] }}
                  />
                </span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW MODE 1: Interactive Resizer & Breakpoint Tester */}
      {viewMode === "interactive" && (
        <div className="space-y-8">
          {/* Draggable Width Control Panel */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-lg text-primary">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Container Width Simulator</h2>
                  <p className="text-xs text-muted-foreground">
                    Resize the parent container to observe how atoms & molecules adapt dynamically via <code className="font-mono">@container</code>.
                  </p>
                </div>
              </div>

              {/* Molecule: ContainerBreakpointBadge */}
              <ContainerBreakpointBadge
                variantLabel={activeBreakpoint.variant}
                widthPx={containerWidth}
                icon={activeBreakpoint.icon}
              />
            </div>

            {/* Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                <span>256px (@3xs)</span>
                <span className="font-bold text-foreground">{containerWidth}px</span>
                <span>1360px (&gt;@7xl)</span>
              </div>
              <input
                type="range"
                min={256}
                max={1360}
                value={containerWidth}
                onChange={(e) => setContainerWidth(Number(e.target.value))}
                className="w-full h-2.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Breakpoint Quick Selectors */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-xs font-medium text-muted-foreground mr-1">Jump to:</span>
              {BREAKPOINT_TABLE.map((b) => (
                <button
                  key={b.variant}
                  onClick={() => setContainerWidth(b.px)}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono transition-all ${
                    containerWidth === b.px
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                  title={`${b.variant} (${b.rem} / ${b.px}px)`}
                >
                  {b.variant}
                </button>
              ))}
            </div>
          </div>

          {/* SIMULATED CONTAINER BOX */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>Parent Container Viewport</span>
              <span className="font-mono">
                style: max-width: {containerWidth}px | current: {activeBreakpoint.label}
              </span>
            </div>

            <div className="p-4 sm:p-6 bg-secondary/30 border-2 border-dashed border-border rounded-2xl flex justify-center overflow-x-auto">
              <div
                style={{ width: `${containerWidth}px`, maxWidth: "100%" }}
                className="@container transition-all duration-300 bg-card border border-border rounded-xl p-5 sm:p-6 shadow-md space-y-6"
              >
                {/* Container Internal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-foreground">
                      Parent Container: {containerWidth}px
                    </span>
                  </div>
                  <span className="text-muted-foreground font-mono">
                    Breakpoint: {activeBreakpoint.variant} ({activeBreakpoint.rem})
                  </span>
                </div>

                {/* Scenario 1: Action Variants using Molecule ButtonGroup */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Action Variants (ButtonGroup Molecule)
                  </span>
                  <ButtonGroup orientation="responsive">
                    <AppButton variant="primary">
                      Primary Action
                    </AppButton>
                    <AppButton variant="payment" onClick={handlePaymentCheckout} isLoading={isPaying}>
                      Secure Pay
                    </AppButton>
                    <AppButton variant="secondary">
                      Secondary
                    </AppButton>
                    <AppButton variant="outline">
                      Outline Action
                    </AppButton>
                    <AppButton variant="destructive" leftIcon={<Trash2 className="w-4 h-4" />}>
                      Delete
                    </AppButton>
                  </ButtonGroup>
                </div>

                {/* Scenario 2: Stateless Molecule: PaymentActionCard */}
                <PaymentActionCard
                  amountLabel="$99.00"
                  isLoading={isPaying}
                  loadingText="Authorizing $99.00..."
                  statusMessage={paymentStatus}
                  onPay={handlePaymentCheckout}
                />

                {/* Scenario 3: Stateless Molecule: FormFieldAction */}
                <FormFieldAction
                  id="customer-payload"
                  label="Form Submission (Stateless Molecule)"
                  inputValue={formInput}
                  onInputChange={(e) => setFormInput(e.target.value)}
                  onSubmit={handleFormSubmit}
                  isLoading={isSubmitting}
                  loadingText="Submitting..."
                  submitButtonText="Submit Form"
                  buttonIcon={<Send className="w-3.5 h-3.5" />}
                  successMessage={formSuccessMessage}
                />

                {/* Scenario 4: Counter Atoms & Polymorphic Link */}
                <div className="flex flex-col @md:flex-row @md:items-center justify-between gap-3 pt-2 border-t border-border">
                  <ButtonGroup orientation="horizontal" spacing="sm">
                    <AppButton
                      variant="secondary"
                      onClick={() => setClickCount((c) => c + 1)}
                    >
                      Clicks: {clickCount}
                    </AppButton>
                    <AppButton
                      variant="ghost"
                      onClick={() => setClickCount(0)}
                      leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    >
                      Reset
                    </AppButton>
                  </ButtonGroup>

                  <AppButton
                    asChild
                    variant="outline"
                    rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    <a
                      href="https://tailwindcss.com/docs/container-queries"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Container Docs
                    </a>
                  </AppButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: All 13 Breakpoints Rendered Side-by-Side */}
      {viewMode === "all-breakpoints" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">13-Breakpoint Reference Matrix</h2>
            <p className="text-xs text-muted-foreground">
              Every container width rendered at its exact pixel boundary.
            </p>
          </div>

          <div className="space-y-6">
            {BREAKPOINT_TABLE.map((bp) => (
              <div
                key={bp.variant}
                className="p-5 bg-card border border-border rounded-xl shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-md bg-secondary text-primary font-mono text-xs font-bold">
                      {bp.variant}
                    </span>
                    <span className="text-xs font-bold">{bp.label}</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      ({bp.rem} / {bp.px}px)
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground italic">
                    {bp.description}
                  </span>
                </div>

                <div className="overflow-x-auto p-3 bg-secondary/30 rounded-lg">
                  <div
                    style={{ width: `${bp.px}px`, maxWidth: "100%" }}
                    className="@container bg-card p-4 rounded-lg border border-border/80 shadow-xs space-y-3"
                  >
                    <ButtonGroup orientation="responsive" spacing="sm">
                      <AppButton variant="primary">
                        Primary ({bp.variant})
                      </AppButton>
                      <AppButton variant="payment">
                        Secure Checkout
                      </AppButton>
                      <AppButton variant="outline">
                        Cancel
                      </AppButton>
                    </ButtonGroup>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: 6-Theme Comparative Matrix */}
      {viewMode === "matrix" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">6-Theme Simultaneous Comparison</h2>
            <p className="text-xs text-muted-foreground">
              Review button styling across all 6 themes side-by-side using local data-theme isolation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {THEME_OPTIONS.map((themeItem) => (
              <div
                key={themeItem.id}
                data-theme={themeItem.id}
                className="bg-card text-foreground border border-border rounded-2xl p-6 shadow-sm space-y-4 transition-all"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex -space-x-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-border shadow-xs"
                        style={{ backgroundColor: themeItem.badgeColors[0] }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-border shadow-xs"
                        style={{ backgroundColor: themeItem.badgeColors[1] }}
                      />
                    </span>
                    <h3 className="text-sm font-bold">{themeItem.name}</h3>
                  </div>
                  <AppBadge variant="secondary" className="text-[10px] uppercase font-mono">
                    {themeItem.id}
                  </AppBadge>
                </div>

                <p className="text-xs text-muted-foreground">
                  {themeItem.description}
                </p>

                <div className="@container space-y-2.5 pt-2">
                  <AppButton variant="primary" className="w-full">
                    Primary Action
                  </AppButton>
                  <AppButton variant="payment" className="w-full">
                    Payment Gateway
                  </AppButton>
                  <div className="grid grid-cols-2 gap-2">
                    <AppButton variant="secondary">
                      Secondary
                    </AppButton>
                    <AppButton variant="outline">
                      Outline
                    </AppButton>
                  </div>
                  <AppButton variant="destructive" className="w-full" leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
                    Destructive Action
                  </AppButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
