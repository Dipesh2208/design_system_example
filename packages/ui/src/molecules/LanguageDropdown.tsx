import * as React from "react";
import { ChevronDown, Check, Globe } from "lucide-react";
import { AppDropdownMenu, AppDropdownItem } from "../atoms/AppDropdown";
import { cn } from "../lib/utils";

export interface LanguageItem {
  id: string;
  name: string;
  nativeName: string;
  shortCode?: string;
}

export interface LanguageDropdownProps {
  className?: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (languageId: string) => void;
  currentLanguage: string;
  languages: LanguageItem[];
  label?: string;
  align?: "left" | "right";
}

/**
 * LanguageDropdown (Pure Stateless Molecule)
 * 
 * Strict Atomic Design:
 * - 100% Stateless Presentational Renderer.
 * - Solid opaque popup styling prevents any content bleed-through across all 6 themes.
 * - Displays Globe icon, current language name, and dropdown items.
 */
export const LanguageDropdown = React.forwardRef<HTMLDivElement, LanguageDropdownProps>(
  (
    {
      className,
      isOpen,
      onToggle,
      onSelect,
      currentLanguage,
      languages,
      label = "Language",
      align = "right",
      ...props
    },
    ref
  ) => {
    const activeItem =
      languages.find((l) => l.id === currentLanguage) ||
      languages.find((l) => currentLanguage.startsWith(l.id)) ||
      languages[0];

    return (
      <div
        ref={ref}
        className={cn("relative inline-block text-left", className)}
        {...props}
      >
        {/* Trigger Button */}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-label={`Current language: ${activeItem?.name || currentLanguage}. Click to open language menu.`}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 min-h-[44px] rounded-xl border border-border bg-card text-foreground hover:bg-secondary transition-all outline-none focus-visible:ring-3 focus-visible:ring-primary shadow-xs text-xs font-medium"
        >
          <Globe className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />

          <span className="font-semibold text-foreground">
            {activeItem?.nativeName || activeItem?.name || label}
          </span>

          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
              isOpen && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>

        {/* 100% Solid Opaque AppDropdownMenu Atom */}
        <AppDropdownMenu isOpen={isOpen} align={align}>
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border mb-1 select-none">
              Select Language
            </div>

            {languages.map((item) => {
              const isSelected =
                item.id === currentLanguage || currentLanguage.startsWith(item.id);
              return (
                <AppDropdownItem
                  key={item.id}
                  isSelected={isSelected}
                  onClick={() => onSelect(item.id)}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold truncate">{item.nativeName}</span>
                    <span className="text-[10px] text-muted-foreground font-normal truncate">
                      {item.name}
                    </span>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-current shrink-0 ml-2" aria-hidden="true" />
                  )}
                </AppDropdownItem>
              );
            })}
          </div>
        </AppDropdownMenu>
      </div>
    );
  }
);

LanguageDropdown.displayName = "LanguageDropdown";
