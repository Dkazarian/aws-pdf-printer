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
import { LanguageSwitch, translateError, useI18n } from "./I18n";
import type { JobState } from "../types/printer";

export function PrinterDashboard() {
  const service = useServiceStatus();
  const workflow = usePrinterWorkflow();
  const { t } = useI18n();
  const stateLabels: Record<JobState, string> = {
    NONE: "",
    SENDING: t.sending,
    PENDING: t.pending,
    PROCESSING: t.processing,
    COMPLETED: t.completed,
  };

  return (
    <main className="shell">
      <LanguageSwitch />
      <section className="hero">
        <p className="eyebrow">AWS PDF PRINTER</p>
        <h1>{t.title}</h1>
        <p className="lede">{t.lede}</p>
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
          <h2 id="job-progress-heading">{t.jobProgress}</h2>
          {workflow.jobState !== "NONE" && (
            <span className="job-state">{stateLabels[workflow.jobState]}</span>
          )}
        </div>
        <JobProgress state={workflow.jobState} />
        <AwsWorkflow state={workflow.jobState} />
        <ErrorBanner message={translateError(workflow.jobError, t)} />
        <DownloadButton disabled={workflow.jobState !== "COMPLETED"} onClick={workflow.download} />
      </section>

      <a
        className="github-link"
        href="https://github.com/Dkazarian/aws-pdf-printer/tree/master"
        rel="noreferrer"
        target="_blank"
      >
        {t.viewSource}
      </a>
    </main>
  );
}
