import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const endpoint = req.nextUrl.searchParams.get("path") || "/api/rag/search";
    const backendRes = await fetch(`http://127.0.0.1:8000${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Gateway error" }, { status: 502 });
  }
}
