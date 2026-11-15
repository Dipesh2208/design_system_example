"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Users,
  Search,
  Plus,
  ExternalLink,
  Receipt,
  Download,
  ArrowLeft,
  Calendar,
  Phone,
  LayoutGrid,
  Table as TableIcon,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Star,
  Mail,
  Building,
  Minimize2,
  CheckCircle,
  Clock,
  Ban,
  FileSpreadsheet,
  Edit3,
} from "lucide-react";

import {
  AppAdminLayout,
  AppVirtualTable,
  type ColumnDef,
  CustomerProfileSidebar,
  CustomerProfileTab,
  UserAvatarDropdownOrganism,
  AddCustomerDrawer,
  type NewCustomerFormData,
} from "@repo/ui/organisms";

import { requireAdminUser, sessionCookie } from "../session.server";
import { AppSettingsManager } from "../components/AppSettingsManager";
import { useAppStore } from "@repo/ui/stores";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "active" | "pending" | "inactive";
  spent: number;
  lastActive: string;
  avatarBg: string;
  rating?: number;
  isFavorite?: boolean;
}

export interface InvoiceItem {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  description: string;
}

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-purple-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-indigo-600",
  "bg-cyan-600",
];

const FIRST_NAMES = [
  "Amit",
  "Priya",
  "Rahul",
  "Ananya",
  "David",
  "Sarah",
  "Sneha",
  "Karan",
  "Elena",
  "Marcus",
  "Tanvi",
  "Dev",
];
const LAST_NAMES = [
  "Patel",
  "Sharma",
  "Shah",
  "Mehta",
  "Smith",
  "Johnson",
  "Verma",
  "Desai",
  "Miller",
  "Taylor",
  "Kapoor",
  "Joshi",
];
const COMPANIES = [
  "Apex Global",
  "Zenith Tech",
  "Nova Horizon",
  "Nexus Infotech",
  "Starlight Media",
  "CloudSphere",
  "Prism Logic",
  "Acme Labs",
];

