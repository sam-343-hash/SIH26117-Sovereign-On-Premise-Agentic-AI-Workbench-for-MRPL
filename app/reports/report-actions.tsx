"use client";

import { useState } from "react";

type Props = { pdfBase64: string | null };

function toBlob(base64: string) {
  const source = atob(base64);
  const bytes = new Uint8Array(source.length);
  for (let index = 0; index < source.length; index += 1) bytes[index] = source.charCodeAt(index);
  return new Blob([bytes], { type: "application/pdf" });
}

export default function ReportActions({ pdfBase64 }: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const filename = `RefinaAI_Compliance_Report_${new Date().toISOString().slice(0, 10)}.pdf`;

  function downloadReport() {
    if (!pdfBase64) {
      setStatus("The local backend was unavailable while this page loaded. Refresh this page once.");
      return;
    }
    const url = URL.createObjectURL(toBlob(pdfBase64));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("PDF downloaded. Check Chrome Downloads with Ctrl + J.");
  }

  function openReport() {
    if (!pdfBase64) {
      setStatus("The local backend was unavailable while this page loaded. Refresh this page once.");
      return;
    }
    const preview = window.open("", "_blank");
    const url = URL.createObjectURL(toBlob(pdfBase64));
    if (preview) {
      preview.location.href = url;
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      setStatus("PDF opened in a new tab.");
    } else {
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      downloadReport();
    }
  }

  return (
    <>
      <button type="button" onClick={openReport} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow transition-colors">Open Live PDF Report</button>
      <button type="button" onClick={downloadReport} className="ml-3 px-5 py-2.5 border border-slate-600 hover:border-slate-400 text-slate-200 font-medium rounded-lg transition-colors">Download PDF File</button>
      {status && <p className="mt-4 text-sm text-slate-300" role="status">{status}</p>}
    </>
  );
}
