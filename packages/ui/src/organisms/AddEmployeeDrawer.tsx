import React, { useState, useEffect, useRef } from "react";
import {
  X,
  UserPlus,
  AlertCircle,
  Phone,
  User,
  Edit3,
  MapPin,
  Building,
  Navigation,
  Mail,
} from "lucide-react";
import { AppButton } from "../atoms/AppButton";
import { AppInput } from "../atoms/AppInput";

/**
 * Standard Indian States and Union Territories (per Government of India / ISO 3166-2:IN)
 */
export const INDIAN_STATES_AND_UTS = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi (NCT)",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export type IndianStateOrUT = (typeof INDIAN_STATES_AND_UTS)[number] | string;

export interface EmployeeAddress {
  addressLine1?: string; // House/Flat/Door/Block No. & Building Name
  addressLine2?: string; // Street/Road/Lane/Locality/Sector
  landmark?: string; // Landmark
  city?: string; // City / Town / Village
  district?: string; // District
  state?: IndianStateOrUT; // State / Union Territory
  pincode?: string; // 6-digit Postal PIN Code
}

export interface NewEmployeeFormData {
  id?: string;
  firstName: string;
  lastName: string;
  primaryContact: string;
  otherContact?: string;
  department?: string;
  designation?: string;
  status?: "active" | "on_leave" | "terminated";
  address?: EmployeeAddress;
}

export interface AddEmployeeDrawerTranslations {
  title?: string;
  subtitle?: string;
  editTitle?: string;
  editSubtitle?: string;
  firstNameLabel?: string;
  firstNamePlaceholder?: string;
  lastNameLabel?: string;
  lastNamePlaceholder?: string;
  primaryContactLabel?: string;
  primaryContactPlaceholder?: string;
  otherContactLabel?: string;
  otherContactPlaceholder?: string;
  departmentLabel?: string;
  designationLabel?: string;
  statusLabel?: string;
  // Address section translations
  addressSectionTitle?: string;
  addressSectionSubtitle?: string;
  addressLine1Label?: string;
  addressLine1Placeholder?: string;
  addressLine2Label?: string;
  addressLine2Placeholder?: string;
  landmarkLabel?: string;
  landmarkPlaceholder?: string;
  cityLabel?: string;
  cityPlaceholder?: string;
  districtLabel?: string;
  districtPlaceholder?: string;
  stateLabel?: string;
  statePlaceholder?: string;
  pincodeLabel?: string;
  pincodePlaceholder?: string;
  // Notices and Errors
  mandatoryNotice?: string;
  optionalNotice?: string;
  errorFirstNameRequired?: string;
  errorLastNameRequired?: string;
  errorPrimaryContactRequired?: string;
  errorPrimaryContactInvalid?: string;
  errorPincodeInvalid?: string;
  cancelButton?: string;
  submitButton?: string;
  updateButton?: string;
}

export interface AddEmployeeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewEmployeeFormData) => void;
  initialData?: NewEmployeeFormData | null;
  mode?: "add" | "edit";
  translations?: AddEmployeeDrawerTranslations;
  className?: string;
}

