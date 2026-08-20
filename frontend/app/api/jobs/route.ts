import { NextResponse } from "next/server";
import {
  normalizePrintJobResponse,
  PrinterApiError,
  requestPrinterApiJson,
} from "../../../lib/printerApiServer";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!isValidCreateJobBody(body)) {
    return NextResponse.json(
      { error: '"text" must be a non-empty string of no more than 500 characters' },
      { status: 400 },
    );
  }

  try {
    const payload = await requestPrinterApiJson("/jobs", {
      method: "POST",
      body: JSON.stringify({ text: body.text }),
    });
    return NextResponse.json(normalizePrintJobResponse(payload), { status: 201 });
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}

function isValidCreateJobBody(value: unknown): value is { text: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "text" in value &&
    typeof value.text === "string" &&
    Boolean(value.text.trim()) &&
    value.text.length <= 500
  );
}

function apiErrorResponse(error: unknown) {
  if (error instanceof PrinterApiError) {
    const headers = error.retryAfterSeconds !== undefined
      ? { "retry-after": String(error.retryAfterSeconds) }
      : undefined;
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status, headers });
  }

  return NextResponse.json({ error: "Unable to reach the printer service." }, { status: 502 });
}
