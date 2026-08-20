import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/$/, "");
  const apiKey = process.env.API_KEY;

  if (!apiBaseUrl || !apiKey) {
    return NextResponse.json({ error: "API_BASE_URL and API_KEY are not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(`${apiBaseUrl}/status`, {
      headers: { "x-api-key": apiKey },
      cache: "no-store",
    });
    const body = await response.json();

    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Unable to reach API Gateway" }, { status: 502 });
  }
}
