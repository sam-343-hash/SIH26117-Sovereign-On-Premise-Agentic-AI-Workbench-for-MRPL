"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FileText, Sparkles, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { reportTemplates } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const [selected, setSelected] = React.useState(reportTemplates[0].id);
  const [generating, setGenerating] = React.useState(false);
  const [done, setDone] = React.useState(false);

  function generate() {
    setGenerating(true);
    setDone(false);
    setTimeout(() => {
      setGenerating(false);
      setDone(true);
    }, 1800);
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="space-y-3 xl:col-span-2">
        {reportTemplates.map((t) => (
          <Card
            key={t.id}
            onClick={() => {
              setSelected(t.id);
              setDone(false);
            }}
            className={cn(
              "cursor-pointer transition-all",
              selected === t.id && "ring-1 ring-flux/40"
            )}
          >
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-copper/20 to-flux/20">
                <FileText className="h-5 w-5 text-flux-light" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-100">{t.name}</p>
                <p className="mt-1 text-sm text-slate-400">{t.description}</p>
                <p className="mt-2 text-xs text-slate-600">Last run: {t.lastRun}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="h-fit xl:sticky xl:top-20">
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>
            {reportTemplates.find((t) => t.id === selected)?.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-slate-500">
              Date range
            </label>
            <select className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-slate-200 outline-none focus:border-flux/40">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This quarter</option>
              <option>Custom range</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-slate-500">
              Output format
            </label>
            <div className="flex gap-2">
              {["PDF", "DOCX", "Markdown"].map((f) => (
                <button
                  key={f}
                  className="flex-1 rounded-lg border border-white/10 bg-white/[0.02] py-2 text-xs text-slate-300 hover:border-flux/40 hover:text-flux-light"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={generate} disabled={generating} className="w-full">
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Drafting with Qwen3…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate Report
              </>
            )}
          </Button>

          {done && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between rounded-lg border border-alert-green/20 bg-alert-green/5 px-3 py-2.5"
            >
              <span className="text-xs text-alert-green">Report ready — 4 pages</span>
              <button className="flex items-center gap-1 text-xs text-flux-light hover:underline">
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
