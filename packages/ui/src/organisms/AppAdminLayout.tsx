import React, { useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  UserCheck,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import { useAppStore } from "../stores/useAppStore";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface AppAdminLayoutProps {
  children: React.ReactNode;
  navItems?: NavItem[];
  currentPath?: string;
  user?: {
    name?: string;
    email: string;
    role?: string;
    avatar?: string;
  } | null;
  brandName?: string;
  brandLogo?: React.ReactNode;
  headerRightContent?: React.ReactNode;
  contentScrollable?: boolean;
  isFullWidth?: boolean;
  isHeaderHidden?: boolean;
  isSidebarHidden?: boolean;
  mainClassName?: string;
  className?: string;
}

export function AppAdminLayout({
  children,
  navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: "customers",
      label: "Customers",
      href: "/customers",
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: "leads",
      label: "Leads",
      href: "/leads",
      icon: <UserCheck className="w-5 h-5" />,
    },
    {
      id: "employees",
      label: "Employees",
      href: "/employees",
      icon: <Briefcase className="w-5 h-5" />,
    },
  ],
  currentPath = "/dashboard",
  user,
  brandName = "SaaS Matrix",
  brandLogo,
  headerRightContent,
  contentScrollable = true,
  isFullWidth = false,
  isHeaderHidden = false,
  isSidebarHidden = false,
  mainClassName = "",
  className = "",
}: AppAdminLayoutProps) {
  // Subscribe cleanly to centralized Zustand store (Zero tab switch reflection)
  const isSidebarCollapsed = useAppStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div
      className={`h-screen w-full flex flex-col overflow-hidden bg-background text-foreground antialiased transition-colors duration-200 ${className}`}
    >
      {/* 1. Top Navigation Header (Fixed h-16) */}
      {!isHeaderHidden && (
        <header className="h-16 shrink-0 bg-card border-b border-border px-3 sm:px-6 flex items-center justify-between transition-colors shadow-xs z-30">
          {/* Left: Mobile hamburger + Brand logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 lg:hidden focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <a
              href="/dashboard"
              className="flex items-center gap-2.5 font-bold tracking-tight text-base sm:text-lg text-foreground hover:opacity-90 transition-opacity"
            >
              {brandLogo || (
                <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black shadow-xs shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
              )}
              <span className="truncate">{brandName}</span>
            </a>
          </div>

          {/* Right Header Controls (Language dropdown, Theme dropdown, User avatar dropdown) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {headerRightContent}
          </div>
        </header>
      )}

      {/* 2. Main Body with Fixed Full-Height Sidebar + Independent Scroll Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Collapsible Fixed-Height Sidebar: Strictly clamped width to prevent layout reflows */}
        {!isSidebarHidden && (
          <aside
            className={`hidden lg:flex flex-col h-full shrink-0 border-r border-border bg-card transition-[width] duration-200 ease-in-out z-20 ${
              isSidebarCollapsed
                ? "w-[4.5rem] min-w-[4.5rem] max-w-[4.5rem]"
                : "w-64 min-w-[16rem] max-w-[16rem]"
            }`}
          >
            {/* Nav Items List */}
            <nav
              className={`flex-1 overflow-y-auto py-4 space-y-1.5 ${
                isSidebarCollapsed ? "px-2" : "px-3"
              }`}
            >
              {navItems.map((item) => {
                const isActive =
                  currentPath === item.href ||
                  currentPath.startsWith(item.href + "/");

                return (
                  <a
                    key={item.id}
                    href={item.href}
                    title={item.label}
                    className={`flex items-center rounded-xl text-sm font-medium transition-colors group ${
                      isSidebarCollapsed
                        ? "justify-center p-3"
                        : "gap-3 px-3.5 py-2.5"
                    } ${
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <span
                      className={`${
                        isActive
                          ? "text-primary-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      } shrink-0 transition-colors`}
                    >
                      {item.icon}
                    </span>

                    {!isSidebarCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}

                    {!isSidebarCollapsed && item.badge && (
                      <span className="px-2 py-0.5 text-[11px] rounded-full bg-primary/20 text-primary-foreground font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Sidebar Collapse Toggle Footer */}
            <div
              className={`p-3 border-t border-border flex items-center shrink-0 ${
                isSidebarCollapsed ? "justify-center" : "justify-between"
              }`}
            >
              {!isSidebarCollapsed && (
                <span className="text-xs text-muted-foreground pl-2 font-mono">
                  v2.4
                </span>
              )}
              <button
                type="button"
                onClick={toggleSidebar}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center focus:outline-none"
                aria-label={
                  isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                }
                title={
                  isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                }
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            </div>
          </aside>
        )}

        {/* Mobile Slide-Over Drawer Modal */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Off-canvas panel */}
            <div className="relative w-72 max-w-[85vw] bg-card h-full flex flex-col shadow-2xl z-10 border-r border-border p-4">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <div className="w-7 h-7 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span>{brandName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive =
                    currentPath === item.href ||
                    currentPath.startsWith(item.href + "/");
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                      }`}
                    >
                      <span
                        className={
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary-foreground">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Content Area: Independent Vertical Scroll or Viewport Locked for Virtualized Children */}
        <main
          className={`flex-1 h-full min-w-0 ${
            contentScrollable
              ? "overflow-y-auto"
              : "overflow-hidden flex flex-col"
          } ${mainClassName}`}
        >
          <div
            className={`${isFullWidth ? "w-full" : "max-w-7xl mx-auto"} w-full min-w-0 ${
              contentScrollable
                ? "p-4 sm:p-6 lg:p-8"
                : "h-full flex flex-col p-3 sm:p-4 min-h-0"
            }`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
