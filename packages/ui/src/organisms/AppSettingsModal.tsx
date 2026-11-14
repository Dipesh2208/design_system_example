import React, { useState, useEffect, useRef } from "react";
import { X, Palette, Globe, Check, Sparkles, ChevronDown } from "lucide-react";
import type { ThemeType, LanguageType } from "../stores/useAppStore";

export interface ThemeOptionItem {
  id: ThemeType;
  name: string;
  description: string;
  badgeColors: [string, string];
}

export interface LanguageOptionItem {
  id: string;
  code: LanguageType;
  label: string;
  nativeLabel: string;
}

export interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeType;
  onThemeSelect: (theme: ThemeType) => void;
  currentLanguage: LanguageType;
  onLanguageSelect: (language: LanguageType) => void;
  themes: ThemeOptionItem[];
  languages: LanguageOptionItem[];
  className?: string;
}

export function AppSettingsModal({
  isOpen,
  onClose,
  currentTheme,
  onThemeSelect,
  currentLanguage,
  onLanguageSelect,
  themes,
  languages,
  className = "",
}: AppSettingsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  // Close dropdowns on outside click within modal
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        themeDropdownRef.current &&
        !themeDropdownRef.current.contains(e.target as Node)
      ) {
        setIsThemeOpen(false);
      }
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(e.target as Node)
      ) {
        setIsLanguageOpen(false);
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
        if (isThemeOpen) {
          setIsThemeOpen(false);
        } else if (isLanguageOpen) {
          setIsLanguageOpen(false);
        } else {
          onClose();
        }
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, isThemeOpen, isLanguageOpen, onClose]);

  if (!isOpen) return null;

  const activeTheme = themes.find((t) => t.id === currentTheme) || themes[0];
  const activeLanguage =
    languages.find((lng) => lng.code === currentLanguage) || languages[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
        className={`relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col transition-all animate-fadeIn ${className}`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="settings-dialog-title"
                className="text-lg font-bold text-foreground"
              >
                System Settings
              </h2>
              <p className="text-xs text-muted-foreground">
                Customize appearance themes and application language
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Dropdown Selectors */}
        <div className="p-5 sm:p-6 space-y-6 overflow-visible">
          {/* SECTION 1: THEME SELECT DROPDOWN */}
          <div className="space-y-2">
            <label
              htmlFor="theme-select-btn"
              className="flex items-center gap-2 text-sm font-bold text-foreground"
            >
              <Palette className="w-4 h-4 text-primary" />
              <span>Theme &amp; Appearance</span>
            </label>
            <p className="text-xs text-muted-foreground">
              Select your active color palette
            </p>

            <div ref={themeDropdownRef} className="relative pt-1">
              {/* Trigger Button */}
              <button
                id="theme-select-btn"
                type="button"
                onClick={() => {
                  setIsThemeOpen(!isThemeOpen);
                  setIsLanguageOpen(false);
                }}
                aria-expanded={isThemeOpen}
                aria-haspopup="listbox"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-border bg-muted/40 hover:bg-muted text-left transition-all min-h-[52px] focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Active theme color dots */}
                  {activeTheme && (
                    <div
                      className="flex -space-x-1 shrink-0"
                      aria-hidden="true"
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-border shadow-xs"
                        style={{ backgroundColor: activeTheme.badgeColors[0] }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-border shadow-xs"
                        style={{ backgroundColor: activeTheme.badgeColors[1] }}
                      />
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {activeTheme?.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate">
                      {activeTheme?.description}
                    </span>
                  </div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                    isThemeOpen ? "rotate-180 text-primary" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {/* Theme Dropdown Menu */}
              {isThemeOpen && (
                <div
                  role="listbox"
                  aria-label="Theme options"
                  className="absolute left-0 right-0 top-full mt-2 z-50 p-1.5 rounded-2xl border border-border bg-popover shadow-xl max-h-64 overflow-y-auto space-y-1 animate-fadeIn"
                >
                  {themes.map((t) => {
                    const isSelected = currentTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onThemeSelect(t.id);
                          setIsThemeOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors text-sm min-h-[44px] ${
                          isSelected
                            ? "bg-primary/10 text-primary font-semibold"
                            : "hover:bg-muted text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="flex -space-x-1 shrink-0"
                            aria-hidden="true"
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-border shadow-xs"
                              style={{ backgroundColor: t.badgeColors[0] }}
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-border shadow-xs"
                              style={{ backgroundColor: t.badgeColors[1] }}
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="truncate">{t.name}</span>
                            <span className="text-[11px] text-muted-foreground truncate">
                              {t.description}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <Check className="w-4 h-4 text-primary shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: LANGUAGE SELECT DROPDOWN */}
          <div className="space-y-2 pt-4 border-t border-border">
            <label
              htmlFor="language-select-btn"
              className="flex items-center gap-2 text-sm font-bold text-foreground"
            >
              <Globe className="w-4 h-4 text-primary" />
              <span>Language &amp; Region</span>
            </label>
            <p className="text-xs text-muted-foreground">
              Choose the interface display language
            </p>

            <div ref={languageDropdownRef} className="relative pt-1">
              {/* Trigger Button */}
              <button
                id="language-select-btn"
                type="button"
                onClick={() => {
                  setIsLanguageOpen(!isLanguageOpen);
                  setIsThemeOpen(false);
                }}
                aria-expanded={isLanguageOpen}
                aria-haspopup="listbox"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-border bg-muted/40 hover:bg-muted text-left transition-all min-h-[52px] focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {activeLanguage?.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate">
                      {activeLanguage?.nativeLabel}
                    </span>
                  </div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                    isLanguageOpen ? "rotate-180 text-primary" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {/* Language Dropdown Menu */}
              {isLanguageOpen && (
                <div
                  role="listbox"
                  aria-label="Language options"
                  className="absolute left-0 right-0 top-full mt-2 z-50 p-1.5 rounded-2xl border border-border bg-popover shadow-xl max-h-56 overflow-y-auto space-y-1 animate-fadeIn"
                >
                  {languages.map((lng) => {
                    const isSelected = currentLanguage === lng.code;
                    return (
                      <button
                        key={lng.code}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onLanguageSelect(lng.code);
                          setIsLanguageOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors text-sm min-h-[44px] ${
                          isSelected
                            ? "bg-primary/10 text-primary font-semibold"
                            : "hover:bg-muted text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-semibold">{lng.label}</span>
                          <span className="text-xs text-muted-foreground">
                            ({lng.nativeLabel})
                          </span>
                        </div>

                        {isSelected && (
                          <Check className="w-4 h-4 text-primary shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-muted/30 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono">
            Auto-persisted to store
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity min-h-[40px] flex items-center justify-center shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
