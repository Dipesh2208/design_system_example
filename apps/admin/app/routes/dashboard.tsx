"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { defer, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit, Await } from "@remix-run/react";
import { useTranslation } from "react-i18next";

// Shared Atoms, Molecules & Organisms from @repo/ui
import { AppButton, AppBadge, AppSpinner } from "@repo/ui/atoms";
import { ButtonGroup } from "@repo/ui/molecules/ButtonGroup";
import { AppAdminLayout } from "@repo/ui/organisms/AppAdminLayout";
import { UserAvatarDropdownOrganism } from "@repo/ui/organisms/UserAvatarDropdownOrganism";

import { requireAdminUser, sessionCookie } from "../session.server";
import { AppSettingsManager } from "../components/AppSettingsManager";
import { ClientOnly } from "../components/ClientOnly";
import {
  Users,
  Activity,
  CheckCircle2,
  DollarSign,
  Sparkles,
  Send,
  Trash2,
} from "lucide-react";

// Lazy-loaded molecules (subpath imports for clean code splitting)
const PaymentActionCard = React.lazy(() =>
  import("@repo/ui/molecules/PaymentActionCard").then((m) => ({
    default: m.PaymentActionCard,
  })),
);
const FormFieldAction = React.lazy(() =>
  import("@repo/ui/molecules/FormFieldAction").then((m) => ({
    default: m.FormFieldAction,
  })),
);

interface AnalyticsData {
  totalUsers: string;
  userGrowth: string;
  activeSessions: string;
  uptime: string;
  monthlyRevenue: string;
  revenueVsTarget: string;
  systemHealth: string;
  healthNote: string;
}

