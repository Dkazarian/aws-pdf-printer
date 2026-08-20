"use client";

import React from "react";
import { usePrinterWorkflow } from "../hooks/usePrinterWorkflow";
import { useServiceStatus } from "../hooks/useServiceStatus";
import { AwsWorkflow } from "./AwsWorkflow";
import { DownloadButton } from "./DownloadButton";
import { ErrorBanner } from "./ErrorBanner";
import { JobProgress } from "./JobProgress";
import { PrintJobForm } from "./PrintJobForm";
import { ServiceStatus } from "./ServiceStatus";

export function PrinterDashboard() {
  const service = useServiceStatus();
  const workflow = usePrinterWorkflow();

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">AWS PDF PRINTER</p>
        <h1>Print plain text to PDF.</h1>
        <p className="lede">
          Submit a job and watch the AWS pipeline process it in the background.
        </p>
      </section>

      <ServiceStatus state={service.state} error={service.error} />
      <PrintJobForm
        onSubmit={workflow.submit}
        onTextChange={workflow.setText}
        disabled={workflow.submitting || ["SENDING", "PENDING", "PROCESSING"].includes(workflow.jobState)}
        submitting={workflow.submitting}
        text={workflow.text}
      />

      <section className="job-card" aria-labelledby="job-progress-heading">
        <div className="section-heading">
          <h2 id="job-progress-heading">Job progress</h2>
          {workflow.jobState !== "NONE" && (
            <span className="job-state">{workflow.jobState}</span>
          )}
        </div>
        <JobProgress state={workflow.jobState} />
        <AwsWorkflow state={workflow.jobState} />
        <ErrorBanner message={workflow.jobError} />
        <DownloadButton disabled={workflow.jobState !== "COMPLETED"} />
      </section>

      <a
        className="github-link"
        href="https://github.com/Dkazarian/aws-printer-sim/tree/master"
        rel="noreferrer"
        target="_blank"
      >
        View source on GitHub
      </a>
    </main>
  );
}
