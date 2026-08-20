import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ErrorBanner } from "../components/ErrorBanner";

describe("ErrorBanner", () => {
  it("renders nothing without an error", () => {
    const { container } = render(<ErrorBanner />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders an accessible alert with the error message", () => {
    render(<ErrorBanner message="The job failed." />);

    expect(screen.getByRole("alert")).toHaveTextContent("The job failed.");
  });
});

