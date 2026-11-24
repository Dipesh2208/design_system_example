"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useDeferredValue,
} from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { defer, json, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit, Await, Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Users,
  Search,
  Plus,
  Phone,
  LayoutGrid,
  Table as TableIcon,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Minimize2,
  CheckCircle,
  Clock,
  Ban,
  Briefcase,
  MapPin,
  Edit3,
  ExternalLink,
  LayoutDashboard,
  UserCheck,
} from "lucide-react";

import {
  AppAdminLayout,
  type AppVirtualTableProps,
  type ColumnDef,
  UserAvatarDropdownOrganism,
  type NewEmployeeFormData,
  type EmployeeAddress,
} from "@repo/ui/organisms";
import { AppSpinner } from "@repo/ui/atoms";

// Lazy-loaded employee organisms and virtual table
const AddEmployeeDrawer = React.lazy(() =>
  import("@repo/ui/organisms/AddEmployeeDrawer").then((m) => ({
    default: m.AddEmployeeDrawer,
  })),
);
const EmployeeProfileSidebar = React.lazy(() =>
  import("@repo/ui/organisms/EmployeeProfileSidebar").then((m) => ({
    default: m.EmployeeProfileSidebar,
  })),
);
const AppVirtualTable = React.lazy(() =>
  import("@repo/ui/organisms/AppVirtualTable").then((m) => ({
    default: m.AppVirtualTable,
  })),
) as <T>(props: AppVirtualTableProps<T>) => React.ReactElement;

import {
  requireAdminUser,
  sessionCookie,
  type AdminUser,
} from "../session.server";
import { AppSettingsManager } from "../components/AppSettingsManager";
import { ClientOnly } from "../components/ClientOnly";
import { useAppStore } from "@repo/ui/stores";

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  primaryContact: string;
  otherContact?: string;
  department: string;
  designation: string;
  status: "active" | "on_leave" | "terminated";
  avatarBg: string;
  address?: EmployeeAddress;
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
  "Sneha",
  "Vikram",
  "Ananya",
  "Rohan",
  "Pooja",
  "Arjun",
  "Kavita",
  "Suresh",
  "Neha",
  "Deepak",
  "Sunita",
  "Rajesh",
  "Meera",
  "Aditya",
  "Divya",
  "Manoj",
  "Shweta",
  "Kunal",
  "Tanvi",
  "Naveen",
  "Ritu",
  "Harsh",
  "Preeti",
  "Sanjay",
  "Aarti",
  "Gaurav",
  "Nisha",
  "Alok",
  "Pallavi",
];

const LAST_NAMES = [
  "Sharma",
  "Patel",
  "Verma",
  "Singh",
  "Gupta",
  "Deshmukh",
  "Chopra",
  "Reddy",
  "Nair",
  "Bose",
  "Mehta",
  "Joshi",
  "Kulkarni",
  "Malhotra",
  "Saxena",
  "Bhatia",
  "Pandey",
  "Trivedi",
  "Mishra",
  "Aggarwal",
  "Kapoor",
  "Chatterjee",
  "Rao",
  "Shetty",
];

const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Operations",
  "Finance",
  "Human Resources",
  "Marketing",
  "Legal",
];
const DESIGNATIONS = [
  "Software Engineer",
  "Product Specialist",
  "Operations Manager",
  "Financial Analyst",
  "HR Partner",
  "Marketing Lead",
];

const INDIAN_CITIES_STATES = [
  {
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380015",
    district: "Ahmedabad",
  },
  {
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    district: "Mumbai City",
  },
  {
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    district: "Bengaluru Urban",
  },
  {
    city: "Delhi",
    state: "Delhi (NCT)",
    pincode: "110001",
    district: "Central Delhi",
  },
  { city: "Pune", state: "Maharashtra", pincode: "411001", district: "Pune" },
  { city: "Jaipur", state: "Rajasthan", pincode: "302001", district: "Jaipur" },
  {
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500001",
    district: "Hyderabad",
  },
  {
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600001",
    district: "Chennai",
  },
  {
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700001",
    district: "Kolkata",
  },
  { city: "Surat", state: "Gujarat", pincode: "395001", district: "Surat" },
];

