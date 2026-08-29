const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/documents/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return res.json();
}

export async function fetchDocuments() {
  const res = await fetch(`${API_BASE}/api/documents`, { cache: 'no-store' });
  return res.json();
}

export async function fetchSafetyFlags() {
  const res = await fetch(`${API_BASE}/api/safety/flags`, { cache: 'no-store' });
  return res.json();
}

export async function fetchGraphData() {
  const res = await fetch(`${API_BASE}/api/graph`, { cache: 'no-store' });
  return res.json();
}

export async function fetchReportSummary() {
  const res = await fetch(`${API_BASE}/api/reports/summary`, { cache: 'no-store' });
  return res.json();
}

export async function executeRagSearch(query: string) {
  const res = await fetch(`${API_BASE}/api/rag/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit: 4 }),
  });
  return res.json();
}

export async function fetchAdminStatus() {
  const res = await fetch(`${API_BASE}/api/admin/status`, { cache: 'no-store' });
  return res.json();
}
