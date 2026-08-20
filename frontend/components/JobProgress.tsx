import React from "react";
import type { JobState } from "../types/printer";

type JobProgressProps = {
  state?: JobState;
};

const states = ["SENDING", "QUEUED", "PROCESSING", "COMPLETED"] as const;

export function JobProgress({ state = "SENDING" }: JobProgressProps) {
  const currentIndex = state === "NONE" ? -1 : state === "SENDING" ? 0 : state === "PENDING" ? 1 : states.indexOf(state);

  return (
    <div className="job-progress" aria-label="Print job progress">
      <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={3} aria-valuenow={currentIndex}>
        {states.map((step, index) => (
          <span
            className={[
              "progress-segment",
              state === "COMPLETED" ? "completed" : index <= currentIndex ? "complete" : "",
            ].filter(Boolean).join(" ")}
            key={step}
          />
        ))}
      </div>
      <div className="progress-labels">
        {states.map((step) => <span key={step}>{step}</span>)}
      </div>
    </div>
  );
}

