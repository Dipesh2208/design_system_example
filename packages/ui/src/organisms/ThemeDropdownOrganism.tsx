import * as React from "react";
import { ThemeDropdown, type ThemeItem } from "../molecules/ThemeDropdown";

export interface ThemeDropdownOrganismProps {
  className?: string;
  currentTheme: string;
  onThemeSelect: (themeId: string) => void;
  themes: ThemeItem[];
  label?: string;
  align?: "left" | "right";
}

/**
 * ThemeDropdownOrganism (Interactive Organism)
 * 
 * Strict Atomic Design Principle:
 * - Organisms encapsulate stateful behavior, DOM event listeners, and lifecycle hooks.
 * - Manages useState(isOpen) and useEffect(click-outside, escape key).
 * - Passes all state and event callbacks down to the pure ThemeDropdown molecule.
 */
export const ThemeDropdownOrganism: React.FC<ThemeDropdownOrganismProps> = ({
  className,
  currentTheme,
  onThemeSelect,
  themes,
  label,
  align,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Manage outside click and keyboard Escape in the Organism layer
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (themeId: string) => {
    onThemeSelect(themeId);
    setIsOpen(false);
  };

  return (
    <ThemeDropdown
      ref={containerRef}
      className={className}
      isOpen={isOpen}
      onToggle={() => setIsOpen((prev) => !prev)}
      onSelect={handleSelect}
      currentTheme={currentTheme}
      themes={themes}
      label={label}
      align={align}
    />
  );
};

ThemeDropdownOrganism.displayName = "ThemeDropdownOrganism";
