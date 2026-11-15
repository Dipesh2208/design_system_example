import React from "react";
import {
  ChevronLeft,
  Columns,
  Star,
  FileSpreadsheet,
  Receipt,
  User,
  X,
  Edit3,
} from "lucide-react";

export interface CustomerProfileData {
  id: string;
  name: string;
  email: string;
  company?: string;
  avatar?: string;
  rating?: number;
  isFavorite?: boolean;
}

export type CustomerProfileTab = "details" | "invoice";

export interface CustomerProfileSidebarProps {
  customer: CustomerProfileData;
  activeTab: CustomerProfileTab;
  onTabChange: (tab: CustomerProfileTab) => void;
  onBack: () => void;
  onToggleFavorite?: (isFavorite: boolean) => void;
  onRatingChange?: (rating: number) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onEdit?: () => void;
  className?: string;
}

export function CustomerProfileSidebar({
  customer,
  activeTab,
  onTabChange,
  onBack,
  onToggleFavorite,
  onRatingChange,
  isMobileOpen = false,
  onMobileClose,
  onEdit,
  className = "",
}: CustomerProfileSidebarProps) {
  const currentRating = customer.rating ?? 4;
  const isFavorite = customer.isFavorite ?? false;

  const content = (
    <div className="flex flex-col h-full w-full select-none">
      {/* Top Header Bar: < Back and Panel Layout Icon */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors focus:outline-none rounded-lg px-1.5 py-1 -ml-1.5 hover:bg-muted/60"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-1">
          <div
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            title="Sidebar View Active"
          >
            <Columns className="w-4 h-4" />
          </div>

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/60 transition-colors"
              title="Edit Customer"
              aria-label="Edit Customer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {onMobileClose && (
            <button
              type="button"
              onClick={onMobileClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Customer Profile Card Container */}
      <div className="p-4 rounded-2xl bg-muted/40 border border-border flex flex-col items-center text-center shadow-xs">
        {/* Profile Silhouette Avatar */}
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden shadow-inner text-muted-foreground">
            {customer.avatar ? (
              <img
                src={customer.avatar}
                alt={customer.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 stroke-[1.25] text-muted-foreground/80 translate-y-1" />
            )}
          </div>
        </div>

        {/* Customer Identity */}
        <h3 className="text-sm font-bold text-foreground truncate w-full px-1">
          {customer.name}
        </h3>
        <p className="text-xs text-muted-foreground truncate w-full px-1 mb-3">
          {customer.email}
        </p>

        {/* Interactive 5-Star Rating */}
        <div className="flex items-center justify-center gap-1 py-1">
          {[1, 2, 3, 4, 5].map((starIndex) => {
            const isFilled = starIndex <= currentRating;
            return (
              <button
                key={starIndex}
                type="button"
                onClick={() => onRatingChange?.(starIndex)}
                className="p-0.5 text-muted-foreground/40 hover:text-amber-500 hover:scale-110 transition-all focus:outline-none"
                aria-label={`Rate ${starIndex} stars`}
              >
                <Star
                  className={`w-4 h-4 ${isFilled
                      ? "text-amber-500 fill-amber-500 stroke-amber-500"
                      : "stroke-current fill-transparent"
                    }`}
                />
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-full my-3 border-t border-border/80" />

        {/* Add to Favorites Checkbox */}
        <label className="flex items-center justify-center gap-2 text-xs font-medium text-foreground cursor-pointer hover:text-primary transition-colors py-0.5">
          <input
            type="checkbox"
            checked={isFavorite}
            onChange={(e) => onToggleFavorite?.(e.target.checked)}
            className="w-4 h-4 rounded border-border accent-primary cursor-pointer focus:ring-1 focus:ring-primary"
          />
          <span>Add to Favorites</span>
        </label>
      </div>

      {/* Nav Menu List: Details & Invoice */}
      <nav className="mt-5 space-y-1.5 flex-1">
        {/* Details Tab */}
        <button
          type="button"
          onClick={() => onTabChange("details")}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${activeTab === "details"
              ? "bg-primary text-primary-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
        >
          <FileSpreadsheet className="w-4 h-4 shrink-0" />
          <span className="truncate">Details</span>
        </button>

        {/* Invoice Tab */}
        <button
          type="button"
          onClick={() => onTabChange("invoice")}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${activeTab === "invoice"
              ? "bg-primary text-primary-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
        >
          <Receipt className="w-4 h-4 shrink-0" />
          <span className="truncate">Invoice</span>
        </button>
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop In-Flow Sidebar */}
      <aside
        className={`hidden lg:flex flex-col w-64 xl:w-72 shrink-0 bg-card border border-border rounded-2xl p-4 shadow-xs transition-colors duration-200 ${className}`}
      >
        {content}
      </aside>

      {/* Mobile Off-Canvas Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />

          {/* Drawer Sheet */}
          <aside className="relative w-72 max-w-[85vw] h-full bg-card border-r border-border p-4 shadow-2xl z-10 flex flex-col overflow-y-auto">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
