import { NextResponse } from "next/server";
import {
  normalizeJobStatusResponse,
  PrinterApiError,
  requestPrinterApiJson,
} from "../../../../lib/printerApiServer";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { jobId: string } }) {
  if (!params.jobId) return NextResponse.json({ error: "Missing jobId" }, { status: 400 });

  try {
    const payload = await requestPrinterApiJson(`/jobs/${encodeURIComponent(params.jobId)}`);
    return NextResponse.json(normalizeJobStatusResponse(payload));
  } catch (error: unknown) {
    if (error instanceof PrinterApiError) {
      const headers = error.retryAfterSeconds !== undefined
        ? { "retry-after": String(error.retryAfterSeconds) }
        : undefined;
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status, headers });
    }

    return NextResponse.json({ error: "Unable to reach the printer service." }, { status: 502 });
  }
}
