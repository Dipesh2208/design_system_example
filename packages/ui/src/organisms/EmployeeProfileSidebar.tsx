import React from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Ban,
  Edit3,
} from "lucide-react";
import { AppButton } from "../atoms/AppButton";
import { AppBadge } from "../atoms/AppBadge";
import type { NewEmployeeFormData } from "./AddEmployeeDrawer";

export interface EmployeeProfileSidebarTranslations {
  title?: string;
  contactInfo?: string;
  primaryContact?: string;
  primaryBadge?: string;
  otherContact?: string;
  optionalBadge?: string;
  notProvided?: string;
  addressSection?: string;
  indiaStandardBadge?: string;
  landmark?: string;
  district?: string;
  country?: string;
  noAddress?: string;
  employmentParticulars?: string;
  department?: string;
  designation?: string;
  close?: string;
  editDetails?: string;
  activeStatus?: string;
  onLeaveStatus?: string;
  inactiveStatus?: string;
}

export interface EmployeeProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  employee: NewEmployeeFormData | null;
  onEdit?: (employee: NewEmployeeFormData) => void;
  translations?: EmployeeProfileSidebarTranslations;
  className?: string;
}

export function EmployeeProfileSidebar({
  isOpen,
  onClose,
  employee,
  onEdit,
  translations = {},
  className = "",
}: EmployeeProfileSidebarProps) {
  if (!isOpen || !employee) return null;

  const t = {
    title: translations.title || "Employee Profile",
    contactInfo: translations.contactInfo || "Contact Information",
    primaryContact:
      translations.primaryContact || "Primary Contact (Mandatory)",
    primaryBadge: translations.primaryBadge || "Primary",
    otherContact: translations.otherContact || "Other Contact",
    optionalBadge: translations.optionalBadge || "Optional",
    notProvided: translations.notProvided || "Not provided",
    addressSection:
      translations.addressSection || "Standard Postal Address (India)",
    indiaStandardBadge: translations.indiaStandardBadge || "India Standard",
    landmark: translations.landmark || "Landmark",
    district: translations.district || "District",
    country: translations.country || "INDIA",
    noAddress: translations.noAddress || "No address provided",
    employmentParticulars:
      translations.employmentParticulars || "Employment Particulars",
    department: translations.department || "Department",
    designation: translations.designation || "Designation",
    close: translations.close || "Close",
    editDetails: translations.editDetails || "Edit Details",
    activeStatus: translations.activeStatus || "Active",
    onLeaveStatus: translations.onLeaveStatus || "On Leave",
    inactiveStatus: translations.inactiveStatus || "Inactive",
  };

  const fullName = `${employee.firstName} ${employee.lastName}`.trim();
  const addr = employee.address;

  // Determine if there is any address filled
  const hasAddress =
    addr &&
    (addr.addressLine1 ||
      addr.addressLine2 ||
      addr.landmark ||
      addr.city ||
      addr.district ||
      addr.state ||
      addr.pincode);

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "active":
        return t.activeStatus;
      case "on_leave":
        return t.onLeaveStatus;
      case "inactive":
        return t.inactiveStatus;
      default:
        return status || t.activeStatus;
    }
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden ${className}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          role="dialog"
          aria-modal="true"
          aria-label={t.title}
          className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              {t.title}
            </h2>
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(employee)}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                  title={t.editDetails}
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                title={t.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Top Identity Card */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/40 border border-border">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-xl flex items-center justify-center shrink-0 shadow-xs">
                {employee.firstName.charAt(0)}
                {employee.lastName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-foreground truncate">
                  {fullName}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {employee.designation || "Staff Member"}{" "}
                  {employee.department ? `• ${employee.department}` : ""}
                </p>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      employee.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : employee.status === "on_leave"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {employee.status === "active" ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {getStatusLabel(employee.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t.contactInfo}
              </h4>
              <div className="space-y-2">
                {/* Primary Contact */}
                <div className="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      {t.primaryContact}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {t.primaryBadge}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground mt-1.5">
                    {employee.primaryContact}
                  </p>
                </div>

                {/* Other Contact */}
                <div className="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                      {employee.otherContact?.includes("@") ? (
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      {t.otherContact}
                    </span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {t.optionalBadge}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground mt-1.5">
                    {employee.otherContact || (
                      <span className="text-muted-foreground italic text-xs">
                        {t.notProvided}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Standard Indian Address */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {t.addressSection}
                </h4>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {t.indiaStandardBadge}
                </span>
              </div>

              {hasAddress ? (
                <div className="p-4 rounded-xl border border-border bg-card space-y-2 text-xs leading-relaxed text-foreground">
                  {addr.addressLine1 && (
                    <div className="font-semibold text-sm">
                      {addr.addressLine1}
                    </div>
                  )}
                  {addr.addressLine2 && <div>{addr.addressLine2}</div>}
                  {addr.landmark && (
                    <div className="text-muted-foreground flex items-center gap-1.5">
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium">
                        {t.landmark}
                      </span>
                      {addr.landmark}
                    </div>
                  )}
                  <div className="pt-2 border-t border-border/60 flex flex-wrap gap-x-2 gap-y-1">
                    {addr.city && (
                      <span className="font-medium">{addr.city},</span>
                    )}
                    {addr.district && (
                      <span>
                        {t.district}: {addr.district},
                      </span>
                    )}
                    {addr.state && (
                      <span className="font-medium">{addr.state}</span>
                    )}
                    {addr.pincode && (
                      <span className="font-bold text-primary">
                        - {addr.pincode}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase pt-1">
                    {t.country}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20 text-center">
                  <p className="text-xs text-muted-foreground italic">
                    {t.noAddress}
                  </p>
                </div>
              )}
            </div>

            {/* Role & Department Details */}
            {(employee.department || employee.designation) && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-primary" />
                  {t.employmentParticulars}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl border border-border bg-card">
                    <span className="text-muted-foreground block text-[10px]">
                      {t.department}
                    </span>
                    <span className="font-semibold text-foreground mt-1 block">
                      {employee.department || "General"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-card">
                    <span className="text-muted-foreground block text-[10px]">
                      {t.designation}
                    </span>
                    <span className="font-semibold text-foreground mt-1 block">
                      {employee.designation || "Staff"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-border flex items-center gap-3 w-full">
            <AppButton
              variant="outline"
              size="md"
              onClick={onClose}
              className="flex-1 w-full justify-center"
            >
              {t.close}
            </AppButton>
            {onEdit && (
              <AppButton
                variant="primary"
                size="md"
                onClick={() => onEdit(employee)}
                className="flex-1 w-full justify-center"
              >
                {t.editDetails}
              </AppButton>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
