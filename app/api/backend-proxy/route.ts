import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const endpoint = req.nextUrl.searchParams.get("path") || "/api/chat/message";

    const backendRes = await fetch(`http://127.0.0.1:8000${endpoint}`, {
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