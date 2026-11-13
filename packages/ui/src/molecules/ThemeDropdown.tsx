import * as React from "react";
import { ChevronDown, Check, Palette } from "lucide-react";
import { AppDropdownMenu, AppDropdownItem } from "../atoms/AppDropdown";
import { cn } from "../lib/utils";

export interface ThemeItem {
  id: string;
  name: string;
  badgeColors: [string, string];
}

export interface ThemeDropdownProps {
  className?: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (themeId: string) => void;
  currentTheme: string;
  themes: ThemeItem[];
  label?: string;
  align?: "left" | "right";
}

/**
 * ThemeDropdown (Pure Stateless Molecule)
 * 
 * Strict Atomic Design:
 * - 100% Stateless Composite Renderer.
 * - Solid opaque popup styling prevents any content bleed-through across all 6 themes.
 */
export const ThemeDropdown = React.forwardRef<HTMLDivElement, ThemeDropdownProps>(
  (
    {
      className,
      isOpen,
      onToggle,
      onSelect,
      currentTheme,
      themes,
      label = "Theme",
      align = "right",
      ...props
    },
    ref
  ) => {
    const activeThemeItem = themes.find((t) => t.id === currentTheme) || themes[0];

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
          aria-label={`Current theme: ${activeThemeItem?.name || currentTheme}. Click to open theme menu.`}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 min-h-[44px] rounded-xl border border-border bg-card text-foreground hover:bg-secondary transition-all outline-none focus-visible:ring-3 focus-visible:ring-primary shadow-xs text-xs font-medium"
        >
          {activeThemeItem ? (
            <span className="flex -space-x-1 shrink-0" aria-hidden="true">
              <span
                className="w-3.5 h-3.5 rounded-full border border-border shadow-xs"
                style={{ backgroundColor: activeThemeItem.badgeColors[0] }}
              />
              <span
                className="w-3.5 h-3.5 rounded-full border border-border shadow-xs"
                style={{ backgroundColor: activeThemeItem.badgeColors[1] }}
              />
            </span>
          ) : (
            <Palette className="w-4 h-4 text-muted-foreground shrink-0" />
          )}

          <span className="hidden sm:inline font-semibold text-foreground">
            {activeThemeItem?.name || label}
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
              Select Theme
            </div>

            {themes.map((item) => {
              const isSelected = item.id === currentTheme;
              return (
                <AppDropdownItem
                  key={item.id}
                  isSelected={isSelected}
                  onClick={() => onSelect(item.id)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex -space-x-1 shrink-0" aria-hidden="true">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-border shadow-xs"
                        style={{ backgroundColor: item.badgeColors[0] }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-border shadow-xs"
                        style={{ backgroundColor: item.badgeColors[1] }}
                      />
                    </span>
                    <span className="truncate">{item.name}</span>
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

ThemeDropdown.displayName = "ThemeDropdown";
