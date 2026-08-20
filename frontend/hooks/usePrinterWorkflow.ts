"use client";

import { useCallback, useEffect, useState } from "react";
import { getJobResult, getJobStatus, PrinterRequestError, submitJob } from "../lib/printerApi";
import type { JobState } from "../types/printer";

const PENDING_POLL_INTERVAL_MS = 5000;
const PROCESSING_POLL_INTERVAL_MS = 10000;

export function usePrinterWorkflow() {
  const [jobState, setJobState] = useState<JobState>("NONE");
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!jobId || (jobState !== "PENDING" && jobState !== "PROCESSING")) return;

    let cancelled = false;
    let timer: number | undefined;

    const poll = async () => {
      try {
        const result = await getJobStatus(jobId);

        if (cancelled) return;

        if (result.status === "FAILED") {
          setJobError(result.error ?? "The print job failed.");
          setJobId(null);
          setJobState("NONE");
          return;
        }

        setJobState(result.status);
        if (result.status === "COMPLETED") return;

        timer = window.setTimeout(
          () => void poll(),
          result.status === "PROCESSING" ? PROCESSING_POLL_INTERVAL_MS : PENDING_POLL_INTERVAL_MS,
        );
      } catch (error: unknown) {
        if (cancelled) return;

        if (error instanceof PrinterRequestError && error.code === "RATE_LIMITED") {
          timer = window.setTimeout(
            () => void poll(),
            Math.max(
              1000,
              (error.retryAfterSeconds ?? (jobState === "PROCESSING" ? PROCESSING_POLL_INTERVAL_MS / 1000 : PENDING_POLL_INTERVAL_MS / 1000)) * 1000,
            ),
          );
          return;
        }

        setJobId(null);
        setJobState("NONE");
        setJobError(error instanceof Error ? error.message : "Unable to read the print job.");
      }
    };

    timer = window.setTimeout(() => void poll(), jobState === "PROCESSING" ? PROCESSING_POLL_INTERVAL_MS : PENDING_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [jobId, jobState]);

  const submit = useCallback(async () => {
    setJobError(null);
    setJobId(null);
    setJobState("SENDING");

    if (!text.trim()) {
      setJobError("Enter some text before submitting.");
      setJobState("NONE");
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitJob(text);
      setJobId(result.jobId);
      setJobState(result.status);
    } catch (error: unknown) {
      setJobId(null);
      setJobState("NONE");
      setJobError(error instanceof Error ? error.message : "Unable to submit the print job.");
    } finally {
      setSubmitting(false);
    }
  }, [text]);

  const download = useCallback(async () => {
    if (!jobId || jobState !== "COMPLETED") return;

    try {
      const blob = await getJobResult(jobId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${jobId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error: unknown) {
      setJobError(error instanceof Error ? error.message : "The PDF could not be downloaded.");
    }
  }, [jobId, jobState]);

  return {
    jobState,
    jobError,
    text,
    submitting,
    setText,
    submit,
    download,
  };
}

