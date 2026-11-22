import React, { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut, ChevronDown, Shield } from "lucide-react";
import { AppDropdownMenu, AppDropdownItem } from "../atoms/AppDropdown";

export interface UserAvatarDropdownUser {
  name?: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface UserAvatarDropdownOrganismProps {
  user: UserAvatarDropdownUser;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
  className?: string;
}

export function UserAvatarDropdownOrganism({
  user,
  onSettingsClick,
  onLogoutClick,
  className = "",
}: UserAvatarDropdownOrganismProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const initials = user.name
    ? user.name.charAt(0).toUpperCase()
    : user.email.charAt(0).toUpperCase();

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className}`}
    >
      {/* Avatar Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User account menu"
        className="flex items-center gap-2 p-1 rounded-xl hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors min-h-[44px]"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
            {initials}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
        </div>

        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-semibold text-foreground max-w-[120px] truncate leading-tight">
            {user.name || user.email.split("@")[0]}
          </span>
          <span className="text-[10px] text-muted-foreground capitalize flex items-center gap-0.5">
            <Shield className="w-2.5 h-2.5 text-primary" />
            {user.role || "Admin"}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 hidden sm:block ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Solid Elevated Dropdown Menu */}
      <AppDropdownMenu isOpen={isOpen} align="right" className="w-56 mt-2">
        {/* User Profile Overview */}
        <div className="px-3 py-2.5 border-b border-border/80">
          <p className="text-xs font-bold text-foreground truncate">
            {user.name || "Administrator"}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {user.email}
          </p>
          <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium border border-primary/20">
            <Shield className="w-2.5 h-2.5" />
            <span>{user.role || "Super Admin"}</span>
          </div>
        </div>

        {/* Menu Actions */}
        <div className="p-1 space-y-0.5">
          {/* Settings Item */}
          <AppDropdownItem
            onClick={() => {
              setIsOpen(false);
              onSettingsClick?.();
            }}
            className="text-foreground hover:bg-muted font-medium"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span>Settings</span>
            </div>
          </AppDropdownItem>

          {/* Sign Out Item */}
          <AppDropdownItem
            onClick={() => {
              setIsOpen(false);
              onLogoutClick?.();
            }}
            className="text-destructive hover:bg-destructive/10 font-semibold"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </div>
          </AppDropdownItem>
        </div>
      </AppDropdownMenu>
    </div>
  );
}
