import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

// A fixed, same-origin PDF route. This avoids Chrome treating a link from
// localhost:3000 to 127.0.0.1:8000 as a separate download source.
export async function GET(request: NextRequest) {
  try {
    const inline = request.nextUrl.searchParams.get("inline") === "true";
    const response = await fetch(
      `${BACKEND_API_URL}/api/reports/download${inline ? "?inline=true" : ""}`,
      { cache: "no-store", signal: AbortSignal.timeout(30000) }
    );

    if (!response.ok) {
      return NextResponse.json({ detail: "Local report generator is unavailable." }, { status: response.status });
    }

    const pdf = await response.arrayBuffer();
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(pdf.byteLength),
        "Content-Disposition": response.headers.get("content-disposition") || "attachment; filename=RefinaAI_Compliance_Report.pdf",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json({ detail: "Cannot reach the local backend on port 8000." }, { status: 502 });
  }
}
