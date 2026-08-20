import { afterEach, describe, expect, it, vi } from "vitest";
import {
  normalizeJobStatusResponse,
  normalizePrintJobResponse,
  normalizeServiceStatus,
  PrinterApiError,
  requestPrinterApiJson,
} from "../lib/printerApiServer";

const originalApiBaseUrl = process.env.API_BASE_URL;
const originalApiKey = process.env.API_KEY;

afterEach(() => {
  vi.restoreAllMocks();
  if (originalApiBaseUrl === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = originalApiBaseUrl;
  if (originalApiKey === undefined) delete process.env.API_KEY;
  else process.env.API_KEY = originalApiKey;
});

describe("server printer API boundary", () => {
  it("forwards the API key, disables caching, and reads the upstream JSON", async () => {
    process.env.API_BASE_URL = "https://printer.example.test/";
    process.env.API_KEY = "secret-key";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "ONLINE" }), { status: 200 }),
    );

    const payload = await requestPrinterApiJson("/status");

    expect(payload).toEqual({ message: "ONLINE" });
    expect(fetchMock).toHaveBeenCalledWith("https://printer.example.test/status", expect.anything());
    const [, requestInit] = fetchMock.mock.calls[0];
    expect(requestInit?.cache).toBe("no-store");
    expect((requestInit?.headers as Headers).get("x-api-key")).toBe("secret-key");
  });

  it("normalizes backend job fields into frontend fields", () => {
    expect(normalizePrintJobResponse({ job_id: "job-1", status: "PENDING" })).toEqual({
      jobId: "job-1",
      status: "PENDING",
    });
    expect(normalizeJobStatusResponse({ job_id: "job-1", status: "PROCESSING" })).toEqual({
      jobId: "job-1",
      status: "PROCESSING",
    });
  });

  it("rejects malformed upstream payloads", () => {
    expect(() => normalizeServiceStatus({ message: "OFFLINE" })).toThrowError(PrinterApiError);
    expect(() => normalizePrintJobResponse({ job_id: 123, status: "PENDING" })).toThrowError(
      PrinterApiError,
    );
    expect(() => normalizeJobStatusResponse({ job_id: "job-1", status: "UNKNOWN" })).toThrowError(
      PrinterApiError,
    );
  });

  it("exposes rate-limit status and Retry-After without leaking upstream details", async () => {
    process.env.API_BASE_URL = "https://printer.example.test";
    process.env.API_KEY = "secret-key";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "internal quota detail" }), {
        status: 429,
        headers: { "Retry-After": "10" },
      }),
    );

    const request = requestPrinterApiJson("/jobs/job-1");

    await expect(request).rejects.toMatchObject({
      code: "RATE_LIMITED",
      status: 429,
      retryAfterSeconds: 10,
      message: "The printer service is temporarily busy. Please try again shortly.",
    });
  });

  it("converts network failures into a safe typed error", async () => {
    process.env.API_BASE_URL = "https://printer.example.test";
    process.env.API_KEY = "secret-key";
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("socket details"));

    await expect(requestPrinterApiJson("/status")).rejects.toMatchObject({
      code: "NETWORK_ERROR",
      status: 502,
      message: "Unable to reach the printer service.",
    });
  });
});
