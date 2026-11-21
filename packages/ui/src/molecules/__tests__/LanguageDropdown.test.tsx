import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageDropdown, LanguageItem } from "../LanguageDropdown";

const sampleLanguages: LanguageItem[] = [
  { id: "en", name: "English", nativeName: "English", shortCode: "EN" },
  { id: "gu", name: "Gujarati", nativeName: "ગુજરાતી", shortCode: "GU" },
  { id: "hi", name: "Hindi", nativeName: "हिन्दी", shortCode: "HI" },
];

describe("LanguageDropdown (Molecule)", () => {
  it("renders trigger button with current language label", () => {
    render(
      <LanguageDropdown
        isOpen={false}
        onToggle={() => {}}
        onSelect={() => {}}
        currentLanguage="gu"
        languages={sampleLanguages}
      />
    );
    expect(screen.getByRole("button")).toHaveTextContent("ગુજરાતી");
  });

  it("calls onToggle when trigger button is clicked", () => {
    const handleToggle = vi.fn();
    render(
      <LanguageDropdown
        isOpen={false}
        onToggle={handleToggle}
        onSelect={() => {}}
        currentLanguage="en"
        languages={sampleLanguages}
      />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it("renders dropdown menu with all language items when isOpen is true", () => {
    const handleSelect = vi.fn();
    render(
      <LanguageDropdown
        isOpen={true}
        onToggle={() => {}}
        onSelect={handleSelect}
        currentLanguage="en"
        languages={sampleLanguages}
      />
    );

    expect(screen.getByRole("menu")).toBeInTheDocument();
    const items = screen.getAllByRole("menuitem");
    expect(items).toHaveLength(3);

    fireEvent.click(screen.getByRole("menuitem", { name: /gujarati/i }));
    expect(handleSelect).toHaveBeenCalledWith("gu");
  });
});
