import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { AddEmployeeDrawer } from "../AddEmployeeDrawer";

describe("AddEmployeeDrawer (Organism)", () => {
  it("renders when open and displays title, mandatory notices, and inputs", () => {
    render(
      <AddEmployeeDrawer isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />,
    );

    expect(screen.getByText("Add New Employee")).toBeInTheDocument();
    expect(
      screen.getByText(
        "* Only First Name, Last Name, and Primary Contact are mandatory",
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Primary Contact/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Other Contact/i)).toBeInTheDocument();
  });

  it("shows validation errors for mandatory fields only (First Name, Last Name, Primary Contact)", async () => {
    const handleSubmit = vi.fn();
    render(
      <AddEmployeeDrawer
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
      />,
    );

    const submitBtn = screen.getByRole("button", { name: "Add Employee" });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText("First name is required"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Last name is required"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Primary contact is required"),
    ).toBeInTheDocument();

    // No error for Other Contact or Address fields
    expect(
      screen.queryByText(/Please enter a valid 6-digit PIN code/i),
    ).toBeNull();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("validates primary contact length (must be >= 10 digits)", async () => {
    render(
      <AddEmployeeDrawer isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />,
    );

    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "Rohit" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "Mehta" },
    });
    fireEvent.change(screen.getByLabelText(/Primary Contact/i), {
      target: { value: "12345" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));

    expect(
      await screen.findByText("Please enter a valid 10-digit mobile number"),
    ).toBeInTheDocument();
  });

  it("submits successfully when only mandatory fields (first name, last name, primary contact) are provided", async () => {
    const handleSubmit = vi.fn();
    const handleClose = vi.fn();

    render(
      <AddEmployeeDrawer
        isOpen={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "Aarav" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "Shah" },
    });
    fireEvent.change(screen.getByLabelText(/Primary Contact/i), {
      target: { value: "9876543210" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        id: undefined,
        firstName: "Aarav",
        lastName: "Shah",
        primaryContact: "9876543210",
        otherContact: undefined,
        department: undefined,
        designation: undefined,
        status: "active",
        address: undefined,
      });
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it("validates PIN code only if provided, rejecting malformed PINs", async () => {
    render(
      <AddEmployeeDrawer isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />,
    );

    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "Pooja" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "Patel" },
    });
    fireEvent.change(screen.getByLabelText(/Primary Contact/i), {
      target: { value: "9876543210" },
    });
    fireEvent.change(screen.getByLabelText(/PIN Code/i), {
      target: { value: "0123" },
    }); // Invalid PIN

    fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));

    expect(
      await screen.findByText("Please enter a valid 6-digit PIN code"),
    ).toBeInTheDocument();
  });

  it("submits with complete Indian standard address and secondary contact", async () => {
    const handleSubmit = vi.fn();
    render(
      <AddEmployeeDrawer
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "Pooja" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "Patel" },
    });
    fireEvent.change(screen.getByLabelText(/Primary Contact/i), {
      target: { value: "9876543210" },
    });
    fireEvent.change(screen.getByLabelText(/Other Contact/i), {
      target: { value: "pooja.patel@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Flat \/ House/i), {
      target: { value: "B-204, Shivalik Residency" },
    });
    fireEvent.change(screen.getByLabelText(/Street \/ Road/i), {
      target: { value: "Science City Road, Sola" },
    });
    fireEvent.change(screen.getByLabelText(/Landmark/i), {
      target: { value: "Near CIMS Hospital" },
    });
    fireEvent.change(screen.getByLabelText(/City \/ Town/i), {
      target: { value: "Ahmedabad" },
    });
    fireEvent.change(screen.getByLabelText(/District/i), {
      target: { value: "Ahmedabad" },
    });
    fireEvent.change(screen.getByLabelText(/State \/ Union/i), {
      target: { value: "Gujarat" },
    });
    fireEvent.change(screen.getByLabelText(/PIN Code/i), {
      target: { value: "380060" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: "Pooja",
          lastName: "Patel",
          primaryContact: "9876543210",
          otherContact: "pooja.patel@example.com",
          address: {
            addressLine1: "B-204, Shivalik Residency",
            addressLine2: "Science City Road, Sola",
            landmark: "Near CIMS Hospital",
            city: "Ahmedabad",
            district: "Ahmedabad",
            state: "Gujarat",
            pincode: "380060",
          },
        }),
      );
    });
  });
});
