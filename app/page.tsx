"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  kpis,
  ingestTrend,
  riskBreakdown,
  pipelineStages,
  recentActivity,
} from "@/lib/mock-data";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function DashboardPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* KPI row */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="relative overflow-hidden">
            <CardContent className="p-5">
              <p className="text-xs text-slate-400">{k.label}</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="font-display text-2xl font-semibold text-white">{k.value}</p>
                <span
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    k.trend === "up" ? "text-alert-green" : "text-flux-light"
                  }`}
                >
                  {k.trend === "up" ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {k.delta}
                </span>
              </div>
            </CardContent>
            <div className="pipe-rule absolute bottom-0 left-0 right-0" />
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Ingest / query trend */}
        <motion.div variants={item} className="xl:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Ingestion &amp; Query Volume</CardTitle>
              <CardDescription>Documents processed vs. queries answered, last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="h-72 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ingestTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="docsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e0883f" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#e0883f" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="queriesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3fd8c4" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#3fd8c4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#5b6478" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#5b6478" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(14,19,27,0.95)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="queries" stroke="#3fd8c4" fill="url(#queriesGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="docs" stroke="#e0883f" fill="url(#docsGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk breakdown */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Compliance Risk Split</CardTitle>
              <CardDescription>Across all indexed documents</CardDescription>
            </CardHeader>
            <CardContent className="flex h-72 flex-col items-center justify-center pt-2">
              <ResponsiveContainer width="100%" height="70%">
                <PieChart>
                  <Pie
                    data={riskBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {riskBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(14,19,27,0.95)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4">
                {riskBreakdown.map((r) => (
                  <div key={r.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
                    {r.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Pipeline status - refinery motif */}
        <motion.div variants={item} className="xl:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Refinement Pipeline</CardTitle>
              <CardDescription>Live document processing stages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {pipelineStages.map((s, i) => (
                <div key={s.stage} className="flex items-center gap-3">
                  {s.status === "complete" && <CheckCircle2 className="h-[18px] w-[18px] text-alert-green" />}
                  {s.status === "active" && <Loader2 className="h-[18px] w-[18px] animate-spin text-flux" />}
                  {s.status === "pending" && <Circle className="h-[18px] w-[18px] text-slate-600" />}
                  <span
                    className={`text-sm ${
                      s.status === "pending" ? "text-slate-500" : "text-slate-200"
                    }`}
                  >
                    {s.stage}
                  </span>
                  {i < pipelineStages.length - 1 && (
                    <div className="ml-auto h-px flex-1 max-w-[40px] bg-white/10" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent activity */}
        <motion.div variants={item} className="xl:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Across all workspaces</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 pt-2">
              {recentActivity.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg px-2 py-2.5 text-sm hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-medium text-slate-200">{a.actor}</span>
                    <span className="text-slate-500">{a.action}</span>
                    <span className="truncate text-slate-400">{a.target}</span>
                  </div>
                  <span className="ml-3 shrink-0 text-xs text-slate-600">{a.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
