import ReportActions from "./report-actions";

export const dynamic = "force-dynamic";

async function getLocalPdf() {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/reports/download", { cache: "no-store" });
    const bytes = await response.arrayBuffer();
    if (!response.ok || Buffer.from(bytes).subarray(0, 4).toString("ascii") !== "%PDF") return null;
    return Buffer.from(bytes).toString("base64");
  } catch {
    return null;
  }
}

export default async function ReportsPage() {
  const pdfBase64 = await getLocalPdf();

  return (
    <div className="p-8 max-w-5xl mx-auto text-slate-100">
      <div className="mb-6 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white">Compliance &amp; Audit Reports</h1>
        <p className="text-sm text-slate-400 mt-1">Generated fully locally from the indexed documents and safety findings.</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white mb-2">Executive Safety &amp; OISD Audit Summary</h2>
        <p className="text-sm text-slate-400 mb-6">Creates a PDF from the current local document index, safety scan, and graph data.</p>
        <ReportActions pdfBase64={pdfBase64} />
      </div>
    </div>
  );
}
