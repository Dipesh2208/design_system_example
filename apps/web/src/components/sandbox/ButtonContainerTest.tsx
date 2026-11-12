"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
// Import pure stateless atoms & molecules directly from shared @repo/ui
import { AppButton } from "@repo/ui/atoms/AppButton";
import { AppBadge } from "@repo/ui/atoms/AppBadge";
import { ButtonGroup } from "@repo/ui/molecules/ButtonGroup";
import { FormFieldAction } from "@repo/ui/molecules/FormFieldAction";
import { PaymentActionCard } from "@repo/ui/molecules/PaymentActionCard";
import { ContainerBreakpointBadge } from "@repo/ui/molecules/ContainerBreakpointBadge";

// Theme Context from Organism level
import { useTheme, THEME_OPTIONS } from "@/components/theme/MultiThemeProvider";
import { LanguageSwitcher } from "@/components/language/LanguageSwitcher";

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
  labelKey: string;
  defaultLabel: string;
  icon: React.ReactNode;
  descKey: string;
  defaultDesc: string;
}

const BREAKPOINT_TABLE: BreakpointSpec[] = [
  {
    variant: "@3xs",
    rem: "16rem",
    px: 256,
    labelKey: "breakpoints.@3xs.label",
    defaultLabel: "Compact Mini-Card / Sidebar",
    icon: <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />,
    descKey: "breakpoints.@3xs.description",
    defaultDesc: "w-full, px-2.5, min-h-11 touch target, text-xs, truncate",
  },
  {
    variant: "@2xs",
    rem: "18rem",
    px: 288,
    labelKey: "breakpoints.@2xs.label",
    defaultLabel: "Small Mobile Container",
    icon: <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />,
    descKey: "breakpoints.@2xs.description",
    defaultDesc: "w-full, px-3, text-xs",
  },
  {
    variant: "@xs",
    rem: "20rem",
    px: 320,
    labelKey: "breakpoints.@xs.label",
    defaultLabel: "Standard Narrow Mobile (320px)",
    icon: <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />,
    descKey: "breakpoints.@xs.description",
    defaultDesc: "w-full, px-3.5, text-sm",
  },
  {
    variant: "@sm",
    rem: "24rem",
    px: 384,
    labelKey: "breakpoints.@sm.label",
    defaultLabel: "Large Mobile (384px)",
    icon: <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />,
    descKey: "breakpoints.@sm.description",
    defaultDesc: "w-full @md:w-auto option, px-4, text-sm",
  },
  {
    variant: "@md",
    rem: "28rem",
    px: 448,
    labelKey: "breakpoints.@md.label",
    defaultLabel: "Phablet / Modal Width",
    icon: <Tablet className="w-3.5 h-3.5" aria-hidden="true" />,
    descKey: "breakpoints.@md.description",
    defaultDesc: "Transitions cleanly from stacked full-width to inline auto-width (@md:w-auto)",
  },
  {
    variant: "@lg",
    rem: "32rem",
    px: 512,
    labelKey: "breakpoints.@lg.label",
    defaultLabel: "Standard Dialog / Card",
    icon: <Tablet className="w-3.5 h-3.5" aria-hidden="true" />,
    descKey: "breakpoints.@lg.description",
    defaultDesc: "Balanced padding (@lg:px-5), text-sm",
  },
  {
    variant: "@xl",
    rem: "36rem",
    px: 576,
    labelKey: "breakpoints.@xl.label",
    defaultLabel: "Wide Card / Drawer",
    icon: <Tablet className="w-3.5 h-3.5" aria-hidden="true" />,
    descKey: "breakpoints.@xl.description",
    defaultDesc: "Comfortable spacing (@xl:px-6)",
  },
  {
    variant: "@2xl",
    rem: "42rem",
    px: 672,
    labelKey: "breakpoints.@2xl.label",
    defaultLabel: "Small Tablet / Split Pane",
    icon: <Tablet className="w-3.5 h-3.5" aria-hidden="true" />,
    descKey: "breakpoints.@2xl.description",
    defaultDesc: "Scaled font-size (@2xl:text-base)",
  },
  {
    variant: "@3xl",
    rem: "48rem",
    px: 768,
    labelKey: "breakpoints.@3xl.label",
    defaultLabel: "Tablet Portrait (768px)",
    icon: <Laptop className="w-3.5 h-3.5" aria-hidden="true" />,
    descKey: "breakpoints.@3xl.description",
    defaultDesc: "Crisp inline button group alignment (@3xl:gap-2.5)",
  },
  {
    variant: "@4xl",
    rem: "56rem",
    px: 896,
    labelKey: "breakpoints.@4xl.label",
    defaultLabel: "Tablet Landscape / Compact Laptop",
    icon: <Laptop className="w-3.5 h-3.5" aria-hidden="true" />,
    descKey: "breakpoints.@4xl.description",
    defaultDesc: "Expansive padding (@4xl:px-7)",
  },
  {
    variant: "@5xl",
    rem: "64rem",
    px: 1024,
    labelKey: "breakpoints.@5xl.label",
    defaultLabel: "Standard Desktop / Laptop (1024px)",
    icon: <Laptop className="w-3.5 h-3.5" aria-hidden="true" />,
    descKey: "breakpoints.@5xl.description",
    defaultDesc: "Refined hover & focus transitions (@5xl:px-8)",
  },
  {
    variant: "@6xl",
    rem: "72rem",
    px: 1152,
    labelKey: "breakpoints.@6xl.label",
    defaultLabel: "Wide Desktop (1152px)",
    icon: <Monitor className="w-3.5 h-3.5" aria-hidden="true" />,
    descKey: "breakpoints.@6xl.description",
    defaultDesc: "Wide desktop scaling (@6xl:text-base)",
  },
  {
    variant: "@7xl",
    rem: "80rem",
    px: 1280,
    labelKey: "breakpoints.@7xl.label",
    defaultLabel: "Ultrawide Container (1280px)",
    icon: <Monitor className="w-3.5 h-3.5" aria-hidden="true" />,
    descKey: "breakpoints.@7xl.description",
    defaultDesc: "Generous proportional padding (@7xl:px-9) without awkward stretching",
  },
];

