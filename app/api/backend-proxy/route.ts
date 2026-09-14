import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const endpoint = req.nextUrl.searchParams.get("path") || "/api/chat/message";
    if (!endpoint.startsWith("/api/")) {
      return NextResponse.json({ detail: "Invalid backend API path." }, { status: 400 });
    }

    const backendRes = await fetch(`${BACKEND_API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000), // 30s timeout
    });

    if (!backendRes.ok) {
      return new NextResponse(`Upstream returned ${backendRes.status}`, { status: backendRes.status });
    }

    const contentType = backendRes.headers.get("content-type") || "";

    // Pass SSE directly through as a stream to bypass client buffering/DOM parsing issues
    if (contentType.includes("text/event-stream") && backendRes.body) {
      return new NextResponse(backendRes.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
        },
      });
    }

    // Standard JSON responses (e.g. search, health)
    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err?.message || "Failed to communicate with local backend gateway" },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const endpoint = req.nextUrl.searchParams.get("path") || "/api/health";
    if (!endpoint.startsWith("/api/")) {
      return NextResponse.json({ detail: "Invalid backend API path." }, { status: 400 });
    }
    const backendRes = await fetch(`${BACKEND_API_URL}${endpoint}`, {
      method: "GET",
      signal: AbortSignal.timeout(30000),
    });
    if (!backendRes.ok) {
      return new NextResponse(`Upstream returned ${backendRes.status}`, { status: backendRes.status });
    }
    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      headers: {
        "Content-Type": backendRes.headers.get("content-type") || "application/octet-stream",
        "Content-Disposition": backendRes.headers.get("content-disposition") || "attachment",
      },
    });
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : "Failed to communicate with local backend gateway";
    return NextResponse.json({ detail }, { status: 502 });
  }
}
