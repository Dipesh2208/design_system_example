import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormFieldAction } from "../FormFieldAction";

describe("FormFieldAction (Molecule)", () => {
  it("renders label, placeholder, and submit button", () => {
    const handleInputChange = vi.fn();
    const handleSubmit = vi.fn((e) => e.preventDefault());

    render(
      <FormFieldAction
        label="Email Address"
        inputValue=""
        inputPlaceholder="user@example.com"
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        submitButtonText="Send Invite"
      />
    );

    expect(screen.getByText("Email Address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("user@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send Invite" })).toBeInTheDocument();
  });

  it("handles form submission and input changes", () => {
    const handleInputChange = vi.fn();
    const handleSubmit = vi.fn((e) => e.preventDefault());

    render(
      <FormFieldAction
        inputValue="admin"
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        submitButtonText="Submit"
      />
    );

    const input = screen.getByDisplayValue("admin");
    fireEvent.change(input, { target: { value: "superadmin" } });
    expect(handleInputChange).toHaveBeenCalled();

    const submitBtn = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitBtn);
    expect(handleSubmit).toHaveBeenCalled();
  });

  it("displays error message when provided", () => {
    render(
      <FormFieldAction
        inputValue=""
        onInputChange={() => {}}
        onSubmit={() => {}}
        errorMessage="Invalid email address"
      />
    );
    expect(screen.getByText("Invalid email address")).toBeInTheDocument();
  });

  it("displays success message when provided", () => {
    render(
      <FormFieldAction
        inputValue=""
        onInputChange={() => {}}
        onSubmit={() => {}}
        successMessage="Saved successfully"
      />
    );
    expect(screen.getByText("Saved successfully")).toBeInTheDocument();
  });
});