export function AddEmployeeDrawer({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "add",
  translations = {},
  className = "",
}: AddEmployeeDrawerProps) {
  const isEditMode = mode === "edit" || !!initialData;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [primaryContact, setPrimaryContact] = useState("");
  const [otherContact, setOtherContact] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [status, setStatus] = useState<"active" | "on_leave" | "terminated">(
    "active",
  );

  // Address fields (Indian Standard)
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState<string>("");
  const [pincode, setPincode] = useState("");

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    primaryContact?: string;
    pincode?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstNameInputRef = useRef<HTMLInputElement>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  // Sync initialData when opening or updating
  useEffect(() => {
    if (initialData && isOpen) {
      setFirstName(initialData.firstName || "");
      setLastName(initialData.lastName || "");
      setPrimaryContact(initialData.primaryContact || "");
      setOtherContact(initialData.otherContact || "");
      setDepartment(initialData.department || "");
      setDesignation(initialData.designation || "");
      setStatus(initialData.status || "active");

      if (initialData.address) {
        setAddressLine1(initialData.address.addressLine1 || "");
        setAddressLine2(initialData.address.addressLine2 || "");
        setLandmark(initialData.address.landmark || "");
        setCity(initialData.address.city || "");
        setDistrict(initialData.address.district || "");
        setState(initialData.address.state || "");
        setPincode(initialData.address.pincode || "");
      } else {
        setAddressLine1("");
        setAddressLine2("");
        setLandmark("");
        setCity("");
        setDistrict("");
        setState("");
        setPincode("");
      }
    } else if (!initialData && isOpen) {
      setFirstName("");
      setLastName("");
      setPrimaryContact("");
      setOtherContact("");
      setDepartment("");
      setDesignation("");
      setStatus("active");
      setAddressLine1("");
      setAddressLine2("");
      setLandmark("");
      setCity("");
      setDistrict("");
      setState("");
      setPincode("");
    }
    setErrors({});
  }, [initialData, isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Fallback default translations
  const t = {
    title: isEditMode
      ? translations.editTitle || "Update Employee"
      : translations.title || "Add New Employee",
    subtitle: isEditMode
      ? translations.editSubtitle || "Modify the employee information below."
      : translations.subtitle ||
        "Enter the employee details below to create a staff record.",
    firstNameLabel: translations.firstNameLabel || "First Name",
    firstNamePlaceholder: translations.firstNamePlaceholder || "e.g. Rahul",
    lastNameLabel: translations.lastNameLabel || "Last Name",
    lastNamePlaceholder: translations.lastNamePlaceholder || "e.g. Sharma",
    primaryContactLabel:
      translations.primaryContactLabel || "Primary Contact (Mobile)",
    primaryContactPlaceholder:
      translations.primaryContactPlaceholder || "e.g. 9876543210",
    otherContactLabel:
      translations.otherContactLabel || "Other Contact (Phone or Email)",
    otherContactPlaceholder:
      translations.otherContactPlaceholder ||
      "e.g. 022-24300000 or rahul@company.com",
    departmentLabel: translations.departmentLabel || "Department",
    designationLabel: translations.designationLabel || "Designation",
    statusLabel: translations.statusLabel || "Status",
    // Address translations
    addressSectionTitle:
      translations.addressSectionTitle || "Standard Indian Address",
    addressSectionSubtitle:
      translations.addressSectionSubtitle ||
      "Structured according to Indian postal standards (optional)",
    addressLine1Label:
      translations.addressLine1Label || "Flat / House / Door / Building No.",
    addressLine1Placeholder:
      translations.addressLine1Placeholder ||
      "e.g. Flat 402, Block B, Krishna Tower",
    addressLine2Label:
      translations.addressLine2Label || "Street / Road / Lane / Locality",
    addressLine2Placeholder:
      translations.addressLine2Placeholder || "e.g. M.G. Road, Near Ring Road",
    landmarkLabel: translations.landmarkLabel || "Landmark",
    landmarkPlaceholder:
      translations.landmarkPlaceholder || "e.g. Opposite City Hospital",
    cityLabel: translations.cityLabel || "City / Town / Village",
    cityPlaceholder: translations.cityPlaceholder || "e.g. Ahmedabad",
    districtLabel: translations.districtLabel || "District",
    districtPlaceholder: translations.districtPlaceholder || "e.g. Ahmedabad",
    stateLabel: translations.stateLabel || "State / Union Territory",
    statePlaceholder: translations.statePlaceholder || "Select State / UT",
    pincodeLabel: translations.pincodeLabel || "PIN Code",
    pincodePlaceholder: translations.pincodePlaceholder || "e.g. 380015",
    mandatoryNotice:
      translations.mandatoryNotice ||
      "* Only First Name, Last Name, and Primary Contact are mandatory",
    optionalNotice:
      translations.optionalNotice ||
      "All other contact and address fields are optional",
    errorFirstNameRequired:
      translations.errorFirstNameRequired || "First name is required",
    errorLastNameRequired:
      translations.errorLastNameRequired || "Last name is required",
    errorPrimaryContactRequired:
      translations.errorPrimaryContactRequired || "Primary contact is required",
    errorPrimaryContactInvalid:
      translations.errorPrimaryContactInvalid ||
      "Please enter a valid 10-digit mobile number",
    errorPincodeInvalid:
      translations.errorPincodeInvalid ||
      "Please enter a valid 6-digit PIN code",
    cancelButton: translations.cancelButton || "Cancel",
    submitButton: isEditMode
      ? translations.updateButton || "Update Employee"
      : translations.submitButton || "Add Employee",
  };

  // Autofocus first name input when drawer opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        firstNameInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
      primaryContact?: string;
      pincode?: string;
    } = {};

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedPrimary = primaryContact.trim().replace(/\D/g, "");

    // 1. First Name Mandatory
    if (!trimmedFirst) {
      newErrors.firstName = t.errorFirstNameRequired;
    }

    // 2. Last Name Mandatory
    if (!trimmedLast) {
      newErrors.lastName = t.errorLastNameRequired;
    }

    // 3. Primary Contact Mandatory (Must be at least 10 digits)
    if (!primaryContact.trim()) {
      newErrors.primaryContact = t.errorPrimaryContactRequired;
    } else if (trimmedPrimary.length < 10) {
      newErrors.primaryContact = t.errorPrimaryContactInvalid;
    }

    // 4. PIN Code Optional, but if provided, must be valid 6 digits (Indian PIN format: 100000 - 999999)
    const trimmedPin = pincode.trim();
    if (trimmedPin && !/^[1-9][0-9]{5}$/.test(trimmedPin)) {
      newErrors.pincode = t.errorPincodeInvalid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const hasAddress =
      addressLine1.trim() ||
      addressLine2.trim() ||
      landmark.trim() ||
      city.trim() ||
      district.trim() ||
      state.trim() ||
      pincode.trim();

    onSubmit({
      id: initialData?.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      primaryContact: primaryContact.trim(),
      otherContact: otherContact.trim() || undefined,
      department: department.trim() || undefined,
      designation: designation.trim() || undefined,
      status,
      address: hasAddress
        ? {
            addressLine1: addressLine1.trim() || undefined,
            addressLine2: addressLine2.trim() || undefined,
            landmark: landmark.trim() || undefined,
            city: city.trim() || undefined,
            district: district.trim() || undefined,
            state: state.trim() || undefined,
            pincode: pincode.trim() || undefined,
          }
        : undefined,
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
      aria-labelledby="employee-drawer-title"
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        {/* Drawer Panel */}
        <aside className="w-screen max-w-lg bg-card border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
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
                  id="employee-drawer-title"
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
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Mandatory Notice */}
              <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{t.mandatoryNotice}</span>
              </div>

              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-primary" />
                  Employee Identity
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="emp-first-name"
                      className="block text-xs font-semibold text-foreground"
                    >
                      {t.firstNameLabel}{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <AppInput
                      ref={firstNameInputRef}
                      id="emp-first-name"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (errors.firstName)
                          setErrors((prev) => ({
                            ...prev,
                            firstName: undefined,
                          }));
                      }}
                      placeholder={t.firstNamePlaceholder}
                      aria-invalid={!!errors.firstName}
                      aria-describedby={
                        errors.firstName ? "emp-first-name-error" : undefined
                      }
                    />
                    {errors.firstName && (
                      <p
                        id="emp-first-name-error"
                        className="text-[11px] text-destructive font-medium"
                      >
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="emp-last-name"
                      className="block text-xs font-semibold text-foreground"
                    >
                      {t.lastNameLabel}{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <AppInput
                      id="emp-last-name"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (errors.lastName)
                          setErrors((prev) => ({
                            ...prev,
                            lastName: undefined,
                          }));
                      }}
                      placeholder={t.lastNamePlaceholder}
                      aria-invalid={!!errors.lastName}
                      aria-describedby={
                        errors.lastName ? "emp-last-name-error" : undefined
                      }
                    />
                    {errors.lastName && (
                      <p
                        id="emp-last-name-error"
                        className="text-[11px] text-destructive font-medium"
                      >
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Numbers */}
              <div className="space-y-4 pt-2 border-t border-border">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  Contact Information
                </h3>

                {/* Primary Contact (Mandatory) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="emp-primary-contact"
                      className="block text-xs font-semibold text-foreground"
                    >
                      {t.primaryContactLabel}{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Mandatory
                    </span>
                  </div>
                  <AppInput
                    id="emp-primary-contact"
                    type="tel"
                    value={primaryContact}
                    onChange={(e) => {
                      setPrimaryContact(e.target.value);
                      if (errors.primaryContact)
                        setErrors((prev) => ({
                          ...prev,
                          primaryContact: undefined,
                        }));
                    }}
                    placeholder={t.primaryContactPlaceholder}
                    aria-invalid={!!errors.primaryContact}
                    aria-describedby={
                      errors.primaryContact
                        ? "emp-primary-contact-error"
                        : undefined
                    }
                  />
                  {errors.primaryContact && (
                    <p
                      id="emp-primary-contact-error"
                      className="text-[11px] text-destructive font-medium"
                    >
                      {errors.primaryContact}
                    </p>
                  )}
                </div>

                {/* Other Contact (Optional) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="emp-other-contact"
                      className="block text-xs font-semibold text-foreground"
                    >
                      {t.otherContactLabel}
                    </label>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      Optional
                    </span>
                  </div>
                  <AppInput
                    id="emp-other-contact"
                    value={otherContact}
                    onChange={(e) => setOtherContact(e.target.value)}
                    placeholder={t.otherContactPlaceholder}
                  />
                </div>
              </div>

              {/* Section 3: Standard Indian Address */}
              <div className="space-y-4 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {t.addressSectionTitle}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {t.addressSectionSubtitle}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    Optional
                  </span>
                </div>

                {/* Line 1: House / Flat / Door / Building */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="emp-address-line1"
                    className="block text-xs font-medium text-foreground"
                  >
                    {t.addressLine1Label}
                  </label>
                  <AppInput
                    id="emp-address-line1"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder={t.addressLine1Placeholder}
                  />
                </div>

                {/* Line 2: Street / Road / Locality */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="emp-address-line2"
                    className="block text-xs font-medium text-foreground"
                  >
                    {t.addressLine2Label}
                  </label>
                  <AppInput
                    id="emp-address-line2"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder={t.addressLine2Placeholder}
                  />
                </div>

                {/* Landmark */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="emp-landmark"
                    className="block text-xs font-medium text-foreground"
                  >
                    {t.landmarkLabel}
                  </label>
                  <AppInput
                    id="emp-landmark"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder={t.landmarkPlaceholder}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* City / Town / Village */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="emp-city"
                      className="block text-xs font-medium text-foreground"
                    >
                      {t.cityLabel}
                    </label>
                    <AppInput
                      id="emp-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={t.cityPlaceholder}
                    />
                  </div>

                  {/* District */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="emp-district"
                      className="block text-xs font-medium text-foreground"
                    >
                      {t.districtLabel}
                    </label>
                    <AppInput
                      id="emp-district"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder={t.districtPlaceholder}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* State / UT Dropdown */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="emp-state"
                      className="block text-xs font-medium text-foreground"
                    >
                      {t.stateLabel}
                    </label>
                    <select
                      id="emp-state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="flex h-11 w-full rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    >
                      <option value="">-- {t.statePlaceholder} --</option>
                      {INDIAN_STATES_AND_UTS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PIN Code */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="emp-pincode"
                      className="block text-xs font-medium text-foreground"
                    >
                      {t.pincodeLabel}
                    </label>
                    <AppInput
                      id="emp-pincode"
                      value={pincode}
                      maxLength={6}
                      onChange={(e) => {
                        const val = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);
                        setPincode(val);
                        if (errors.pincode)
                          setErrors((prev) => ({
                            ...prev,
                            pincode: undefined,
                          }));
                      }}
                      placeholder={t.pincodePlaceholder}
                      aria-invalid={!!errors.pincode}
                      aria-describedby={
                        errors.pincode ? "emp-pincode-error" : undefined
                      }
                    />
                    {errors.pincode && (
                      <p
                        id="emp-pincode-error"
                        className="text-[11px] text-destructive font-medium"
                      >
                        {errors.pincode}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 4: Role / Department (Optional) */}
              <div className="space-y-4 pt-2 border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="emp-dept"
                      className="block text-xs font-medium text-foreground"
                    >
                      {t.departmentLabel}
                    </label>
                    <AppInput
                      id="emp-dept"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Operations"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="emp-designation"
                      className="block text-xs font-medium text-foreground"
                    >
                      {t.designationLabel}
                    </label>
                    <AppInput
                      id="emp-designation"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Senior Associate"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Static Pinned Footer with Full-Width Action */}
            <div className="p-6 border-t border-border bg-card shrink-0">
              <AppButton
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                iconLayout="inline"
                containerResponsive={false}
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="w-full !flex-row !items-center !justify-center gap-2 font-semibold text-sm shadow-md"
                title={t.submitButton}
                aria-label={t.submitButton}
              >
                <span>{t.submitButton}</span>
              </AppButton>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
