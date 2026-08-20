"use client";

import { useCallback, useEffect, useState } from "react";
import { getMockJobStatus, submitMockJob } from "../lib/mockPrinterApi";
import type { JobState } from "../types/printer";

const POLL_INTERVAL_MS = 5000;

export function usePrinterWorkflow() {
  const [jobState, setJobState] = useState<JobState>("NONE");
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!jobId || (jobState !== "PENDING" && jobState !== "PROCESSING")) return;

    const poll = async () => {
      try {
        const result = await getMockJobStatus(jobId);

        if (result.status === "FAILED") {
          setJobError(result.error ?? "The print job failed.");
          setJobId(null);
          setJobState("PROCESSING");
          return;
        }

        setJobState(result.status);
      } catch (error: unknown) {
        setJobId(null);
        setJobError(error instanceof Error ? error.message : "Unable to read the print job.");
      }
    };

    const timer = window.setInterval(() => void poll(), POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
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
      const result = await submitMockJob(text);
      setJobId(result.jobId);
      setJobState(result.status);
    } catch (error: unknown) {
      setJobError(error instanceof Error ? error.message : "Unable to submit the print job.");
    } finally {
      setSubmitting(false);
    }
  }, [text]);

  return {
    jobState,
    jobError,
    text,
    submitting,
    setText,
    submit,
  };
}

