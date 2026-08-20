import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PrintJobForm } from "../components/PrintJobForm";

describe("PrintJobForm", () => {
  it("shows the current character count and forwards text changes", () => {
    const onTextChange = vi.fn();

    render(
      <PrintJobForm
        onSubmit={vi.fn()}
        onTextChange={onTextChange}
        submitting={false}
        text="Hello"
      />,
    );

    expect(screen.getByText("5 / 500 characters")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Text to print"), {
      target: { value: "Hello AWS" },
    });
    expect(onTextChange).toHaveBeenCalledWith("Hello AWS");
  });

  it("disables submission while a job is being submitted", () => {
    render(
      <PrintJobForm
        onSubmit={vi.fn()}
        onTextChange={vi.fn()}
        submitting
        text="Hello"
      />,
    );

    expect(screen.getByRole("button", { name: "Submitting..." })).toBeDisabled();
  });

  it("can disable submission while the job is in progress", () => {
    render(
      <PrintJobForm
        disabled
        onSubmit={vi.fn()}
        onTextChange={vi.fn()}
        submitting={false}
        text="Hello"
      />,
    );

    expect(screen.getByRole("button", { name: "Submit job" })).toBeDisabled();
  });

  it.each([
    ["empty text", ""],
    ["whitespace-only text", "   "],
    ["text over the limit", "a".repeat(501)],
  ])("disables submission for %s", (_description, text) => {
    render(
      <PrintJobForm
        onSubmit={vi.fn()}
        onTextChange={vi.fn()}
        submitting={false}
        text={text}
      />,
    );

    expect(screen.getByRole("button", { name: "Submit job" })).toBeDisabled();
  });
});