function generateMockEmployees(count: number): Employee[] {
  const employees: Employee[] = [];
  for (let i = 1; i <= count; i++) {
    const fn = FIRST_NAMES[(i * 7 + 3) % FIRST_NAMES.length]!;
    const ln = LAST_NAMES[(i * 11 + 5) % LAST_NAMES.length]!;
    const loc = INDIAN_CITIES_STATES[i % INDIAN_CITIES_STATES.length]!;
    const dept = DEPARTMENTS[i % DEPARTMENTS.length]!;
    const desig = DESIGNATIONS[i % DESIGNATIONS.length]!;
    const statusRoll = i % 10;
    const status: "active" | "on_leave" | "terminated" =
      statusRoll === 0 ? "terminated" : statusRoll < 3 ? "on_leave" : "active";

    employees.push({
      id: `EMP-${String(i).padStart(4, "0")}`,
      firstName: fn,
      lastName: ln,
      name: `${fn} ${ln}`,
      primaryContact: `98${String((i * 13579) % 100000000).padStart(8, "0")}`,
      otherContact:
        i % 2 === 0
          ? `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`
          : `079-${26500000 + (i % 9999)}`,
      department: dept,
      designation: desig,
      status,
      avatarBg: AVATAR_COLORS[i % AVATAR_COLORS.length]!,
      address: {
        addressLine1: `Flat ${101 + (i % 500)}, Tower ${(i % 10) + 1}`,
        addressLine2: `Sector ${((i * 3) % 25) + 1}, Ring Road`,
        landmark: `Opp. Metro Station Pillar ${(i % 80) + 10}`,
        city: loc.city,
        district: loc.district,
        state: loc.state,
        pincode: loc.pincode,
      },
    });
  }
  return employees;
}

const STATIC_EMPLOYEES = generateMockEmployees(1000);

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAdminUser(request);
  const employeesPromise = Promise.resolve(STATIC_EMPLOYEES);

  return defer({
    user,
    employeesPromise,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdminUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "logout") {
    return redirect("/auth", {
      headers: {
        "Set-Cookie": await sessionCookie.serialize("", { maxAge: 0 }),
      },
    });
  }

  return json({ success: true });
}

