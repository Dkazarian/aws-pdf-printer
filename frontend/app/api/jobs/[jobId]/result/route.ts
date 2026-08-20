import { NextResponse } from "next/server";
import { PrinterApiError, requestPrinterApiResponse } from "../../../../../lib/printerApiServer";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { jobId: string } }) {
  if (!params.jobId) return NextResponse.json({ error: "Missing jobId" }, { status: 400 });

  try {
    const upstream = await requestPrinterApiResponse(`/jobs/${encodeURIComponent(params.jobId)}/result`);
    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.includes("application/pdf")) {
      return NextResponse.json({ error: "The printer service returned an invalid PDF response." }, { status: 502 });
    }

    const headers = new Headers({ "content-type": "application/pdf" });
    const disposition = upstream.headers.get("content-disposition");
    if (disposition) headers.set("content-disposition", disposition);
    return new Response(upstream.body, { status: 200, headers });
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