function generateMockCustomers(count = 1000): Customer[] {
  const list: Customer[] = [];
  for (let i = 1; i <= count; i++) {
    const fn = FIRST_NAMES[i % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const company = COMPANIES[i % COMPANIES.length];
    const statusRoll = i % 10;
    const status: Customer["status"] =
      statusRoll < 7 ? "active" : statusRoll < 9 ? "pending" : "inactive";
    const spent = 250 + ((i * 137) % 18500);
    const phoneSuffix = String(1000 + ((i * 37) % 9000));
    const phonePrefix = String(100 + (i % 900));

    list.push({
      id: `CUST-${1000 + i}`,
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
      phone: `+91 98${phonePrefix.slice(0, 2)} ${phonePrefix.slice(2)}${phoneSuffix.slice(0, 3)} ${phoneSuffix.slice(3)}`,
      company: `${company} #${(i % 15) + 1}`,
      status,
      spent,
      lastActive: `${(i % 28) + 1} hours ago`,
      avatarBg: AVATAR_COLORS[i % AVATAR_COLORS.length] || "bg-indigo-600",
      rating: i % 5 || 5,
      isFavorite: i % 4 === 0,
    });
  }
  return list;
}

function generateMockInvoices(customerId: string): InvoiceItem[] {
  return [
    {
      id: `INV-2026-001`,
      date: "Nov 02, 2026",
      amount: 1450.0,
      status: "paid",
      description: "Annual Enterprise License & Support",
    },
    {
      id: `INV-2026-002`,
      date: "Oct 15, 2026",
      amount: 890.0,
      status: "paid",
      description: "Cloud Compute Add-on (5,000 hrs)",
    },
    {
      id: `INV-2026-003`,
      date: "Sep 28, 2026",
      amount: 2150.0,
      status: "paid",
      description: "Dedicated Multi-Region Gateway",
    },
    {
      id: `INV-2026-004`,
      date: "Aug 14, 2026",
      amount: 520.0,
      status: "pending",
      description: "API Rate-limit Extension tier 2",
    },
  ];
}

const STATIC_CUSTOMERS = generateMockCustomers(1200);

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

export default function CustomersPage() {
  const { user } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const submit = useSubmit();

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Add Customer Drawer State
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customCustomers, setCustomCustomers] = useState<Customer[]>([]);

  // View Mode: Table vs. Card View
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // Infinite Scroll Pagination State
  const BATCH_SIZE = 50;
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Full-width expand/collapse layout state from central store
  const isContentFullWidth = useAppStore((state) => state.isContentFullWidth);
  const toggleContentFullWidth = useAppStore(
    (state) => state.toggleContentFullWidth,
  );
  const isBrowserFullHeight = useAppStore((state) => state.isBrowserFullHeight);
  const toggleBrowserFullHeight = useAppStore(
    (state) => state.toggleBrowserFullHeight,
  );

  // Reset pagination when search query changes
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [searchQuery]);

  // Accordion Expand/Collapse State (for Table Rows & Cards)
  const [expandedCustomerIds, setExpandedCustomerIds] = useState<Set<string>>(
    new Set(),
  );

  const toggleAccordion = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedCustomerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Selected Customer & Sidebar State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [activeSidebarTab, setActiveSidebarTab] =
    useState<CustomerProfileTab>("details");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [customerFavorites, setCustomerFavorites] = useState<
    Record<string, boolean>
  >({});
  const [customerRatings, setCustomerRatings] = useState<
    Record<string, number>
  >({});

  // Dynamic Column Count Tracking for Responsive Card Grid
  const [columns, setColumns] = useState(3);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setColumns(1);
      } else if (width < 1024) {
        setColumns(2);
      } else if (isContentFullWidth) {
        if (width < 1440) {
          setColumns(3);
        } else if (width < 1800) {
          setColumns(4);
        } else {
          setColumns(5);
        }
      } else {
        setColumns(3);
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, [isContentFullWidth]);

  // Active customer object
  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    const base = STATIC_CUSTOMERS.find((c) => c.id === selectedCustomerId);
    if (!base) return null;
    return {
      ...base,
      isFavorite: customerFavorites[base.id] ?? base.isFavorite ?? false,
      rating: customerRatings[base.id] ?? base.rating ?? 4,
    };
  }, [selectedCustomerId, customerFavorites, customerRatings]);

  // Filtered Customers
  const filteredData = useMemo(() => {
    let result = STATIC_CUSTOMERS;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q),
      );
    }

    return result;
  }, [searchQuery]);

  // Infinite Scroll Slice: Display up to `visibleCount` items
  const paginatedData = useMemo(() => {
    return filteredData.slice(0, visibleCount);
  }, [filteredData, visibleCount]);

  const hasMore = visibleCount < filteredData.length;

  const handleLoadMore = React.useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) =>
        Math.min(prev + BATCH_SIZE, filteredData.length),
      );
      setIsLoadingMore(false);
    }, 200);
  }, [hasMore, isLoadingMore, filteredData.length]);

  // Virtualizer row count based on paginated items
  const rowCount = Math.ceil(paginatedData.length / columns);

  // eslint-disable-next-line react-hooks/incompatible-library
  const cardVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (columns === 1 ? 210 : 225),
    overscan: 4,
  });

  // Card view infinite scrolling trigger
  const cardVirtualItems = cardVirtualizer.getVirtualItems();
  useEffect(() => {
    if (viewMode !== "card" || !hasMore || isLoadingMore || rowCount === 0)
      return;
    const lastItem = cardVirtualItems[cardVirtualItems.length - 1];
    if (lastItem && lastItem.index >= rowCount - 2) {
      handleLoadMore();
    }
  }, [
    cardVirtualItems,
    viewMode,
    hasMore,
    isLoadingMore,
    rowCount,
    handleLoadMore,
  ]);

  const handleOpenEdit = (customer: Customer, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingCustomer(customer);
    setIsAddCustomerOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setIsAddCustomerOpen(true);
  };

  const handleSaveCustomer = (formData: NewCustomerFormData) => {
    if (editingCustomer) {
      // Update existing customer
      const updatedCustomer: Customer = {
        ...editingCustomer,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        email: `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@example.com`,
      };
      setCustomCustomers((prev) => {
        const exists = prev.some((c) => c.id === editingCustomer.id);
        if (exists) {
          return prev.map((c) => (c.id === editingCustomer.id ? updatedCustomer : c));
        }
        return [updatedCustomer, ...prev];
      });
      setEditingCustomer(null);
    } else {
      // Create new customer
      const newId = 'cust-' + Date.now();
      const colors = [
        "bg-blue-600",
        "bg-emerald-600",
        "bg-purple-600",
        "bg-amber-600",
        "bg-rose-600",
        "bg-indigo-600",
        "bg-cyan-600",
      ];
      const newCustomer: Customer = {
        id: newId,
        name: formData.firstName + " " + formData.lastName,
        email: formData.firstName.toLowerCase() + "." + formData.lastName.toLowerCase() + "@example.com",
        phone: formData.phone,
        company: "Direct Customer",
        status: "active",
        spent: 0,
        lastActive: "Just now",
        avatarBg: colors[Math.floor(Math.random() * colors.length)],
        rating: 5,
        isFavorite: false,
      };
      setCustomCustomers((prev) => [newCustomer, ...prev]);
      setSelectedCustomerId(newId);
      setIsMobileSidebarOpen(true);
    }
  };

  const selectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setActiveSidebarTab("details");
    setIsMobileSidebarOpen(true);
  };

  // Strictly 2 Columns for Virtual Table with Accordion Trigger
  const tableColumns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        key: "name",
        header: t("customers.colName", "Customer Name & Profile"),
        width: "60%",
        sortable: true,
        render: (c: Customer) => {
          const isExpanded = expandedCustomerIds.has(c.id);
          return (
            <div className="flex items-center gap-3 py-1.5 min-w-0">
              {/* Accordion Chevron Button */}
              <button
                type="button"
                onClick={(e) => toggleAccordion(c.id, e)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
                title={isExpanded ? "Collapse Details" : "Expand Details"}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-primary" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              <div
                className={`w-10 h-10 rounded-2xl ${c.avatarBg} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
              >
                {c.name.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors truncate">
                  {c.name}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground truncate">
                  {c.id}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: "phone",
        header: t("customers.colPhone", "Mobile Number"),
        width: "40%",
        sortable: true,
        render: (c: Customer) => {
          return (
            <div className="flex items-center justify-between gap-2.5 py-1.5 text-sm pr-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-foreground transition-all group-hover:border-primary/40 group-hover:bg-primary/15 shadow-xs">
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="font-mono font-semibold text-xs sm:text-sm tracking-wider">
                  {c.phone}
                </span>
              </div>

              {/* Edit Icon moved to far right where Details was */}
              <button
                type="button"
                onClick={(e) => handleOpenEdit(c, e)}
                className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-muted/80 transition-colors border border-transparent hover:border-border"
                title={t("customers.editCustomer", "Edit Customer")}
                aria-label={t("customers.editCustomer", "Edit Customer")}
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [t, expandedCustomerIds],
  );

  const handleLogout = () => {
    const formData = new FormData();
    formData.append("intent", "logout");
    submit(formData, { method: "post" });
  };

  // Status Badges for Profile Detail View
  const renderStatusBadge = (status: Customer["status"]) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="w-3 h-3" />
            {t("customers.filterActive", "Active")}
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            {t("customers.filterPending", "Pending")}
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
            <Ban className="w-3 h-3" />
            {t("customers.filterInactive", "Inactive")}
          </span>
        );
    }
  };

  // Single Customer Card Component with Inline Accordion Details Expansion
  const renderCustomerCard = (c: Customer) => {
    const isExpanded = expandedCustomerIds.has(c.id);

    return (
      <div
        key={c.id}
        className="p-5 rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xs shadow-xs flex flex-col justify-between gap-4 transition-all duration-200 hover:border-primary/50 hover:shadow-lg text-left group"
      >
        {/* Top Header: Avatar + Customer Name & ID */}
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div
            onClick={() => selectCustomer(c.id)}
            className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
          >
            <div
              className={`w-12 h-12 rounded-2xl ${c.avatarBg} text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
            >
              {c.name.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-foreground truncate text-sm sm:text-base group-hover:text-primary transition-colors tracking-tight">
                {c.name}
              </span>
              <span className="font-mono text-xs text-muted-foreground/80 truncate">
                {c.id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => handleOpenEdit(c, e)}
              className="p-2 rounded-xl border border-border bg-muted/40 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
              title={t("customers.editCustomer", "Edit Customer")}
              aria-label={t("customers.editCustomer", "Edit Customer")}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            {/* Accordion Expand/Collapse Trigger */}
            <button
              type="button"
              onClick={(e) => toggleAccordion(c.id, e)}
              className={`p-2 rounded-xl border transition-all ${
                isExpanded
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              title={isExpanded ? "Collapse Card" : "Expand Card Accordion"}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Middle: Phone Number with Pill */}
        <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center gap-2.5 text-xs group-hover:border-primary/30 transition-colors">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Phone className="w-3.5 h-3.5" />
          </div>
          <span className="font-mono font-semibold text-foreground tracking-wide truncate">
            {c.phone}
          </span>
        </div>

        {/* Accordion Drawer inside Card */}
        {isExpanded && (
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-2.5 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Status:</span>
              <div>{renderStatusBadge(c.status)}</div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Company:</span>
              <span className="font-semibold text-foreground truncate">
                {c.company}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Total Spent:</span>
              <span className="font-bold text-foreground font-mono">
                ${c.spent.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-mono text-foreground truncate text-[11px]">
                {c.email}
              </span>
            </div>
          </div>
        )}

        {/* Footer: View Profile Button */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
          <button
            type="button"
            onClick={(e) => toggleAccordion(c.id, e)}
            className="text-muted-foreground hover:text-foreground text-[11px] font-medium"
          >
            {isExpanded ? "Collapse Accordion" : "Expand Details"}
          </button>

          <button
            type="button"
            onClick={() => selectCustomer(c.id)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform"
          >
            <span>Full Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <AppAdminLayout
      currentPath="/customers"
      user={user}
      contentScrollable={false}
      isFullWidth={isContentFullWidth}
      isHeaderHidden={isBrowserFullHeight}
      isSidebarHidden={isBrowserFullHeight}
      headerRightContent={
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ultra-Clean Header: User Avatar Profile Dropdown with Settings & Sign Out */}
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

      {/* View Switch: Directory List vs. Customer Profile View */}
      {selectedCustomer ? (
        <div className="flex flex-col lg:flex-row items-start gap-6 w-full h-full overflow-y-auto">
          {/* Customer Profile Sidebar (Theme-Aligned: Details & Invoice) */}
          <CustomerProfileSidebar
            customer={selectedCustomer}
            activeTab={activeSidebarTab}
            onTabChange={setActiveSidebarTab}
            onBack={() => {
              setSelectedCustomerId(null);
              setIsMobileSidebarOpen(false);
            }}
            onToggleFavorite={(fav) => {
              setCustomerFavorites((prev) => ({
                ...prev,
                [selectedCustomer.id]: fav,
              }));
            }}
            onRatingChange={(stars) => {
              setCustomerRatings((prev) => ({
                ...prev,
                [selectedCustomer.id]: stars,
              }));
            }}
            isMobileOpen={isMobileSidebarOpen}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
            onEdit={() => handleOpenEdit(selectedCustomer)}
          />

          {/* Customer Profile Main Content Area */}
          <div className="flex-1 w-full space-y-6">
            {/* Top Bar with Mobile Drawer trigger */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomerId(null);
                    setIsMobileSidebarOpen(false);
                  }}
                  className="p-2 rounded-xl border border-border bg-muted/60 text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Back to Directory"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {selectedCustomer.name}
                  </h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span>{selectedCustomer.company}</span>
                    <span>•</span>
                    <span className="font-mono">{selectedCustomer.id}</span>
                  </p>
                </div>
              </div>

              {/* Mobile trigger to open sidebar */}
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold min-h-[44px] flex items-center justify-center shadow-xs"
              >
                Profile Menu
              </button>
            </div>

            {/* TAB CONTENT: DETAILS */}
            {activeSidebarTab === "details" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
                    <span className="text-xs text-muted-foreground block">
                      Account Status
                    </span>
                    <div className="mt-1">
                      {renderStatusBadge(selectedCustomer.status)}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
                    <span className="text-xs text-muted-foreground block">
                      Total Lifetime Spent
                    </span>
                    <p className="text-xl font-bold text-foreground mt-0.5">
                      ${selectedCustomer.spent.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
                    <span className="text-xs text-muted-foreground block">
                      Last Active
                    </span>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {selectedCustomer.lastActive}
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    Customer Details &amp; Specifications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                      <span className="text-xs text-muted-foreground block">
                        Full Name
                      </span>
                      <span className="font-semibold text-foreground">
                        {selectedCustomer.name}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                      <span className="text-xs text-muted-foreground block">
                        Email Address
                      </span>
                      <span className="font-semibold text-foreground">
                        {selectedCustomer.email}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                      <span className="text-xs text-muted-foreground block">
                        Company / Tenant
                      </span>
                      <span className="font-semibold text-foreground">
                        {selectedCustomer.company}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                      <span className="text-xs text-muted-foreground block">
                        Customer Rating
                      </span>
                      <span className="font-semibold text-foreground">
                        {selectedCustomer.rating} / 5 Stars
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: INVOICE */}
            {activeSidebarTab === "invoice" && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-primary" />
                        Invoices &amp; Billing Statements
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Download and review past billing records for{" "}
                        {selectedCustomer.name}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto min-h-[44px]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export Invoices
                    </button>
                  </div>

                  {/* Clean Invoice Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                    {generateMockInvoices(selectedCustomer.id).map((inv) => (
                      <div
                        key={inv.id}
                        className="p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono font-bold text-foreground text-xs">
                              {inv.id}
                            </span>
                            <p className="text-xs text-foreground/80 font-medium mt-0.5">
                              {inv.description}
                            </p>
                          </div>
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full font-semibold uppercase text-[10px] ${
                              inv.status === "paid"
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                                : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                          <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3 h-3" />
                            {inv.date}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-foreground text-sm tabular-nums">
                              ${inv.amount.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              className="text-primary hover:underline font-semibold text-xs"
                              onClick={() =>
                                alert(`Downloading PDF for ${inv.id}`)
                              }
                            >
                              PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Pure Customer Directory View: Fixed Static Top Header & Dedicated Single Scrollable Area */
        <div className="h-full flex flex-col min-h-0 space-y-4">
          {/* STATIC TOP SECTION: Pinned permanently at top (Zero scroll away) */}
          <div className="shrink-0 space-y-3">
            {/* Page Title Row - Conditionally compact in Full Browser Height mode */}
            {!isBrowserFullHeight ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                    <Users className="w-7 h-7 text-primary" />
                    {t("customers.title", "Customer Directory")}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t(
                      "customers.subtitle",
                      "High-performance virtualized directory supporting 1,000+ accounts",
                    )}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Search & Action Bar - Hidden in Full Browser Height Mode */}
            {!isBrowserFullHeight && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border shadow-xs">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t(
                      "customers.searchPlaceholder",
                      "Search customer by name or phone...",
                    )}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                  />
                </div>

                {/* + Add Customer Action Button */}
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity min-h-[44px] shadow-xs cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t("customers.addCustomer", "Customer")}</span>
                </button>
              </div>
            )}

            {/* View Switcher & Customer Count Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  Showing{" "}
                  <strong className="text-foreground font-semibold">
                    {paginatedData.length}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-foreground font-semibold">
                    {filteredData.length}
                  </strong>{" "}
                  customer records
                  {hasMore && (
                    <span className="ml-1 text-[11px] text-primary font-medium">
                      (Scroll for more)
                    </span>
                  )}
                </span>
              </div>

              {/* View Mode & Full Browser Controls */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                {/* View Mode Toggle: Table vs Card */}
                <div className="flex items-center gap-1 p-1 bg-muted/60 border border-border rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
                      viewMode === "table"
                        ? "bg-card text-foreground shadow-xs border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Table View"
                  >
                    <TableIcon className="w-3.5 h-3.5 text-primary" />
                    <span>Table View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("card")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
                      viewMode === "card"
                        ? "bg-card text-foreground shadow-xs border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Card View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                    <span>Card View</span>
                  </button>
                </div>

                {/* Extra Full Browser Height Toggle Button (Maximizes table/card to 100% full browser) */}
                <div className="relative group/fullbrowser">
                  <button
                    type="button"
                    onClick={toggleBrowserFullHeight}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all min-h-[36px] ${
                      isBrowserFullHeight
                        ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/20"
                        : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                    }`}
                    title={
                      isBrowserFullHeight
                        ? "Exit Full Browser"
                        : "Full Browser View"
                    }
                  >
                    {isBrowserFullHeight ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isBrowserFullHeight
                        ? "Exit Full Browser"
                        : "Full Browser"}
                    </span>
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/fullbrowser:flex flex-col items-center pointer-events-none z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="bg-zinc-900 text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap border border-zinc-800">
                      {isBrowserFullHeight
                        ? "Show All Controls & Menus"
                        : "Maximize Table / Card to Full Browser"}
                    </div>
                    <div className="w-2 h-1 bg-zinc-900 border-x-4 border-t-4 border-transparent border-t-zinc-900 -mt-px" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SCROLLABLE BOTTOM SECTION: Single scroller fills remaining height */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {filteredData.length === 0 ? (
              <div className="py-16 text-center rounded-2xl border border-border bg-card p-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-semibold text-base">
                  {t(
                    "customers.empty",
                    "No customers found matching your criteria.",
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try searching for a different name, email, or clear your
                  active filters.
                </p>
              </div>
            ) : viewMode === "table" ? (
              /* Theme-Aligned 2-Column Virtual Table with Infinite Scrolling */
              <AppVirtualTable<Customer>
                data={paginatedData}
                columns={tableColumns}
                rowHeight={68}
                maxHeight="100%"
                onRowClick={(c) => toggleAccordion(c.id)}
                getRowId={(c) => c.id}
                onEndReached={handleLoadMore}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                isRowExpanded={(c) => expandedCustomerIds.has(c.id)}
                renderExpandedRow={(c) => (
                  <div className="p-4 sm:p-5 bg-card/80 border-y border-border/70 flex flex-col gap-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                        <span className="text-muted-foreground block text-[11px] font-medium">
                          Status
                        </span>
                        <div className="mt-1">
                          {renderStatusBadge(c.status)}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                        <span className="text-muted-foreground block text-[11px] font-medium">
                          Company
                        </span>
                        <span className="font-semibold text-foreground text-sm block truncate mt-0.5">
                          {c.company}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                        <span className="text-muted-foreground block text-[11px] font-medium">
                          Lifetime Spent
                        </span>
                        <span className="font-bold text-foreground font-mono text-sm block mt-0.5">
                          ${c.spent.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                        <span className="text-muted-foreground block text-[11px] font-medium">
                          Email Address
                        </span>
                        <span className="font-mono text-foreground text-xs block truncate mt-0.5">
                          {c.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-muted-foreground">
                        Last Active:{" "}
                        <strong className="text-foreground">
                          {c.lastActive}
                        </strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectCustomer(c.id);
                            setActiveSidebarTab("invoice");
                          }}
                          className="px-3 py-1.5 rounded-lg border border-border bg-muted/60 text-foreground hover:bg-muted font-medium text-xs transition-colors"
                        >
                          View Invoices
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectCustomer(c.id);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-xs hover:opacity-95 transition-opacity"
                        >
                          <span>Open Full Profile</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                className="h-full w-full"
              />
            ) : (
              /* Virtualized Responsive Customer Cards Grid with Infinite Scrolling */
              <div
                ref={parentRef}
                className="h-full w-full rounded-2xl overflow-y-auto focus:outline-none scroll-smooth pr-1"
              >
                <div
                  style={{
                    height: `${cardVirtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                  }}
                >
                  {cardVirtualizer.getVirtualItems().map((virtualRow) => {
                    const startIndex = virtualRow.index * columns;
                    const rowCards = paginatedData.slice(
                      startIndex,
                      startIndex + columns,
                    );

                    return (
                      <div
                        key={virtualRow.index}
                        ref={cardVirtualizer.measureElement}
                        data-index={virtualRow.index}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${virtualRow.start}px)`,
                          paddingBottom: "16px",
                        }}
                        className={
                          columns === 1
                            ? "grid grid-cols-1 gap-4"
                            : columns === 2
                              ? "grid grid-cols-2 gap-4"
                              : columns === 3
                                ? "grid grid-cols-3 gap-4"
                                : columns === 4
                                  ? "grid grid-cols-4 gap-4"
                                  : "grid grid-cols-5 gap-4"
                        }
                      >
                        {rowCards.map((c) => renderCustomerCard(c))}
                      </div>
                    );
                  })}
                </div>

                {/* Card View Loading More Indicator */}
                {isLoadingMore && (
                  <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground animate-pulse">
                    <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span>Loading more customer cards...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Unified Add / Edit Customer Drawer */}
      <AddCustomerDrawer
        isOpen={isAddCustomerOpen}
        onClose={() => {
          setIsAddCustomerOpen(false);
          setEditingCustomer(null);
        }}
        onSubmit={handleSaveCustomer}
        mode={editingCustomer ? "edit" : "add"}
        initialData={
          editingCustomer
            ? {
                id: editingCustomer.id,
                firstName: editingCustomer.name.split(" ")[0] || "",
                lastName: editingCustomer.name.split(" ").slice(1).join(" ") || "",
                phone: editingCustomer.phone,
              }
            : null
        }
        translations={{
          title: t("customers.addCustomerDrawer.title", "Add New Customer"),
          subtitle: t("customers.addCustomerDrawer.subtitle", "Enter the customer details below to create an account."),
          editTitle: t("customers.addCustomerDrawer.editTitle", "Update Customer"),
          editSubtitle: t("customers.addCustomerDrawer.editSubtitle", "Modify the customer information below."),
          firstNameLabel: t("customers.addCustomerDrawer.firstName", "First Name"),
          firstNamePlaceholder: t("customers.addCustomerDrawer.firstNamePlaceholder", "e.g. Amit"),
          lastNameLabel: t("customers.addCustomerDrawer.lastName", "Last Name"),
          lastNamePlaceholder: t("customers.addCustomerDrawer.lastNamePlaceholder", "e.g. Patel"),
          phoneLabel: t("customers.addCustomerDrawer.phone", "Mobile Number"),
          phonePlaceholder: t("customers.addCustomerDrawer.phonePlaceholder", "e.g. 9876543210"),
          mandatoryNotice: t("customers.addCustomerDrawer.mandatoryNotice", "* All three fields are mandatory"),
          errorFirstNameRequired: t("customers.addCustomerDrawer.errors.firstNameRequired", "First name is required"),
          errorLastNameRequired: t("customers.addCustomerDrawer.errors.lastNameRequired", "Last name is required"),
          errorPhoneRequired: t("customers.addCustomerDrawer.errors.phoneRequired", "Mobile number is required"),
          errorPhoneInvalid: t("customers.addCustomerDrawer.errors.phoneInvalid", "Please enter a valid 10-digit mobile number"),
          cancelButton: t("customers.addCustomerDrawer.buttons.cancel", "Cancel"),
          submitButton: t("customers.addCustomerDrawer.buttons.save", "Add Customer"),
          updateButton: t("customers.addCustomerDrawer.buttons.update", "Update Customer"),
        }}
      />
    </AppAdminLayout>
  );
}
