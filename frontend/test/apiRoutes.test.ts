import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as createJob } from "../app/api/jobs/route";
import { GET as getJobStatus } from "../app/api/jobs/[jobId]/route";
import { GET as getJobResult } from "../app/api/jobs/[jobId]/result/route";
import { GET as getServiceStatus } from "../app/api/status/route";
import { PrinterApiError, requestPrinterApiJson, requestPrinterApiResponse } from "../lib/printerApiServer";

vi.mock("../lib/printerApiServer", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/printerApiServer")>();
  return {
    ...actual,
    requestPrinterApiJson: vi.fn(),
    requestPrinterApiResponse: vi.fn(),
  };
});

const mockedRequestJson = vi.mocked(requestPrinterApiJson);
const mockedRequestResponse = vi.mocked(requestPrinterApiResponse);

afterEach(() => vi.clearAllMocks());

describe("same-origin API routes", () => {
  it("rejects invalid job submissions before calling upstream", async () => {
    const response = await createJob(
      new Request("http://localhost/api/jobs", {
        method: "POST",
        body: JSON.stringify({ text: "   " }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mockedRequestJson).not.toHaveBeenCalled();
  });

  it("normalizes a successful job submission", async () => {
    mockedRequestJson.mockResolvedValueOnce({ job_id: "job-1", status: "PENDING" });

    const response = await createJob(
      new Request("http://localhost/api/jobs", {
        method: "POST",
        body: JSON.stringify({ text: "Hello AWS" }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ jobId: "job-1", status: "PENDING" });
    expect(mockedRequestJson).toHaveBeenCalledWith(
      "/jobs",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ text: "Hello AWS" }) }),
    );
  });

  it("normalizes job status and preserves a rate-limit response", async () => {
    mockedRequestJson.mockResolvedValueOnce({ job_id: "job-1", status: "PROCESSING" });
    const statusResponse = await getJobStatus(new Request("http://localhost"), { params: { jobId: "job-1" } });

    expect(statusResponse.status).toBe(200);
    await expect(statusResponse.json()).resolves.toEqual({ jobId: "job-1", status: "PROCESSING" });

    mockedRequestJson.mockRejectedValueOnce(
      new PrinterApiError("busy", { code: "RATE_LIMITED", status: 429, retryAfterSeconds: 10 }),
    );
    const limitedResponse = await getJobStatus(new Request("http://localhost"), { params: { jobId: "job-1" } });

    expect(limitedResponse.status).toBe(429);
    expect(limitedResponse.headers.get("retry-after")).toBe("10");
  });

  it("returns a PDF result with download headers", async () => {
    const pdf = "%PDF-1.3\\npdf-bytes";
    mockedRequestResponse.mockResolvedValueOnce(
      new Response(pdf, {
        status: 200,
        headers: {
          "content-type": "application/pdf",
          "content-disposition": 'attachment; filename="job-1.pdf"',
        },
      }),
    );

    const response = await getJobResult(new Request("http://localhost"), { params: { jobId: "job-1" } });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="job-1.pdf"');
    await expect(response.text()).resolves.toBe(pdf);
    expect(mockedRequestResponse).toHaveBeenCalledWith(
      "/jobs/job-1/result",
      { headers: { accept: "application/pdf" } },
    );
  });

  it("decodes a base64-encoded PDF result from API Gateway", async () => {
    const pdf = "%PDF-1.3\\nmock pdf bytes";
    mockedRequestResponse.mockResolvedValueOnce(
      new Response(Buffer.from(pdf).toString("base64"), {
        status: 200,
        headers: {
          "content-type": "application/pdf",
          "content-disposition": 'attachment; filename="job-1.pdf"',
        },
      }),
    );

    const response = await getJobResult(new Request("http://localhost"), { params: { jobId: "job-1" } });

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe(pdf);
  });

  it("returns service status from the normalized upstream response", async () => {
    mockedRequestJson.mockResolvedValueOnce({ message: "ONLINE" });

    const response = await getServiceStatus();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ message: "ONLINE" });
  });
});
