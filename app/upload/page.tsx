"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileText, FileScan, File, CheckCircle2, Loader2, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DocRow } from "@/lib/mock-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type BackendDocument = {
  id: number;
  name: string;
  doc_type: DocRow["type"];
  pages: number;
  size_label: string;
  status: DocRow["status"];
  uploaded_at: string;
};

const statusMap: Record<DocRow["status"], { icon: React.ElementType; variant: any }> = {
  Indexed: { icon: CheckCircle2, variant: "success" },
  Processing: { icon: Loader2, variant: "flux" },
  Queued: { icon: Clock, variant: "warning" },
  Failed: { icon: XCircle, variant: "critical" },
};

const typeIcon: Record<DocRow["type"], React.ElementType> = {
  PDF: FileText,
  DOCX: File,
  Scan: FileScan,
};

export default function UploadPage() {
  const [dragging, setDragging] = React.useState(false);
  const [documents, setDocuments] = React.useState<DocRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadDocuments = React.useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/documents/`);
      if (!response.ok) throw new Error(`Document API returned ${response.status}`);
      const rows = (await response.json()) as BackendDocument[];
      setDocuments(rows.map(toDocRow));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not load documents";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function uploadFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (files.length === 0 || uploading) return;

    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(`${API_URL}/api/documents/upload`, {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error(`Upload failed for ${file.name}`);
      }
      await loadDocuments();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          uploadFiles(e.dataTransfer.files);
        }}
      >
        <Card
          className={`border-2 border-dashed transition-colors ${
            dragging ? "border-flux bg-flux/5" : "border-white/10"
          }`}
        >
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-copper/20 to-flux/20 ring-1 ring-white/10">
              <UploadCloud className="h-7 w-7 text-flux-light" />
            </div>
            <p className="font-display text-lg font-semibold text-white">
              Drop refinery documents to ingest
            </p>
            <p className="max-w-md text-sm text-slate-400">
              PDFs, scanned reports, and DOCX files are chunked, embedded, and indexed
              automatically. Scanned pages are read with Qwen2.5-VL.
            </p>
            <label className="mt-2 cursor-pointer rounded-lg bg-flux px-5 py-2.5 text-sm font-medium text-slate-950 shadow-glow-flux hover:bg-flux-light">
              {uploading ? "Indexing..." : "Browse files"}
              <input
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.docx"
                disabled={uploading}
                onChange={(event) => {
                  if (event.target.files) uploadFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
            <p className="text-xs text-slate-600">Supports PDF, DOCX · up to 200MB per file</p>
            {error && <p className="max-w-md text-xs text-red-300">{error}</p>}
          </CardContent>
        </Card>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
          <CardDescription>
            {loading ? "Loading documents..." : `${documents.length} documents · updated live during ingestion`}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto pt-2">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-3 font-medium">Document</th>
                <th className="pb-3 font-medium">Pages</th>
                <th className="pb-3 font-medium">Size</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => {
                const Icon = typeIcon[d.type];
                const status = statusMap[d.status];
                const StatusIcon = status.icon;
                return (
                  <tr key={d.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                        <span className="font-medium text-slate-200">{d.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-400">{d.pages}</td>
                    <td className="py-3 text-slate-400">{d.size}</td>
                    <td className="py-3">
                      <Badge variant={status.variant} className="capitalize">
                        <StatusIcon className={`h-3 w-3 ${d.status === "Processing" ? "animate-spin" : ""}`} />
                        {d.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-slate-500">{d.uploaded}</td>
                  </tr>
                );
              })}
              {!loading && documents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-slate-500">
                    No documents indexed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function toDocRow(document: BackendDocument): DocRow {
  return {
    id: String(document.id),
    name: document.name,
    type: document.doc_type,
    pages: document.pages,
    size: document.size_label,
    status: document.status,
    uploaded: formatRelativeTime(document.uploaded_at),
  };
}

function formatRelativeTime(value: string) {
  const uploaded = new Date(value);
  const diffMs = Date.now() - uploaded.getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