// Asynchronous metrics data streaming via Remix defer() without artificial delays
function getDeferredAnalytics(): Promise<AnalyticsData> {
  return Promise.resolve({
    totalUsers: "12,482",
    userGrowth: "+14.2% this month",
    activeSessions: "1,894",
    uptime: "99.98% uptime",
    monthlyRevenue: "$84,230",
    revenueVsTarget: "+8.4% vs target",
    systemHealth: "100%",
    healthNote: "Zero critical incidents",
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAdminUser(request);
  // Remix streaming with defer
  return defer({
    user,
    analyticsPromise: getDeferredAnalytics(),
  });
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

  return defer({});
}

export default function DashboardPage() {
  const { user, analyticsPromise } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const submit = useSubmit();

  // Settings modal visibility (opened via Avatar -> Settings)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  const handleLogout = () => {
    const formData = new FormData();
    formData.append("intent", "logout");
    submit(formData, { method: "post" });
  };

  const handleTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantInput.trim() || isProvisioning) return;

    setIsProvisioning(true);
    setProvisionSuccess("");

    if (formTimerRef.current) clearTimeout(formTimerRef.current);
    formTimerRef.current = setTimeout(() => {
      setIsProvisioning(false);
      setProvisionSuccess(
        `${t("dashboard.formDispatched", "Tenant workspace provisioned successfully!")} [${tenantInput}]`,
      );
      setTenantInput("");
    }, 1200);
  };

  const handlePaymentCheckout = () => {
    if (isPaying) return;
    setIsPaying(true);
    setPaymentSuccess("");

    if (paymentTimerRef.current) clearTimeout(paymentTimerRef.current);
    paymentTimerRef.current = setTimeout(() => {
      setIsPaying(false);
      setPaymentSuccess(
        "Payment Processed! Enterprise workspace order received and webhook verified.",
      );
    }, 1500);
  };

  return (
    <AppAdminLayout
      currentPath="/dashboard"
      user={user}
      headerRightContent={
        <div className="flex items-center gap-2 sm:gap-3">
          <UserAvatarDropdownOrganism
            user={user}
            onSettingsClick={() => setIsSettingsOpen(true)}
            onLogoutClick={handleLogout}
          />
        </div>
      }
    >
      {/* Centralized Settings Dialog (Theme & Language Pickers inside) */}
      <AppSettingsManager
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Screen Reader Live Announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {provisionSuccess}
        {paymentSuccess}
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Welcome Banner */}
        <section className="bg-gradient-to-r from-primary/90 via-primary to-indigo-950 rounded-2xl p-5 sm:p-8 text-primary-foreground shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                  {user.role}
                </span>
                <span className="text-xs text-white/70 font-mono">
                  {user.email}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {t("dashboard.welcome")}, {user.name}
              </h1>
              <p className="text-white/80 text-xs sm:text-sm max-w-xl">
                {t(
                  "dashboard.role",
                  "Manage your multi-tenant workspaces, configure payment gateways, and test responsive UI molecules.",
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AppBadge
                variant="outline"
                className="bg-white/10 text-white border-white/20 backdrop-blur-xs px-3 py-1"
              >
                {t("dashboard.systemOnline", "Live Production")}
              </AppBadge>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        </section>

        {/* 4 Analytics KPI Cards streamed via Remix Suspense + <Await> */}
        <section aria-labelledby="analytics-heading">
          <h2 id="analytics-heading" className="sr-only">
            {t("dashboard.overview")}
          </h2>
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 min-h-[7rem]">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs min-h-[7rem] flex items-center justify-center animate-pulse"
                  >
                    <AppSpinner size="md" className="text-primary" />
                  </div>
                ))}
              </div>
            }
          >
            <Await resolve={analyticsPromise}>
              {(analytics) => (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 min-h-[7rem]">
                  <div className="bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs min-h-[7rem] flex items-center gap-4 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium truncate">
                        {t("dashboard.stats.totalUsers")}
                      </p>
                      <h3 className="text-2xl font-bold tracking-tight">
                        {analytics.totalUsers}
                      </h3>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        {analytics.userGrowth}
                      </span>
                    </div>
                  </div>

                  <div className="bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs flex items-center gap-4 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium truncate">
                        {t("dashboard.stats.activeSessions")}
                      </p>
                      <h3 className="text-2xl font-bold tracking-tight">
                        {analytics.activeSessions}
                      </h3>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        {analytics.uptime}
                      </span>
                    </div>
                  </div>

                  <div className="bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs flex items-center gap-4 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium truncate">
                        {t("dashboard.stats.monthlyRevenue")}
                      </p>
                      <h3 className="text-2xl font-bold tracking-tight">
                        {analytics.monthlyRevenue}
                      </h3>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        {analytics.revenueVsTarget}
                      </span>
                    </div>
                  </div>

                  <div className="bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs flex items-center gap-4 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium truncate">
                        {t("dashboard.stats.systemHealth")}
                      </p>
                      <h3 className="text-2xl font-bold tracking-tight">
                        {analytics.systemHealth}
                      </h3>
                      <span className="text-xs text-muted-foreground font-medium">
                        {analytics.healthNote}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Await>
          </Suspense>
        </section>

        {/* Interactive Shared UI Organisms & Molecules Section with ClientOnly Lazy Loading */}
        <section
          aria-labelledby="shared-components-heading"
          className="space-y-6 pt-4 border-t border-border"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2
                id="shared-components-heading"
                className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2"
              >
                <span>{t("dashboard.sharedComponents")}</span>
                <AppBadge variant="secondary" className="text-[10px]">
                  Atomic Design
                </AppBadge>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Molecules and Atoms tested with dynamic responsiveness and
                accessibility.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* 1. PaymentActionCard Molecule */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  PaymentActionCard Molecule
                </span>
                <span className="text-xs text-muted-foreground">
                  (Checkout &amp; Gateway)
                </span>
              </div>

              <ClientOnly
                fallback={
                  <div className="p-8 rounded-2xl bg-muted/40 animate-pulse border border-border h-48 flex items-center justify-center">
                    <AppSpinner size="md" />
                  </div>
                }
              >
                {() => (
                  <Suspense
                    fallback={
                      <div className="p-8 rounded-2xl bg-muted/40 animate-pulse border border-border h-48 flex items-center justify-center">
                        <AppSpinner size="md" />
                      </div>
                    }
                  >
                    <PaymentActionCard
                      title="Enterprise Multi-Seat Cluster"
                      description="Dedicated Kubernetes cluster with automatic tenant isolation, custom domains, and SOC2 compliant telemetry."
                      amountLabel="$2,499 /month"
                      badgeLabel="Enterprise Tier"
                      onPay={handlePaymentCheckout}
                      isLoading={isPaying}
                      buttonLabel="Deploy Enterprise Workspace"
                      loadingText="Securing Gateway..."
                    />
                  </Suspense>
                )}
              </ClientOnly>

              {paymentSuccess && (
                <div
                  role="status"
                  className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2 transition-all animate-fadeIn"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{paymentSuccess}</span>
                </div>
              )}
            </div>

            {/* 2. FormFieldAction Molecule & Quick Actions */}
            <div className="space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  {t("dashboard.formFieldAction")}
                </span>

                <ClientOnly
                  fallback={
                    <div className="p-6 rounded-2xl bg-muted/40 animate-pulse border border-border h-32 flex items-center justify-center">
                      <AppSpinner size="md" />
                    </div>
                  }
                >
                  {() => (
                    <Suspense
                      fallback={
                        <div className="p-6 rounded-2xl bg-muted/40 animate-pulse border border-border h-32 flex items-center justify-center">
                          <AppSpinner size="md" />
                        </div>
                      }
                    >
                      <FormFieldAction
                        label={t("dashboard.formFieldLabel")}
                        inputPlaceholder={t("dashboard.formFieldPlaceholder")}
                        inputValue={tenantInput}
                        onInputChange={(
                          e: React.ChangeEvent<HTMLInputElement>,
                        ) => setTenantInput(e.target.value)}
                        onSubmit={handleTenantSubmit}
                        isLoading={isProvisioning}
                        submitButtonText={t("dashboard.formSubmit")}
                        loadingText={t("dashboard.formSubmitting")}
                        helperText="Creates an isolated tenant domain within your active subscription."
                      />
                    </Suspense>
                  )}
                </ClientOnly>

                {provisionSuccess && (
                  <div
                    role="status"
                    className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2 transition-all animate-fadeIn"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{provisionSuccess}</span>
                  </div>
                )}
              </div>

              {/* Quick Actions (ButtonGroup Molecule) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t("dashboard.quickActions")}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    Actions: {actionCount}
                  </span>
                </div>

                <ButtonGroup orientation="horizontal" spacing="sm">
                  <AppButton
                    variant="primary"
                    size="sm"
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                    onClick={() => setActionCount((c) => c + 1)}
                  >
                    {t("dashboard.exportReport")}
                  </AppButton>
                  <AppButton
                    variant="outline"
                    size="sm"
                    onClick={() => setActionCount((c) => c + 1)}
                  >
                    Sync Tenants
                  </AppButton>
                  <AppButton
                    variant="destructive"
                    size="sm"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Purge Cache
                  </AppButton>
                </ButtonGroup>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppAdminLayout>
  );
}
