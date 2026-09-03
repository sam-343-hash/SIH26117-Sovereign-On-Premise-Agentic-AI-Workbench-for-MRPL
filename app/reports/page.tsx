"use client";
import React, { useState } from "react";

export default function ReportsPage() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/reports/download");
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "RefinaAI_Compliance_Report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("Error connecting to backend report generator. Ensure backend is running on port 8000.");
    } finally {
      setDownloading(false);
    }
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
          disabled={downloading}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium rounded-lg shadow transition-colors flex items-center gap-2"
        >
          {downloading ? "Generating Live PDF..." : "Download Live PDF Compliance Report"}
        </button>
      </div>
    </div>
  );
}
