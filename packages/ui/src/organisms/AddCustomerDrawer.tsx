import React, { useState, useEffect, useRef } from "react";
import { X, UserPlus, AlertCircle, Phone, User, Edit3 } from "lucide-react";
import { AppButton } from "../atoms/AppButton";
import { AppInput } from "../atoms/AppInput";

export interface NewCustomerFormData {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  stage?: "pending" | "received" | "lost";
}

export interface AddCustomerDrawerTranslations {
  title?: string;
  subtitle?: string;
  editTitle?: string;
  editSubtitle?: string;
  firstNameLabel?: string;
  firstNamePlaceholder?: string;
  lastNameLabel?: string;
  lastNamePlaceholder?: string;
  phoneLabel?: string;
  phonePlaceholder?: string;
  stageLabel?: string;
  stagePending?: string;
  stageReceived?: string;
  stageLost?: string;
  mandatoryNotice?: string;
  errorFirstNameRequired?: string;
  errorLastNameRequired?: string;
  errorPhoneRequired?: string;
  errorPhoneInvalid?: string;
  cancelButton?: string;
  submitButton?: string;
  updateButton?: string;
}

export interface AddCustomerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewCustomerFormData) => void;
  initialData?: NewCustomerFormData | null;
  mode?: "add" | "edit";
  showStage?: boolean;
  translations?: AddCustomerDrawerTranslations;
  className?: string;
}

export function AddCustomerDrawer({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "add",
  showStage = false,
  translations = {},
  className = "",
}: AddCustomerDrawerProps) {
  const isEditMode = mode === "edit" || !!initialData;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState<"pending" | "received" | "lost">(
    "pending",
  );

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    phone?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstNameInputRef = useRef<HTMLInputElement>(null);

  // Fallback default English text if translation props are omitted
  const t = {
    title: isEditMode
      ? translations.editTitle || "Update Customer"
      : translations.title || "Add New Customer",
    subtitle: isEditMode
      ? translations.editSubtitle || "Modify the customer information below."
      : translations.subtitle ||
        "Enter the customer details below to create an account.",
    firstNameLabel: translations.firstNameLabel || "First Name",
    firstNamePlaceholder: translations.firstNamePlaceholder || "e.g. Amit",
    lastNameLabel: translations.lastNameLabel || "Last Name",
    lastNamePlaceholder: translations.lastNamePlaceholder || "e.g. Patel",
    phoneLabel: translations.phoneLabel || "Mobile Number",
    phonePlaceholder: translations.phonePlaceholder || "e.g. 9876543210",
    stageLabel: translations.stageLabel || "Stage",
    stagePending: translations.stagePending || "Pending",
    stageReceived: translations.stageReceived || "Received",
    stageLost: translations.stageLost || "Lost",
    mandatoryNotice:
      translations.mandatoryNotice || "* All three fields are mandatory",
    errorFirstNameRequired:
      translations.errorFirstNameRequired || "First name is required",
    errorLastNameRequired:
      translations.errorLastNameRequired || "Last name is required",
    errorPhoneRequired:
      translations.errorPhoneRequired || "Mobile number is required",
    errorPhoneInvalid:
      translations.errorPhoneInvalid ||
      "Please enter a valid 10-digit mobile number",
    cancelButton: translations.cancelButton || "Cancel",
    submitButton: isEditMode
      ? translations.updateButton || "Update Customer"
      : translations.submitButton || "Add Customer",
  };

  // Reset or pre-populate form when drawer opens / initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFirstName(initialData.firstName || "");
        setLastName(initialData.lastName || "");
        setPhone(initialData.phone || "");
        setStage(initialData.stage || "pending");
      } else {
        setFirstName("");
        setLastName("");
        setPhone("");
        setStage("pending");
      }
      setErrors({});
      setIsSubmitting(false);
      // Autofocus first name input
      const timer = setTimeout(() => {
        firstNameInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialData]);

  // Handle escape key to close drawer
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const validate = (): boolean => {
    const newErrors: {
      firstName?: string;
      lastName?: string;
      phone?: string;
    } = {};

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedPhone = phone.trim().replace(/\D/g, ""); // digits only

    if (!trimmedFirst) {
      newErrors.firstName = t.errorFirstNameRequired;
    }

    if (!trimmedLast) {
      newErrors.lastName = t.errorLastNameRequired;
    }

    if (!phone.trim()) {
      newErrors.phone = t.errorPhoneRequired;
    } else if (trimmedPhone.length < 10) {
      newErrors.phone = t.errorPhoneInvalid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    onSubmit({
      id: initialData?.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      stage,
    });
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        {/* Drawer Panel */}
        <aside className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                {isEditMode ? (
                  <Edit3 className="w-5 h-5" />
                ) : (
                  <UserPlus className="w-5 h-5" />
                )}
              </div>
              <div>
                <h2
                  id="drawer-title"
                  className="text-base font-bold text-foreground leading-tight"
                >
                  {t.title}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t.subtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-between"
          >
            <div className="space-y-5">
              {/* Mandatory Notice */}
              <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{t.mandatoryNotice}</span>
              </div>

              {/* First Name Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">
                  {t.firstNameLabel} <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <AppInput
                    ref={firstNameInputRef}
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (errors.firstName) {
                        setErrors((prev) => ({
                          ...prev,
                          firstName: undefined,
                        }));
                      }
                    }}
                    placeholder={t.firstNamePlaceholder}
                    className={`pl-9 ${
                      errors.firstName
                        ? "border-destructive focus:ring-destructive"
                        : ""
                    }`}
                  />
                  <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.firstName && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.firstName}</span>
                  </p>
                )}
              </div>

              {/* Last Name Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">
                  {t.lastNameLabel} <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <AppInput
                    type="text"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (errors.lastName) {
                        setErrors((prev) => ({ ...prev, lastName: undefined }));
                      }
                    }}
                    placeholder={t.lastNamePlaceholder}
                    className={`pl-9 ${
                      errors.lastName
                        ? "border-destructive focus:ring-destructive"
                        : ""
                    }`}
                  />
                  <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.lastName && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.lastName}</span>
                  </p>
                )}
              </div>

              {/* Mobile Number Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">
                  {t.phoneLabel} <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <AppInput
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) {
                        setErrors((prev) => ({ ...prev, phone: undefined }));
                      }
                    }}
                    placeholder={t.phonePlaceholder}
                    className={`pl-9 ${
                      errors.phone
                        ? "border-destructive focus:ring-destructive"
                        : ""
                    }`}
                  />
                  <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.phone && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              {/* Optional Stage Dropdown Field */}
              {showStage && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">
                    {t.stageLabel}
                  </label>
                  <select
                    value={stage}
                    onChange={(e) =>
                      setStage(
                        e.target.value as "pending" | "received" | "lost",
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                  >
                    <option value="pending">{t.stagePending}</option>
                    <option value="received">{t.stageReceived}</option>
                    <option value="lost">{t.stageLost}</option>
                  </select>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-6 mt-6 border-t border-border">
              <AppButton
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                iconLayout="inline"
                containerResponsive={false}
                isLoading={isSubmitting}
                className="w-full !flex-row !items-center !justify-center gap-2 font-semibold text-sm shadow-md"
                title={t.submitButton}
                aria-label={t.submitButton}
              >
                {/* {isEditMode ? (
                  <Edit3 className="w-4 h-4 shrink-0" />
                ) : (
                  <UserPlus className="w-4 h-4 shrink-0" />
                )} */}
                <span className="hidden sm:inline">{t.submitButton}</span>
              </AppButton>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
