import * as React from "react";
import { LanguageDropdown, type LanguageItem } from "../molecules/LanguageDropdown";

export interface LanguageDropdownOrganismProps {
  currentLanguage: string;
  onLanguageSelect: (languageId: string) => void;
  languages?: LanguageItem[];
  className?: string;
  align?: "left" | "right";
  label?: string;
}

export const DEFAULT_LANGUAGES: LanguageItem[] = [
  { id: "gu", name: "Gujarati", nativeName: "ગુજરાતી", shortCode: "ગુજ" },
  { id: "hi", name: "Hindi", nativeName: "हिंदी", shortCode: "હિં" },
  { id: "en", name: "English", nativeName: "English", shortCode: "EN" },
];

/**
 * LanguageDropdownOrganism (Stateful Organism)
 * 
 * Strict Atomic Design Principle:
 * - Controls dropdown lifecycle state (`isOpen`).
 * - Manages side effects: outside-clicks, 'Escape' key navigation, auto-close.
 * - Delegates pure visual presentation entirely to the `LanguageDropdown` molecule.
 */
export function LanguageDropdownOrganism({
  currentLanguage,
  onLanguageSelect,
  languages = DEFAULT_LANGUAGES,
  className,
  align = "right",
  label = "Language",
}: LanguageDropdownOrganismProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
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

  // Close when pressing Escape key
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelect = React.useCallback(
    (lngId: string) => {
      onLanguageSelect(lngId);
      setIsOpen(false);
    },
    [onLanguageSelect]
  );

  return (
    <LanguageDropdown
      ref={containerRef}
      className={className}
      isOpen={isOpen}
      onToggle={handleToggle}
      onSelect={handleSelect}
      currentLanguage={currentLanguage}
      languages={languages}
      align={align}
      label={label}
    />
  );
}
