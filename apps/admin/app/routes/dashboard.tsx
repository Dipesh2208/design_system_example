"use client";

import React, { useState, useRef, useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";

// Shared Atoms, Molecules & Organisms from @repo/ui
import { AppButton, AppBadge, AppSpinner } from "@repo/ui/atoms";
import {
  PaymentActionCard,
  ButtonGroup,
  FormFieldAction,
  ContainerBreakpointBadge,
} from "@repo/ui/molecules";
import { ThemeDropdownOrganism } from "@repo/ui/organisms";

import { requireAdminUser, sessionCookie } from "../session.server";
import { LanguageSelector } from "../components/LanguageSelector";
import { useTheme, THEME_OPTIONS } from "../components/ThemeProvider";
import { ThemeSelector } from "../components/ThemeSelector";
import {
  Users,
  Activity,
  CheckCircle2,
  DollarSign,
  LogOut,
  Layers,
  Sparkles,
  Smartphone,
  Send,
  Trash2,
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAdminUser(request);
  return json({ user });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "logout") {
    return redirect("/auth", {
      headers: {
        "Set-Cookie": await sessionCookie.serialize("", { maxAge: 0 }),
      },
    });
  }

  return json({});
}

export default function DashboardPage() {
  const { user } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  // Interactive Form State (for FormFieldAction molecule)
  const [tenantInput, setTenantInput] = useState("");
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionSuccess, setProvisionSuccess] = useState("");

  // Interactive Payment State (for PaymentActionCard molecule)
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState("");

  // Interactive Counter State
  const [actionCount, setActionCount] = useState(0);

  const formTimerRef = useRef<NodeJS.Timeout | null>(null);
  const paymentTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (formTimerRef.current) clearTimeout(formTimerRef.current);
      if (paymentTimerRef.current) clearTimeout(paymentTimerRef.current);
    };
  }, []);

  const handleTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProvisioning || !tenantInput.trim()) return;
    setIsProvisioning(true);
    setProvisionSuccess("");

    formTimerRef.current = setTimeout(() => {
      setIsProvisioning(false);
      setProvisionSuccess(
        `${t("dashboard.formDispatched", "Tenant provisioned successfully!")} ("${tenantInput}")`
      );
      setTenantInput("");
    }, 1200);
  };

  const handlePaymentCheckout = () => {
    if (isPaying) return;
    setIsPaying(true);
    setPaymentSuccess("");

    paymentTimerRef.current = setTimeout(() => {
      setIsPaying(false);
      setPaymentSuccess("Enterprise Plan activated via TLS Gateway!");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      {/* Screen Reader Live Announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {provisionSuccess}
        {paymentSuccess}
      </div>

      {/* Sticky Solid Navigation Header (No translucent bleed-through) */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-16 py-2.5 sm:py-0 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
          {/* Logo & User identity */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-base sm:text-lg shadow-sm shrink-0">
              A
            </div>
            <div className="min-w-0">
              <span className="font-bold tracking-tight block text-sm sm:text-base truncate">
                {t("dashboard.title")}
              </span>
              <span className="text-xs text-muted-foreground font-medium hidden xs:block truncate">
                {user.email}
              </span>
            </div>
          </div>

          {/* Action controls: Language, Solid ThemeDropdownOrganism, Profile & Sign Out */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <LanguageSelector />

            {/* Shared ThemeDropdownOrganism from @repo/ui/organisms */}
            <ThemeDropdownOrganism
              currentTheme={theme}
              onThemeSelect={(tId) => setTheme(tId as any)}
              themes={THEME_OPTIONS}
            />

            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/30 shrink-0"
              />
              <Form method="post">
                <input type="hidden" name="intent" value="logout" />
                <AppButton
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center gap-1.5 px-2 sm:px-3 min-h-[44px]"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span className="hidden md:inline">{t("dashboard.logout")}</span>
                </AppButton>
              </Form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        id="main-content"
        className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 w-full flex-1 space-y-6 sm:space-y-8"
      >
        {/* Welcome Banner */}
        <section className="bg-gradient-to-r from-primary/90 via-primary to-indigo-950 rounded-2xl p-5 sm:p-8 text-primary-foreground shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <AppBadge variant="default" className="bg-white/20 text-white border border-white/25">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  {t("dashboard.role")}
                </AppBadge>
                <span className="text-xs text-indigo-100/90">● {t("dashboard.systemOnline")}</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
                {t("dashboard.welcome")}, {user.name}!
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100/90 max-w-xl">
                Google account verified ({user.email}). Welcome to the centralized enterprise portal.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <AppButton
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs sm:text-sm w-full sm:w-auto min-h-[44px]"
                onClick={() => setActionCount((c) => c + 1)}
              >
                {t("dashboard.exportReport")} ({actionCount})
              </AppButton>
            </div>
          </div>
        </section>

        {/* 6-Theme Palette Switcher Bar */}
        <section className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-xs">
          <ThemeSelector />
        </section>

        {/* Stats Grid - Mobile 1-col, Tablet 2-col, Desktop 4-col */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-card p-4 sm:p-5 rounded-xl shadow-xs border border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.stats.totalUsers")}
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-card-foreground">28,490</span>
              <div className="p-2 sm:p-2.5 bg-blue-500/15 text-blue-500 dark:text-blue-400 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-emerald-500 font-semibold mt-2 flex items-center gap-1">
              ↑ 12.5% from last month
            </p>
          </div>

          <div className="bg-card p-4 sm:p-5 rounded-xl shadow-xs border border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.stats.activeSessions")}
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-card-foreground">1,420</span>
              <div className="p-2 sm:p-2.5 bg-purple-500/15 text-purple-500 dark:text-purple-400 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-emerald-500 font-semibold mt-2 flex items-center gap-1">
              ↑ 8.1% live sessions
            </p>
          </div>

          <div className="bg-card p-4 sm:p-5 rounded-xl shadow-xs border border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.stats.systemHealth")}
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-500 dark:text-emerald-400">99.98%</span>
              <div className="p-2 sm:p-2.5 bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-2">
              0 incidents reported
            </p>
          </div>

          <div className="bg-card p-4 sm:p-5 rounded-xl shadow-xs border border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.stats.monthlyRevenue")}
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-card-foreground">$148,200</span>
              <div className="p-2 sm:p-2.5 bg-amber-500/15 text-amber-500 dark:text-amber-400 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-emerald-500 font-semibold mt-2 flex items-center gap-1">
              ↑ 24.3% YoY growth
            </p>
          </div>
        </section>

        {/* CONTAINER QUERY CONTEXT SECTION (@container) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-bold">
                {t("dashboard.containerQuerySection")}
              </h2>
            </div>
            <ContainerBreakpointBadge
              variantLabel="@container (Fluid)"
              widthPx={100}
              icon={<Smartphone className="w-3.5 h-3.5" />}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            {t("dashboard.containerQueryDesc")}
          </p>

          {/* Molecule 1: FormFieldAction Molecule */}
          <div className="@container">
            <FormFieldAction
              id="tenant-provision-input"
              label={t("dashboard.formFieldLabel")}
              inputValue={tenantInput}
              onInputChange={(e) => setTenantInput(e.target.value)}
              onSubmit={handleTenantSubmit}
              inputPlaceholder={t("dashboard.formFieldPlaceholder")}
              submitButtonText={t("dashboard.formSubmit")}
              loadingText={t("dashboard.formSubmitting")}
              isLoading={isProvisioning}
              successMessage={provisionSuccess}
              buttonIcon={<Send className="w-4 h-4 ml-1" />}
              className="bg-card border-border shadow-xs"
            />
          </div>

          {/* Two-Column Grid for ButtonGroup and Payment Molecules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Molecule 2: PaymentActionCard Molecule */}
            <div className="@container">
              <PaymentActionCard
                title="Enterprise Plan License"
                description="Protected against double clicking and verified via encrypted TLS gateway."
                amountLabel="$4,999 / year"
                badgeLabel="Encrypted TLS"
                isLoading={isPaying}
                loadingText="Authorizing..."
                statusMessage={paymentSuccess}
                onPay={handlePaymentCheckout}
                className="bg-card border-border shadow-xs h-full flex flex-col justify-between"
              />
            </div>

            {/* Molecule 3: ButtonGroup Molecule with atomic button variations */}
            <div className="@container bg-card p-4 sm:p-5 rounded-xl border border-border shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-sm font-semibold block">
                  {t("dashboard.quickActions")}
                </span>
                <p className="text-xs text-muted-foreground">
                  Responsive ButtonGroup molecule wrapping atomic AppButtons:
                </p>

                <ButtonGroup orientation="responsive" spacing="sm">
                  <AppButton variant="primary" size="sm">
                    Primary
                  </AppButton>
                  <AppButton variant="secondary" size="sm">
                    Secondary
                  </AppButton>
                  <AppButton variant="payment" size="sm">
                    Payment Action
                  </AppButton>
                  <AppButton
                    variant="destructive"
                    size="sm"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Destructive
                  </AppButton>
                </ButtonGroup>

                <div className="pt-3 border-t border-border flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-xs text-muted-foreground font-medium">Spinner &amp; Badges:</span>
                  <AppSpinner size="sm" />
                  <AppBadge variant="secondary">Active</AppBadge>
                  <AppBadge variant="warning">Warning Notice</AppBadge>
                  <AppBadge variant="success">All Systems Operational</AppBadge>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <ButtonGroup orientation="horizontal" spacing="sm">
                  <AppButton variant="outline" size="sm" className="w-full min-h-[44px]">
                    {t("dashboard.manageRoles")}
                  </AppButton>
                  <AppButton variant="outline" size="sm" className="w-full min-h-[44px]">
                    {t("dashboard.auditLogs")}
                  </AppButton>
                </ButtonGroup>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
