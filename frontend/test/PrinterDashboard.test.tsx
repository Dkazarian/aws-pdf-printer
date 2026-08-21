import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrinterDashboard } from "../components/PrinterDashboard";

describe("PrinterDashboard", () => {
  it("owns the workflow hooks and renders the dashboard", () => {
    render(<PrinterDashboard />);

    expect(screen.getByRole("heading", { name: "Print plain text to PDF." })).toBeInTheDocument();
    expect(screen.queryByText("NONE")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View source on GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/Dkazarian/aws-pdf-printer/tree/master",
    );
  });
});

