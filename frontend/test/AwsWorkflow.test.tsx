import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AwsWorkflow } from "../components/AwsWorkflow";

describe("AwsWorkflow", () => {
  it("keeps every step muted before a job starts", () => {
    const { container } = render(<AwsWorkflow state="NONE" />);

    expect(container.querySelectorAll(".workflow-step.complete")).toHaveLength(0);
    expect(container.querySelectorAll(".workflow-step.current")).toHaveLength(0);
  });

  it("marks the worker step as current while processing", () => {
    const { container } = render(<AwsWorkflow state="PROCESSING" />);

    expect(container.querySelectorAll(".workflow-step.complete")).toHaveLength(3);
    expect(container.querySelectorAll(".workflow-step.current")).toHaveLength(1);
    expect(container.querySelector(".workflow-step.current")).toHaveTextContent("Worker Lambda");
  });

  it("marks the full workflow complete when the job completes", () => {
    const { container } = render(<AwsWorkflow state="COMPLETED" />);

    expect(container.querySelectorAll(".workflow-step.complete")).toHaveLength(4);
    expect(container.querySelectorAll(".workflow-step.current")).toHaveLength(1);
    expect(container.querySelector(".workflow-step.current")).toHaveTextContent("PDF is stored in S3");
  });
});


