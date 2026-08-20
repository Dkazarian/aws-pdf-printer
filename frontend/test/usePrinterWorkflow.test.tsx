import React from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePrinterWorkflow } from "../hooks/usePrinterWorkflow";
import { getJobStatus, PrinterRequestError, submitJob } from "../lib/printerApi";

vi.mock("../lib/printerApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/printerApi")>();
  return {
    ...actual,
    getJobStatus: vi.fn(),
    getJobResult: vi.fn(),
    submitJob: vi.fn(),
  };
});

const mockedGetJobStatus = vi.mocked(getJobStatus);
const mockedSubmitJob = vi.mocked(submitJob);

describe("usePrinterWorkflow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockedSubmitJob.mockResolvedValue({ jobId: "job-1", status: "PENDING" });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("advances a job through polling", async () => {
    mockedGetJobStatus
      .mockResolvedValueOnce({ jobId: "job-1", status: "PROCESSING" })
      .mockResolvedValueOnce({ jobId: "job-1", status: "COMPLETED" });

    const { result } = renderHook(() => usePrinterWorkflow());

    act(() => result.current.setText("Hello AWS"));
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.jobState).toBe("PENDING");

    await act(async () => {
      vi.advanceTimersByTime(4999);
    });
    expect(result.current.jobState).toBe("PENDING");

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.jobState).toBe("PROCESSING");

    await act(async () => {
      vi.advanceTimersByTime(10000);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.jobState).toBe("COMPLETED");
    expect(mockedGetJobStatus).toHaveBeenCalledTimes(2);
  });

  it("silently backs off when a status poll is rate limited", async () => {
    mockedGetJobStatus
      .mockRejectedValueOnce(
        new PrinterRequestError("busy", { code: "RATE_LIMITED", retryAfterSeconds: 20 }),
      )
      .mockResolvedValueOnce({ jobId: "job-1", status: "COMPLETED" });

    const { result } = renderHook(() => usePrinterWorkflow());
    act(() => result.current.setText("Hello AWS"));
    await act(async () => {
      await result.current.submit();
    });

    await act(async () => {
      vi.advanceTimersByTime(5000);
      await Promise.resolve();
    });
    expect(result.current.jobError).toBeNull();
    expect(result.current.jobState).toBe("PENDING");

    await act(async () => {
      vi.advanceTimersByTime(19999);
    });
    expect(mockedGetJobStatus).toHaveBeenCalledOnce();

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.jobState).toBe("COMPLETED");
  });

  it("shows validation errors and stops after a failed poll", async () => {
    mockedGetJobStatus.mockResolvedValue({
      jobId: "job-1",
      status: "FAILED",
      error: "Worker failed.",
    });

    const { result } = renderHook(() => usePrinterWorkflow());

    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.jobError).toBe("Enter some text before submitting.");

    act(() => result.current.setText("[fail]"));
    await act(async () => {
      await result.current.submit();
    });

    await act(async () => {
      vi.advanceTimersByTime(5000);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.jobError).toBe("Worker failed.");
    const callsAfterFailure = mockedGetJobStatus.mock.calls.length;

    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(mockedGetJobStatus).toHaveBeenCalledTimes(callsAfterFailure);
  });
});