export default function EmployeesPage() {
  const { user } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const submit = useSubmit();

  const [employees, setEmployees] = useState<Employee[]>(STATIC_EMPLOYEES);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "on_leave" | "terminated"
  >("all");

  // View Mode: Table vs. Card View
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // Infinite Scroll Pagination State
  const BATCH_SIZE = 50;
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Full-width & Full-browser layout state from central store
  const isContentFullWidth = useAppStore((state) => state.isContentFullWidth);
  const isBrowserFullHeight = useAppStore((state) => state.isBrowserFullHeight);
  const toggleBrowserFullHeight = useAppStore(
    (state) => state.toggleBrowserFullHeight,
  );

  // Reset pagination when search query changes
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [searchQuery, statusFilter]);

  // Accordion Expand/Collapse State (for Table Rows & Cards)
  const [expandedEmployeeIds, setExpandedEmployeeIds] = useState<Set<string>>(
    new Set(),
  );

  const toggleAccordion = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedEmployeeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Add / Edit Drawer State
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Selected Employee & Sidebar State
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Dynamic Column Count Tracking for Responsive Card Grid
  const [columns, setColumns] = useState(3);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number | null = null;
    const updateColumns = () => {
      if (animationFrameId !== null) return;
      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = null;
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
      });
    };

    updateColumns();
    window.addEventListener("resize", updateColumns, { passive: true });
    return () => {
      window.removeEventListener("resize", updateColumns);
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isContentFullWidth]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = deferredSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.primaryContact.includes(q) ||
        (emp.otherContact && emp.otherContact.toLowerCase().includes(q)) ||
        emp.department.toLowerCase().includes(q) ||
        (emp.address?.state && emp.address.state.toLowerCase().includes(q)) ||
        (emp.address?.city && emp.address.city.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "all" || emp.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [employees, deferredSearchQuery, statusFilter]);

  // Infinite Scroll Slice: Display up to `visibleCount` items
  const paginatedData = useMemo(() => {
    return filteredEmployees.slice(0, visibleCount);
  }, [filteredEmployees, visibleCount]);

  const hasMore = visibleCount < filteredEmployees.length;

  const handleLoadMore = React.useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    setVisibleCount((prev) =>
      Math.min(prev + BATCH_SIZE, filteredEmployees.length),
    );
    setIsLoadingMore(false);
  }, [hasMore, isLoadingMore, filteredEmployees.length]);

  // Virtualizer row count based on paginated items
  const rowCount = Math.ceil(paginatedData.length / columns);

  // Card virtualizer
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

  const handleAddOrUpdateEmployee = (formData: NewEmployeeFormData) => {
    if (formData.id) {
      // Update existing
      setEmployees((prev) =>
        prev.map((emp) => {
          if (emp.id === formData.id) {
            const updated: Employee = {
              ...emp,
              firstName: formData.firstName,
              lastName: formData.lastName,
              name: `${formData.firstName} ${formData.lastName}`.trim(),
              primaryContact: formData.primaryContact,
              otherContact: formData.otherContact,
              department: formData.department || emp.department,
              designation: formData.designation || emp.designation,
              status: formData.status || emp.status,
              address: formData.address,
            };
            if (selectedEmployee?.id === emp.id) {
              setSelectedEmployee(updated);
            }
            return updated;
          }
          return emp;
        }),
      );
    } else {
      // Create new
      const newId = `EMP-${String(employees.length + 1).padStart(4, "0")}`;
      const newEmp: Employee = {
        id: newId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        primaryContact: formData.primaryContact,
        otherContact: formData.otherContact,
        department: formData.department || "Operations",
        designation: formData.designation || "Staff Associate",
        status: formData.status || "active",
        avatarBg:
          AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]!,
        address: formData.address,
      };
      setEmployees((prev) => [newEmp, ...prev]);
    }
  };

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setIsAddDrawerOpen(true);
  };

  const handleOpenEdit = (emp: Employee, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingEmployee(emp);
    setIsAddDrawerOpen(true);
  };

  const handleOpenProfile = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsProfileSidebarOpen(true);
  };

  const handleLogout = () => {
    const formData = new FormData();
    formData.append("intent", "logout");
    submit(formData, { method: "post" });
  };

  // Status Badge Helper
  const renderStatusBadge = (status: Employee["status"]) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            {t("employees.filterActive", "Active")}
          </span>
        );
      case "on_leave":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            {t("employees.filterOnLeave", "On Leave")}
          </span>
        );
      case "terminated":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
            <Ban className="w-3 h-3" />
            {t("employees.filterTerminated", "Terminated")}
          </span>
        );
    }
  };

  // 2-Column Virtual Table Definition (like Customer & Lead module)
  const tableColumns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        key: "name",
        header: t("employees.table.employee", "Employee Name & Profile"),
        width: "60%",
        render: (emp: Employee) => {
          const isExpanded = expandedEmployeeIds.has(emp.id);
          return (
            <div className="flex items-center gap-3 py-1.5 min-w-0">
              {/* Accordion Chevron Button */}
              <button
                type="button"
                onClick={(e) => toggleAccordion(emp.id, e)}
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
                onClick={() => handleOpenProfile(emp)}
                className="flex items-center gap-3 min-w-0 cursor-pointer flex-1 group"
              >
                <div
                  className={`w-10 h-10 rounded-2xl ${emp.avatarBg} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                >
                  {emp.firstName.charAt(0)}
                  {emp.lastName.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors truncate">
                    {emp.name}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground truncate">
                    {emp.designation} • {emp.id}
                  </span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        key: "primaryContact",
        header: t("employees.table.primaryContact", "Mobile Number"),
        width: "40%",
        render: (emp: Employee) => (
          <div className="flex items-center justify-between gap-2.5 py-1.5 text-sm pr-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-foreground transition-all group-hover:border-primary/40 group-hover:bg-primary/15 shadow-xs">
              <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="font-mono font-semibold text-xs sm:text-sm tracking-wider">
                {emp.primaryContact}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => handleOpenEdit(emp, e)}
              className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-muted/80 transition-colors border border-transparent hover:border-border"
              title={t("employees.editEmployee", "Edit Employee")}
              aria-label={t("employees.editEmployee", "Edit Employee")}
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [t, expandedEmployeeIds],
  );

  // Single Employee Card Component (like Customer Card with inline accordion expansion)
  const renderEmployeeCard = (emp: Employee) => {
    const isExpanded = expandedEmployeeIds.has(emp.id);

    return (
      <div
        key={emp.id}
        className="p-5 rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xs shadow-xs flex flex-col justify-between gap-4 transition-all duration-200 hover:border-primary/50 hover:shadow-lg text-left group"
      >
        {/* Top Header: Avatar + Employee Name & ID */}
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div
            onClick={() => handleOpenProfile(emp)}
            className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
          >
            <div
              className={`w-12 h-12 rounded-2xl ${emp.avatarBg} text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
            >
              {emp.firstName.charAt(0)}
              {emp.lastName.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-foreground truncate text-sm sm:text-base group-hover:text-primary transition-colors tracking-tight">
                {emp.name}
              </span>
              <span className="font-mono text-xs text-muted-foreground/80 truncate">
                {emp.designation} • {emp.id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => handleOpenEdit(emp, e)}
              className="p-2 rounded-xl border border-border bg-muted/40 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
              title={t("employees.editEmployee", "Edit Employee")}
              aria-label={t("employees.editEmployee", "Edit Employee")}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            {/* Accordion Expand/Collapse Trigger */}
            <button
              type="button"
              onClick={(e) => toggleAccordion(emp.id, e)}
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
        <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between gap-2.5 text-xs group-hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <span className="font-mono font-semibold text-foreground tracking-wide truncate">
              {emp.primaryContact}
            </span>
          </div>
          <div>{renderStatusBadge(emp.status)}</div>
        </div>

        {/* Accordion Drawer inside Card */}
        {isExpanded && (
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-2.5 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Department:</span>
              <span className="font-semibold text-foreground truncate">
                {emp.department}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Designation:</span>
              <span className="font-semibold text-foreground truncate">
                {emp.designation}
              </span>
            </div>
            {emp.otherContact && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Other Contact:</span>
                <span className="font-mono text-foreground truncate text-[11px]">
                  {emp.otherContact}
                </span>
              </div>
            )}
            {emp.address && (
              <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground space-y-1">
                <span className="font-medium text-foreground block">
                  Postal Address:
                </span>
                <div>
                  {emp.address.addressLine1
                    ? `${emp.address.addressLine1}, `
                    : ""}
                  {emp.address.city ? `${emp.address.city}, ` : ""}
                  {emp.address.state || "India"}
                  {emp.address.pincode ? ` - ${emp.address.pincode}` : ""}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Card Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
          <button
            type="button"
            onClick={(e) => toggleAccordion(emp.id, e)}
            className="text-muted-foreground hover:text-foreground text-[11px] font-medium"
          >
            {isExpanded ? "Collapse Details" : "Expand Details"}
          </button>

          <button
            type="button"
            onClick={() => handleOpenProfile(emp)}
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
      linkComponent={Link}
      currentPath="/employees"
      user={user}
      contentScrollable={false}
      isFullWidth={isContentFullWidth}
      isHeaderHidden={isBrowserFullHeight}
      isSidebarHidden={isBrowserFullHeight}
      brandName="SaaS Matrix"
      navItems={[
        {
          id: "dashboard",
          label: t("nav.dashboard", "Dashboard"),
          href: "/dashboard",
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          id: "customers",
          label: t("nav.customers", "Customers"),
          href: "/customers",
          icon: <Users className="w-5 h-5" />,
        },
        {
          id: "leads",
          label: t("nav.leads", "Leads"),
          href: "/leads",
          icon: <UserCheck className="w-5 h-5" />,
        },
        {
          id: "employees",
          label: t("nav.employees", "Employees"),
          href: "/employees",
          icon: <Briefcase className="w-5 h-5" />,
        },
      ]}
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

      {/* Main Employee Directory View: Static Top Controls & Dedicated Single Scrollable Area */}
      <div className="h-full flex flex-col min-h-0 space-y-4">
        {/* STATIC TOP SECTION: Pinned permanently at top (Zero scroll away) */}
        <div className="shrink-0 space-y-3">
          {/* Page Title Row - Conditionally compact in Full Browser Height mode */}
          {!isBrowserFullHeight && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                  <Briefcase className="w-7 h-7 text-primary" />
                  {t("employees.title", "Employee Directory")}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {t(
                    "employees.subtitle",
                    "Comprehensive staff directory supporting 1,000+ employee records",
                  )}
                </p>
              </div>
            </div>
          )}

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
                    "employees.searchPlaceholder",
                    "Search employee by name, mobile, department, or state...",
                  )}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                />
              </div>

              {/* + Add Employee Action Button */}
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity min-h-[44px] shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{t("employees.addEmployee", "Employee")}</span>
              </button>
            </div>
          )}

          {/* View Switcher & Employee Count Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                Showing{" "}
                <strong className="text-foreground font-semibold">
                  {paginatedData.length}
                </strong>{" "}
                of{" "}
                <strong className="text-foreground font-semibold">
                  {filteredEmployees.length}
                </strong>{" "}
                employee records
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

              {/* Full Browser Height Toggle Button */}
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
                    {isBrowserFullHeight ? "Exit Full Browser" : "Full Browser"}
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
          {filteredEmployees.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-border bg-card p-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-semibold text-base">
                {t(
                  "employees.empty",
                  "No employees found matching your criteria.",
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try searching for a different name, mobile, or clear your active
                filters.
              </p>
            </div>
          ) : viewMode === "table" ? (
            /* Theme-Aligned 2-Column Virtual Table with Infinite Scrolling */
            <AppVirtualTable<Employee>
              data={paginatedData}
              columns={tableColumns}
              rowHeight={68}
              maxHeight="100%"
              onRowClick={(emp: Employee) => toggleAccordion(emp.id)}
              getRowId={(emp: Employee) => emp.id}
              onEndReached={handleLoadMore}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              isRowExpanded={(emp: Employee) => expandedEmployeeIds.has(emp.id)}
              renderExpandedRow={(emp: Employee) => (
                <div className="p-4 sm:p-5 bg-card/80 border-y border-border/70 flex flex-col gap-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-muted-foreground block text-[11px] font-medium">
                        Status
                      </span>
                      <div className="mt-1">
                        {renderStatusBadge(emp.status)}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-muted-foreground block text-[11px] font-medium">
                        Department
                      </span>
                      <span className="font-semibold text-foreground text-sm block truncate mt-0.5">
                        {emp.department}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-muted-foreground block text-[11px] font-medium">
                        Designation
                      </span>
                      <span className="font-semibold text-foreground text-sm block truncate mt-0.5">
                        {emp.designation}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-muted-foreground block text-[11px] font-medium">
                        Other Contact
                      </span>
                      <span className="font-mono text-foreground text-xs block truncate mt-0.5">
                        {emp.otherContact || "-"}
                      </span>
                    </div>
                  </div>

                  {emp.address && (
                    <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground block mb-0.5">
                        Standard Indian Address:
                      </span>
                      <div>
                        {emp.address.addressLine1
                          ? `${emp.address.addressLine1}, `
                          : ""}
                        {emp.address.addressLine2
                          ? `${emp.address.addressLine2}, `
                          : ""}
                        {emp.address.landmark
                          ? `Near ${emp.address.landmark}, `
                          : ""}
                        {emp.address.city ? `${emp.address.city}, ` : ""}
                        {emp.address.district
                          ? `District: ${emp.address.district}, `
                          : ""}
                        {emp.address.state || "India"}
                        {emp.address.pincode ? ` - ${emp.address.pincode}` : ""}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProfile(emp);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-xs hover:opacity-95 transition-opacity"
                    >
                      <span>Open Full Profile</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
              className="h-full w-full"
            />
          ) : (
            /* Virtualized Responsive Employee Cards Grid with Infinite Scrolling */
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
                      {rowCards.map((emp) => renderEmployeeCard(emp))}
                    </div>
                  );
                })}
              </div>

              {/* Card View Loading More Indicator */}
              {isLoadingMore && (
                <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground animate-pulse">
                  <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span>Loading more employee cards...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Drawer */}
      <ClientOnly>
        {() => (
          <React.Suspense fallback={null}>
            <AddEmployeeDrawer
              isOpen={isAddDrawerOpen}
              onClose={() => {
                setIsAddDrawerOpen(false);
                setEditingEmployee(null);
              }}
              onSubmit={handleAddOrUpdateEmployee}
              initialData={
                editingEmployee
                  ? {
                      id: editingEmployee.id,
                      firstName: editingEmployee.firstName,
                      lastName: editingEmployee.lastName,
                      primaryContact: editingEmployee.primaryContact,
                      otherContact: editingEmployee.otherContact,
                      department: editingEmployee.department,
                      designation: editingEmployee.designation,
                      status: editingEmployee.status,
                      address: editingEmployee.address,
                    }
                  : null
              }
              mode={editingEmployee ? "edit" : "add"}
              translations={{
                title: t(
                  "employees.addEmployeeDrawer.title",
                  "Add New Employee",
                ),
                subtitle: t(
                  "employees.addEmployeeDrawer.subtitle",
                  "Enter the employee details below to create a staff record.",
                ),
                editTitle: t(
                  "employees.addEmployeeDrawer.editTitle",
                  "Update Employee",
                ),
                editSubtitle: t(
                  "employees.addEmployeeDrawer.editSubtitle",
                  "Modify the employee information below.",
                ),
                firstNameLabel: t(
                  "employees.addEmployeeDrawer.firstName",
                  "First Name",
                ),
                firstNamePlaceholder: t(
                  "employees.addEmployeeDrawer.firstNamePlaceholder",
                  "e.g. Rahul",
                ),
                lastNameLabel: t(
                  "employees.addEmployeeDrawer.lastName",
                  "Last Name",
                ),
                lastNamePlaceholder: t(
                  "employees.addEmployeeDrawer.lastNamePlaceholder",
                  "e.g. Sharma",
                ),
                primaryContactLabel: t(
                  "employees.addEmployeeDrawer.primaryContact",
                  "Primary Contact (Mobile)",
                ),
                primaryContactPlaceholder: t(
                  "employees.addEmployeeDrawer.primaryContactPlaceholder",
                  "e.g. 9876543210",
                ),
                otherContactLabel: t(
                  "employees.addEmployeeDrawer.otherContact",
                  "Other Contact (Phone or Email)",
                ),
                otherContactPlaceholder: t(
                  "employees.addEmployeeDrawer.otherContactPlaceholder",
                  "e.g. 022-24300000 or rahul@company.com",
                ),
                departmentLabel: t(
                  "employees.addEmployeeDrawer.department",
                  "Department",
                ),
                designationLabel: t(
                  "employees.addEmployeeDrawer.designation",
                  "Designation",
                ),
                statusLabel: t("employees.addEmployeeDrawer.status", "Status"),
                addressSectionTitle: t(
                  "employees.addEmployeeDrawer.addressSectionTitle",
                  "Standard Indian Address",
                ),
                addressSectionSubtitle: t(
                  "employees.addEmployeeDrawer.addressSectionSubtitle",
                  "Structured according to Indian postal standards (optional)",
                ),
                addressLine1Label: t(
                  "employees.addEmployeeDrawer.addressLine1",
                  "Flat / House / Door / Building No.",
                ),
                addressLine1Placeholder: t(
                  "employees.addEmployeeDrawer.addressLine1Placeholder",
                  "e.g. Flat 402, Block B, Krishna Tower",
                ),
                addressLine2Label: t(
                  "employees.addEmployeeDrawer.addressLine2",
                  "Street / Road / Lane / Locality",
                ),
                addressLine2Placeholder: t(
                  "employees.addEmployeeDrawer.addressLine2Placeholder",
                  "e.g. M.G. Road, Near Ring Road",
                ),
                landmarkLabel: t(
                  "employees.addEmployeeDrawer.landmark",
                  "Landmark",
                ),
                landmarkPlaceholder: t(
                  "employees.addEmployeeDrawer.landmarkPlaceholder",
                  "e.g. Opposite City Hospital",
                ),
                cityLabel: t(
                  "employees.addEmployeeDrawer.city",
                  "City / Town / Village",
                ),
                cityPlaceholder: t(
                  "employees.addEmployeeDrawer.cityPlaceholder",
                  "e.g. Ahmedabad",
                ),
                districtLabel: t(
                  "employees.addEmployeeDrawer.district",
                  "District",
                ),
                districtPlaceholder: t(
                  "employees.addEmployeeDrawer.districtPlaceholder",
                  "e.g. Ahmedabad",
                ),
                stateLabel: t(
                  "employees.addEmployeeDrawer.state",
                  "State / Union Territory",
                ),
                statePlaceholder: t(
                  "employees.addEmployeeDrawer.statePlaceholder",
                  "Select State / UT",
                ),
                pincodeLabel: t(
                  "employees.addEmployeeDrawer.pincode",
                  "PIN Code",
                ),
                pincodePlaceholder: t(
                  "employees.addEmployeeDrawer.pincodePlaceholder",
                  "e.g. 380015",
                ),
                mandatoryNotice: t(
                  "employees.addEmployeeDrawer.mandatoryNotice",
                  "* Only First Name, Last Name, and Primary Contact are mandatory",
                ),
                optionalNotice: t(
                  "employees.addEmployeeDrawer.optionalNotice",
                  "All other contact and address fields are optional",
                ),
                errorFirstNameRequired: t(
                  "employees.addEmployeeDrawer.errors.firstNameRequired",
                  "First name is required",
                ),
                errorLastNameRequired: t(
                  "employees.addEmployeeDrawer.errors.lastNameRequired",
                  "Last name is required",
                ),
                errorPrimaryContactRequired: t(
                  "employees.addEmployeeDrawer.errors.primaryContactRequired",
                  "Primary contact is required",
                ),
                errorPrimaryContactInvalid: t(
                  "employees.addEmployeeDrawer.errors.primaryContactInvalid",
                  "Please enter a valid 10-digit mobile number",
                ),
                errorPincodeInvalid: t(
                  "employees.addEmployeeDrawer.errors.pincodeInvalid",
                  "Please enter a valid 6-digit PIN code",
                ),
                cancelButton: t(
                  "employees.addEmployeeDrawer.buttons.cancel",
                  "Cancel",
                ),
                submitButton: t(
                  "employees.addEmployeeDrawer.buttons.save",
                  "Add Employee",
                ),
                updateButton: t(
                  "employees.addEmployeeDrawer.buttons.update",
                  "Update Employee",
                ),
              }}
            />
          </React.Suspense>
        )}
      </ClientOnly>

      {/* Profile Sidebar */}
      <ClientOnly>
        {() => (
          <React.Suspense fallback={null}>
            <EmployeeProfileSidebar
              isOpen={isProfileSidebarOpen}
              onClose={() => {
                setIsProfileSidebarOpen(false);
                setSelectedEmployee(null);
              }}
              employee={
                selectedEmployee
                  ? {
                      id: selectedEmployee.id,
                      firstName: selectedEmployee.firstName,
                      lastName: selectedEmployee.lastName,
                      primaryContact: selectedEmployee.primaryContact,
                      otherContact: selectedEmployee.otherContact,
                      department: selectedEmployee.department,
                      designation: selectedEmployee.designation,
                      status: selectedEmployee.status,
                      address: selectedEmployee.address,
                    }
                  : null
              }
              translations={{
                title: t("employees.profileSidebar.title", "Employee Profile"),
                contactInfo: t(
                  "employees.profileSidebar.contactInfo",
                  "Contact Information",
                ),
                primaryContact: t(
                  "employees.profileSidebar.primaryContact",
                  "Primary Contact (Mandatory)",
                ),
                primaryBadge: t(
                  "employees.profileSidebar.primaryBadge",
                  "Primary",
                ),
                otherContact: t(
                  "employees.profileSidebar.otherContact",
                  "Other Contact",
                ),
                optionalBadge: t(
                  "employees.profileSidebar.optionalBadge",
                  "Optional",
                ),
                notProvided: t(
                  "employees.profileSidebar.notProvided",
                  "Not provided",
                ),
                addressSection: t(
                  "employees.profileSidebar.addressSection",
                  "Standard Postal Address (India)",
                ),
                indiaStandardBadge: t(
                  "employees.profileSidebar.indiaStandardBadge",
                  "India Standard",
                ),
                landmark: t("employees.profileSidebar.landmark", "Landmark"),
                district: t("employees.profileSidebar.district", "District"),
                country: t("employees.profileSidebar.country", "INDIA"),
                noAddress: t(
                  "employees.profileSidebar.noAddress",
                  "No address provided",
                ),
                employmentParticulars: t(
                  "employees.profileSidebar.employmentParticulars",
                  "Employment Particulars",
                ),
                department: t(
                  "employees.profileSidebar.department",
                  "Department",
                ),
                designation: t(
                  "employees.profileSidebar.designation",
                  "Designation",
                ),
                close: t("employees.profileSidebar.close", "Close"),
                editDetails: t(
                  "employees.profileSidebar.editDetails",
                  "Edit Details",
                ),
                activeStatus: t("employees.filterActive", "Active"),
                onLeaveStatus: t("employees.filterOnLeave", "On Leave"),
                inactiveStatus: t("employees.filterTerminated", "Terminated"),
              }}
              onEdit={(emp) => {
                setIsProfileSidebarOpen(false);
                const found = employees.find((e) => e.id === emp.id);
                if (found) handleOpenEdit(found);
              }}
            />
          </React.Suspense>
        )}
      </ClientOnly>
    </AppAdminLayout>
  );
}
