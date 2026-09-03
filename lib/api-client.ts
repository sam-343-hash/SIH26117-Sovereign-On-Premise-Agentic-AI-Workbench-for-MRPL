const BACKEND_BASE = "http://127.0.0.1:8000";

export async function askQuery(query: string) {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/rag/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: query, limit: 3 }),
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    throw new Error(err?.message || "Failed to reach backend");
  }
}
