import type {
  JobStatusResponse,
  PrintJobResponse,
  PrinterApiErrorCode,
  ServiceStatusResponse,
} from "../types/printer";

type ApiRequestInit = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

type BackendServiceStatus = {
  message: unknown;
};

type BackendPrintJobResponse = {
  job_id: unknown;
  status: unknown;
};

type BackendJobStatusResponse = {
  job_id: unknown;
  status: unknown;
  error?: unknown;
};

const jobStatuses = new Set(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]);

export class PrinterApiError extends Error {
  readonly code: PrinterApiErrorCode;
  readonly status: number;
  readonly retryAfterSeconds?: number;

  constructor(
    message: string,
    options: {
      code: PrinterApiErrorCode;
      status: number;
      retryAfterSeconds?: number;
    },
  ) {
    super(message);
    this.name = "PrinterApiError";
    this.code = options.code;
    this.status = options.status;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

function getApiConfig() {
  const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/$/, "");
  const apiKey = process.env.API_KEY;

  if (!apiBaseUrl || !apiKey) {
    throw new PrinterApiError("The printer service is not configured.", {
      code: "CONFIGURATION_ERROR",
      status: 500,
    });
  }

  return { apiBaseUrl, apiKey };
}

function getRetryAfterSeconds(response: Response): number | undefined {
  const retryAfter = response.headers.get("retry-after");
  if (!retryAfter) return undefined;

  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds);

  const retryAt = Date.parse(retryAfter);
  if (Number.isNaN(retryAt)) return undefined;

  return Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
}

async function readErrorDetail(response: Response): Promise<string | undefined> {
  try {
    const body: unknown = await response.clone().json();
    if (typeof body === "object" && body !== null && "error" in body) {
      const error = body.error;
      return typeof error === "string" ? error : undefined;
    }
  } catch {
    // The upstream body is not required to be valid JSON for error handling.
  }

  return undefined;
}

async function requestPrinterApi(path: string, init: ApiRequestInit = {}): Promise<Response> {
  const { apiBaseUrl, apiKey } = getApiConfig();
  const headers = new Headers(init.headers);
  headers.set("x-api-key", apiKey);

  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new PrinterApiError("Unable to reach the printer service.", {
      code: "NETWORK_ERROR",
      status: 502,
    });
  }

  if (response.ok) return response;

  const detail = await readErrorDetail(response);
  if (response.status === 429) {
    throw new PrinterApiError("The printer service is temporarily busy. Please try again shortly.", {
      code: "RATE_LIMITED",
      status: 429,
      retryAfterSeconds: getRetryAfterSeconds(response),
    });
  }

  throw new PrinterApiError(
    response.status >= 500
      ? "The printer service is temporarily unavailable."
      : detail ?? "The printer request could not be completed.",
    {
      code: "UPSTREAM_ERROR",
      status: response.status,
    },
  );
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new PrinterApiError("The printer service returned an invalid response.", {
      code: "INVALID_RESPONSE",
      status: 502,
    });
  }
}

export async function requestPrinterApiJson(path: string, init?: ApiRequestInit): Promise<unknown> {
  return readJson(await requestPrinterApi(path, init));
}

export async function requestPrinterApiResponse(path: string, init?: ApiRequestInit): Promise<Response> {
  return requestPrinterApi(path, init);
}

export function normalizeServiceStatus(payload: unknown): ServiceStatusResponse {
  if (!isRecord(payload) || !isRecordWithMessage(payload) || payload.message !== "ONLINE") {
    throw invalidResponseError();
  }

  return { message: "ONLINE" };
}

export function normalizePrintJobResponse(payload: unknown): PrintJobResponse {
  if (
    !isRecord(payload) ||
    typeof payload.job_id !== "string" ||
    payload.status !== "PENDING"
  ) {
    throw invalidResponseError();
  }

  return { jobId: payload.job_id, status: "PENDING" };
}

export function normalizeJobStatusResponse(payload: unknown): JobStatusResponse {
  if (
    !isRecord(payload) ||
    typeof payload.job_id !== "string" ||
    typeof payload.status !== "string" ||
    !jobStatuses.has(payload.status)
  ) {
    throw invalidResponseError();
  }

  return {
    jobId: payload.job_id,
    status: payload.status as JobStatusResponse["status"],
    ...(typeof payload.error === "string" ? { error: payload.error } : {}),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRecordWithMessage(value: Record<string, unknown>): value is BackendServiceStatus {
  return "message" in value;
}

function invalidResponseError() {
  return new PrinterApiError("The printer service returned an invalid response.", {
    code: "INVALID_RESPONSE",
    status: 502,
  });
}

// Keep the backend shapes explicit at this boundary so accidental response changes fail validation.
export type { BackendJobStatusResponse, BackendPrintJobResponse, BackendServiceStatus };
