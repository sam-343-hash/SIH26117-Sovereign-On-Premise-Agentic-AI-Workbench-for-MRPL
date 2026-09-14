"use client";
import React, { useState } from "react";

export default function ReportsPage() {
  const [message, setMessage] = useState<string | null>(null);
  // Navigating to FastAPI is more reliable than proxying binary PDF content
  // through Next.js on Windows Chrome.
  const reportUrl = (inline = false) =>
    `http://127.0.0.1:8000/api/reports/download${inline ? "?inline=true" : ""}`;

  const handleDownload = () => {
    setMessage("Opening the live local PDF in this tab. Use the browser Back button to return to reports.");
    // Same-tab navigation cannot be blocked as a popup by Chrome or the
    // Codex in-app browser.
    window.location.assign(reportUrl(true));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto text-slate-100">
      <div className="mb-6 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white">Compliance & Audit Reports</h1>
        <p className="text-sm text-slate-400 mt-1">
          Automated in-memory PDF compliance audit generator backed by ReportLab.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white mb-2">Executive Safety & OISD Audit Summary</h2>
        <p className="text-sm text-slate-400 mb-6">
          Generates a verified, tamper-evident regulatory report compiling all flagged pressure limits,
          unverified operational procedures, and vector retrieval stats for statutory inspectors.
        </p>

        <button
          onClick={handleDownload}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow transition-colors flex items-center gap-2"
        >
          Open Live PDF Report
        </button>
        <a
          href={reportUrl(false)}
          className="ml-3 px-5 py-2.5 border border-slate-600 hover:border-slate-400 text-slate-200 font-medium rounded-lg transition-colors"
        >
          Download PDF File
        </a>
        {message && <p className="mt-3 text-sm text-slate-400">{message}</p>}
      </div>
    </div>
  );
}
