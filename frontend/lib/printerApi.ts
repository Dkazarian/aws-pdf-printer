import type {
  JobStatusResponse,
  PrintJobResponse,
  PrinterApiErrorCode,
  ServiceStatusResponse,
} from "../types/printer";

export class PrinterRequestError extends Error {
  readonly code?: PrinterApiErrorCode;
  readonly status?: number;
  readonly retryAfterSeconds?: number;

  constructor(message: string, options: { code?: PrinterApiErrorCode; status?: number; retryAfterSeconds?: number } = {}) {
    super(message);
    this.name = "PrinterRequestError";
    this.code = options.code;
    this.status = options.status;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { ...init, cache: "no-store" });
  } catch {
    throw new PrinterRequestError("Unable to reach the printer service.", { code: "NETWORK_ERROR", status: 502 });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new PrinterRequestError("The printer service returned an invalid response.", {
      code: "INVALID_RESPONSE",
      status: 502,
    });
  }

  if (!response.ok) {
    const body = typeof payload === "object" && payload !== null ? payload : {};
    const error = "error" in body && typeof body.error === "string" ? body.error : "The printer request could not be completed.";
    const code = "code" in body && typeof body.code === "string" ? (body.code as PrinterApiErrorCode) : undefined;
    const retryAfter = response.headers.get("retry-after");
    const retryAfterSeconds = retryAfter && Number.isFinite(Number(retryAfter)) ? Number(retryAfter) : undefined;
    throw new PrinterRequestError(error, { code, status: response.status, retryAfterSeconds });
  }

  return payload as T;
}

export function getServiceStatus(): Promise<ServiceStatusResponse> {
  return requestJson<ServiceStatusResponse>("/api/status");
}

export function submitJob(text: string): Promise<PrintJobResponse> {
  return requestJson<PrintJobResponse>("/api/jobs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
}

export function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  return requestJson<JobStatusResponse>(`/api/jobs/${encodeURIComponent(jobId)}`);
}

export async function getJobResult(jobId: string): Promise<Blob> {
  let response: Response;
  try {
    response = await fetch(`/api/jobs/${encodeURIComponent(jobId)}/result`, { cache: "no-store" });
  } catch {
    throw new PrinterRequestError("Unable to reach the printer service.", { code: "NETWORK_ERROR", status: 502 });
  }

  if (!response.ok) {
    let error = "The PDF could not be downloaded.";
    try {
      const body: unknown = await response.json();
      if (typeof body === "object" && body !== null && "error" in body && typeof body.error === "string") {
        error = body.error;
      }
    } catch {
      // Keep the safe fallback message.
    }
    throw new PrinterRequestError(error, { status: response.status });
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/pdf")) {
    throw new PrinterRequestError("The printer service returned an invalid PDF response.", {
      code: "INVALID_RESPONSE",
      status: 502,
    });
  }

  return response.blob();
}
