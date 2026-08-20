import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JobProgress } from "../components/JobProgress";

describe("JobProgress", () => {
  it("keeps the bar empty at NONE", () => {
    const { container } = render(<JobProgress state="NONE" />);

    expect(container.querySelectorAll(".complete, .completed, .current")).toHaveLength(0);
  });

  it("shows every reached segment in blue while processing", () => {
    const { container } = render(<JobProgress state="PROCESSING" />);

    expect(container.querySelectorAll(".complete")).toHaveLength(3);
    expect(container.querySelectorAll(".current")).toHaveLength(0);
  });

  it("fills the entire bar green at COMPLETED", () => {
    const { container } = render(<JobProgress state="COMPLETED" />);

    expect(container.querySelectorAll(".completed")).toHaveLength(4);
    expect(container.querySelectorAll(".complete")).toHaveLength(0);
    expect(container.querySelectorAll(".current")).toHaveLength(0);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");
  });
});