const THEME_KEYS: Record<string, string> = {
  light: "light",
  dark: "dark",
  "rose-red": "roseRed",
  "azure-blue": "azureBlue",
  "magenta-violet": "magentaViolet",
  "cyan-orange": "cyanOrange",
};

/**
 * ButtonContainerTest (Organism / Sandbox Page)
 * In Atomic Design, this Organism acts as the state container.
 * All Atoms and Molecules inside are 100% Stateless and controlled via props.
 */
export function ButtonContainerTest() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

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
  const matchedBreakpoint = [...BREAKPOINT_TABLE]
    .reverse()
    .find((b) => containerWidth >= b.px);

  const activeBreakpoint = matchedBreakpoint
    ? {
      variant: matchedBreakpoint.variant,
      rem: matchedBreakpoint.rem,
      px: matchedBreakpoint.px,
      label: t(matchedBreakpoint.labelKey, matchedBreakpoint.defaultLabel),
      icon: matchedBreakpoint.icon,
      description: t(matchedBreakpoint.descKey, matchedBreakpoint.defaultDesc),
    }
    : {
      variant: "< @3xs",
      rem: "<16rem",
      px: containerWidth,
      label: t("breakpoints.@3xs.label", "Sub-Container Mini (Touch Enforced)"),
      icon: <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />,
      description: t(
        "breakpoints.@3xs.description",
        "Narrower than 256px: retains WCAG 44px touch target & truncation"
      ),
    };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormSuccessMessage("");
    formTimerRef.current = setTimeout(() => {
      setIsSubmitting(false);
      setFormSuccessMessage(
        `${t("scenarios.formDispatched", "Form payload dispatched securely!")} ("${formInput}")`
      );
    }, 1500);
  };

  const handlePaymentCheckout = () => {
    if (isPaying) return;
    setIsPaying(true);
    setPaymentStatus("");
    paymentTimerRef.current = setTimeout(() => {
      setIsPaying(false);
      setPaymentStatus(
        t(
          "scenarios.paymentVerified",
          "Payment verified & authenticated via 256-bit TLS gateway!"
        )
      );
    }, 1500);
  };

  return (
    <div
      id="main-content"
      tabIndex={-1}
      className="min-h-screen py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-10 outline-none"
    >
      {/* Live Region for Screen Readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {formSuccessMessage}
        {paymentStatus}
      </div>

      {/* Header Banner */}
      <header className="border border-border/80 bg-card rounded-2xl p-4 sm:p-8 shadow-sm backdrop-blur-md">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2">
              <AppBadge variant="default" icon={<Sparkles className="w-3 h-3" aria-hidden="true" />}>
                {t("banner.badge")}
              </AppBadge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t("banner.title")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("banner.description")}
            </p>
          </div>

          {/* Header Controls: Language Switcher & View Mode Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full xl:w-auto xl:justify-end">
            {/* Accessible Language Switcher */}
            <LanguageSwitcher />

            {/* View Mode Switcher with ARIA role & pressed status */}
            <nav
              aria-label={t("a11y.viewModeSelector", "View mode selector")}
              className="flex w-full sm:w-auto items-stretch p-1 bg-secondary rounded-xl border border-border text-[11px] sm:text-xs font-medium justify-between shrink-0"
              role="group"
            >
              <button
                type="button"
                onClick={() => setViewMode("interactive")}
                aria-pressed={viewMode === "interactive"}
                className={`flex-1 sm:flex-initial text-center px-1.5 sm:px-3 py-2 min-h-[44px] rounded-lg transition-all focus-visible:ring-3 focus-visible:ring-primary focus-visible:outline-none leading-snug sm:leading-normal flex items-center justify-center ${viewMode === "interactive"
                  ? "bg-card shadow-xs text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {t("viewModes.interactive")}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("all-breakpoints")}
                aria-pressed={viewMode === "all-breakpoints"}
                className={`flex-1 sm:flex-initial text-center px-1.5 sm:px-3 py-2 min-h-[44px] rounded-lg transition-all focus-visible:ring-3 focus-visible:ring-primary focus-visible:outline-none leading-snug sm:leading-normal flex items-center justify-center ${viewMode === "all-breakpoints"
                  ? "bg-card shadow-xs text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {t("viewModes.allBreakpoints")}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("matrix")}
                aria-pressed={viewMode === "matrix"}
                className={`flex-1 sm:flex-initial text-center px-1.5 sm:px-3 py-2 min-h-[44px] rounded-lg transition-all focus-visible:ring-3 focus-visible:ring-primary focus-visible:outline-none leading-snug sm:leading-normal flex items-center justify-center ${viewMode === "matrix"
                  ? "bg-card shadow-xs text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {t("viewModes.matrix")}
              </button>
            </nav>
          </div>
        </div>

        {/* 6-Theme Selector Bar */}
        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-border space-y-3">
          <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("theme.activeTheme")}
          </span>
          <div
            className="flex flex-wrap items-center gap-2 sm:gap-2.5"
            role="group"
            aria-label={t("a11y.themeSelector", "Theme selector")}
          >
            {THEME_OPTIONS.map((item) => {
              const isSelected = theme === item.id;
              const themeKey = THEME_KEYS[item.id] || "light";
              const localizedName = t(`theme.${themeKey}.name`, item.name);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id)}
                  aria-pressed={isSelected}
                  className={`group flex items-center justify-start gap-2 px-3 py-2.5 sm:py-2 min-h-[44px] rounded-xl text-xs font-medium border transition-all focus-visible:ring-3 focus-visible:ring-primary focus-visible:outline-none ${isSelected
                    ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/30 font-semibold shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/80"
                    }`}
                >
                  <span className="flex -space-x-1 shrink-0" aria-hidden="true">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-border shadow-xs"
                      style={{ backgroundColor: item.badgeColors[0] }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-border shadow-xs"
                      style={{ backgroundColor: item.badgeColors[1] }}
                    />
                  </span>
                  <span>{localizedName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* VIEW MODE 1: Interactive Resizer & Breakpoint Tester */}
      {viewMode === "interactive" && (
        <section aria-labelledby="simulator-heading" className="space-y-6 sm:space-y-8">
          {/* Draggable Width Control Panel */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-lg text-primary shrink-0" aria-hidden="true">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="simulator-heading" className="text-sm sm:text-base font-semibold">
                    {t("simulator.title")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("simulator.subtitle")}
                  </p>
                </div>
              </div>

              {/* Molecule: ContainerBreakpointBadge */}
              <div className="self-start sm:self-auto">
                <ContainerBreakpointBadge
                  variantLabel={activeBreakpoint.variant}
                  widthPx={containerWidth}
                  icon={activeBreakpoint.icon}
                />
              </div>
            </div>

            {/* Slider with full accessible properties */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                <span>256px (@3xs)</span>
                <span className="font-bold text-foreground" aria-live="polite">
                  {containerWidth}px
                </span>
                <span>1360px (&gt;@7xl)</span>
              </div>
              <input
                id="container-width-slider"
                type="range"
                min={256}
                max={1360}
                value={containerWidth}
                onChange={(e) => setContainerWidth(Number(e.target.value))}
                aria-label={t("a11y.widthSlider", "Container width slider")}
                aria-valuemin={256}
                aria-valuemax={1360}
                aria-valuenow={containerWidth}
                aria-valuetext={`${containerWidth} pixels, breakpoint ${activeBreakpoint.variant}`}
                className="w-full h-2.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            {/* Breakpoint Quick Selectors */}
            <div
              className="flex flex-wrap items-center gap-1.5 pt-2"
              role="group"
              aria-label={t("simulator.jumpTo")}
            >
              <span className="text-xs font-medium text-muted-foreground mr-1 w-full sm:w-auto">
                {t("simulator.jumpTo")}
              </span>
              {BREAKPOINT_TABLE.map((b) => (
                <button
                  key={b.variant}
                  type="button"
                  onClick={() => setContainerWidth(b.px)}
                  aria-pressed={containerWidth === b.px}
                  className={`px-3 py-2 min-h-[44px] text-xs rounded-md font-mono transition-all focus-visible:ring-3 focus-visible:ring-primary focus-visible:outline-none ${containerWidth === b.px
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-foreground px-1 gap-1">
              <span>{t("simulator.parentViewport")}</span>
              <span className="font-mono text-[11px] sm:text-xs">
                {t("simulator.styleLabel")}: {containerWidth}px | {t("simulator.currentLabel")}{" "}
                {activeBreakpoint.label}
              </span>
            </div>

            <div className="p-2 sm:p-6 bg-secondary/30 border-2 border-dashed border-border rounded-2xl flex justify-center overflow-x-auto">
              <div
                style={{ width: `${containerWidth}px`, maxWidth: "100%" }}
                className="@container transition-all duration-300 bg-card border border-border rounded-xl p-4 sm:p-6 shadow-md space-y-6"
              >
                {/* Container Internal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"
                      aria-hidden="true"
                    />
                    <span className="font-semibold text-foreground text-xs">
                      {t("simulator.parentContainer")} {containerWidth}px
                    </span>
                  </div>
                  <span className="text-muted-foreground font-mono text-[11px] sm:text-xs">
                    {t("simulator.breakpoint")} {activeBreakpoint.variant} ({activeBreakpoint.rem})
                  </span>
                </div>

                {/* Scenario 1: Action Variants using Molecule ButtonGroup */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t("scenarios.actionVariants")}
                  </span>
                  <ButtonGroup orientation="responsive">
                    <AppButton variant="primary">
                      {t("scenarios.primaryAction")}
                    </AppButton>
                    <AppButton
                      variant="payment"
                      onClick={handlePaymentCheckout}
                      isLoading={isPaying}
                    >
                      {t("scenarios.securePay")}
                    </AppButton>
                    <AppButton variant="secondary">
                      {t("scenarios.secondary")}
                    </AppButton>
                    <AppButton variant="outline">
                      {t("scenarios.outlineAction", "Outline Action")}
                    </AppButton>
                    <AppButton
                      variant="destructive"
                      leftIcon={<Trash2 className="w-4 h-4" aria-hidden="true" />}
                    >
                      {t("scenarios.destructive")}
                    </AppButton>
                  </ButtonGroup>
                </div>

                {/* Scenario 2: Stateless Molecule: PaymentActionCard */}
                <PaymentActionCard
                  title={t("scenarios.paymentMoleculeTitle", "High-Trust Payment Trigger")}
                  description={t(
                    "scenarios.paymentMoleculeDesc",
                    "Protected against double clicking and verified via encrypted TLS gateway."
                  )}
                  badgeLabel={t("scenarios.paymentBadge", "Encrypted TLS")}
                  buttonLabel={t("scenarios.payNow", "Pay Now")}
                  amountLabel="₹7,999"
                  isLoading={isPaying}
                  loadingText={t("scenarios.processing")}
                  statusMessage={paymentStatus}
                  onPay={handlePaymentCheckout}
                />

                {/* Scenario 3: Stateless Molecule: FormFieldAction */}
                <FormFieldAction
                  id="customer-payload"
                  label={t("scenarios.formFieldMolecule")}
                  inputValue={formInput}
                  inputPlaceholder={t("scenarios.formPlaceholder", "Enter workspace or seat label...")}
                  onInputChange={(e) => setFormInput(e.target.value)}
                  onSubmit={handleFormSubmit}
                  isLoading={isSubmitting}
                  loadingText={t("scenarios.formSubmitting")}
                  submitButtonText={t("scenarios.formSubmit")}
                  buttonIcon={<Send className="w-3.5 h-3.5" aria-hidden="true" />}
                  successMessage={formSuccessMessage}
                />

                {/* Scenario 4: Counter Atoms & Polymorphic Link */}
                <div className="flex flex-col @md:flex-row @md:items-center justify-between gap-3 pt-2 border-t border-border">
                  <ButtonGroup orientation="horizontal" spacing="sm">
                    <AppButton
                      variant="secondary"
                      onClick={() => setClickCount((c) => c + 1)}
                    >
                      {t("scenarios.clickCount")} {clickCount}
                    </AppButton>
                    <AppButton
                      variant="ghost"
                      onClick={() => setClickCount(0)}
                      leftIcon={<RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />}
                    >
                      {t("scenarios.reset")}
                    </AppButton>
                  </ButtonGroup>

                  <AppButton
                    asChild
                    variant="outline"
                    rightIcon={<ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />}
                  >
                    <a
                      href="https://tailwindcss.com/docs/container-queries"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("scenarios.tailwindDocs", "Tailwind Docs")}
                    </a>
                  </AppButton>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* VIEW MODE 2: All 13 Breakpoints Rendered Side-by-Side */}
      {viewMode === "all-breakpoints" && (
        <section aria-labelledby="grid-heading" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h2 id="grid-heading" className="text-base sm:text-lg font-bold">
              {t("grid.title")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("grid.subtitle")}
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {BREAKPOINT_TABLE.map((bp) => (
              <div
                key={bp.variant}
                className="p-4 sm:p-5 bg-card border border-border rounded-xl shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-md bg-secondary text-primary font-mono text-xs font-bold shrink-0">
                      {bp.variant}
                    </span>
                    <span className="text-xs font-bold">
                      {t(bp.labelKey, bp.defaultLabel)}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      ({bp.rem} / {bp.px}px)
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground italic">
                    {t(bp.descKey, bp.defaultDesc)}
                  </span>
                </div>

                <div className="overflow-x-auto p-2 sm:p-3 bg-secondary/30 rounded-lg">
                  <div
                    style={{ width: `${bp.px}px`, maxWidth: "100%" }}
                    className="@container bg-card p-3 sm:p-4 rounded-lg border border-border/80 shadow-xs space-y-3"
                  >
                    <ButtonGroup orientation="responsive" spacing="sm">
                      <AppButton variant="primary">
                        {t("scenarios.primaryAction")} ({bp.variant})
                      </AppButton>
                      <AppButton variant="payment">
                        {t("scenarios.securePay")}
                      </AppButton>
                      <AppButton variant="outline">
                        {t("scenarios.destructive")}
                      </AppButton>
                    </ButtonGroup>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* VIEW MODE 3: 6-Theme Comparative Matrix */}
      {viewMode === "matrix" && (
        <section aria-labelledby="matrix-heading" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h2 id="matrix-heading" className="text-base sm:text-lg font-bold">
              {t("matrix.title")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("matrix.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {THEME_OPTIONS.map((themeItem) => {
              const themeKey = THEME_KEYS[themeItem.id] || "light";
              return (
                <div
                  key={themeItem.id}
                  data-theme={themeItem.id}
                  className="bg-card text-foreground border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex -space-x-1 shrink-0" aria-hidden="true">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-border shadow-xs"
                          style={{ backgroundColor: themeItem.badgeColors[0] }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-border shadow-xs"
                          style={{ backgroundColor: themeItem.badgeColors[1] }}
                        />
                      </span>
                      <h3 className="text-sm font-bold truncate">
                        {t(`theme.${themeKey}.name`, themeItem.name)}
                      </h3>
                    </div>
                    <AppBadge variant="secondary" className="text-[10px] uppercase font-mono shrink-0">
                      {themeItem.id}
                    </AppBadge>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {t(`theme.${themeKey}.description`, themeItem.description)}
                  </p>

                  <div className="@container space-y-2.5 pt-2">
                    <AppButton variant="primary" className="w-full">
                      {t("scenarios.primaryAction")}
                    </AppButton>
                    <AppButton variant="payment" className="w-full">
                      {t("scenarios.securePay")}
                    </AppButton>
                    <div className="grid grid-cols-2 gap-2">
                      <AppButton variant="secondary">
                        {t("scenarios.secondary")}
                      </AppButton>
                      <AppButton variant="outline">
                        {t("scenarios.destructive")}
                      </AppButton>
                    </div>
                    <AppButton
                      variant="destructive"
                      className="w-full"
                      leftIcon={<Trash2 className="w-3.5 h-3.5" aria-hidden="true" />}
                    >
                      {t("scenarios.destructive")}
                    </AppButton>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
