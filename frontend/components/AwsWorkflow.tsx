import React from "react";
import type { JobState } from "../types/printer";

type AwsWorkflowProps = {
  state?: JobState;
};

const workflowSteps = [
  "API Gateway",
  "Lambda creates a job in DynamoDB",
  "Lambda detects the DynamoDB INSERT and sends the job to SQS",
  "Worker Lambda generates the PDF",
  "PDF is stored in S3",
];

export function AwsWorkflow({ state = "SENDING" }: AwsWorkflowProps) {
  const activeIndex = state === "NONE" ? -1 : Math.min(workflowSteps.length - 1, statesToStepIndex[state]);

  return (
    <div className="aws-workflow" aria-label="AWS processing workflow">
      <p className="workflow-heading">What happens behind the scenes</p>
      {workflowSteps.map((step, index) => (
        <div
          className={`workflow-step ${index === activeIndex ? "current" : index < activeIndex ? "complete" : ""}`}
          key={step}
        >
          <span aria-hidden="true">●</span>
          <span>{step}</span>
        </div>
      ))}
    </div>
  );
}

const statesToStepIndex = {
  NONE: -1,
  SENDING: 0,
  PENDING: 2,
  PROCESSING: 3,
  COMPLETED: 4,
} as const;

