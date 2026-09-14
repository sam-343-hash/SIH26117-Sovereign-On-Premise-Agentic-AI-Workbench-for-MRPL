'use client';
import React, { useEffect, useState } from 'react';
import { fetchSafetyFlags } from '@/lib/api';

export default function SafetyPage() {
  const [flags, setFlags] = useState<any[]>([]);

  useEffect(() => {
    fetchSafetyFlags()
      .then((data) => setFlags(data))
      .catch(() => {
        setFlags([
          {
            id: 1,
            rule_id: 'OISD-106',
            parameter: 'Distillation Column Overhead Pressure',
            observed_value: '3.85 bar',
            standard_limit: '3.50 bar',
            severity: 'CRITICAL',
            recommendation: 'Throttle feed pre-heater control valve and verify safety relief valve calibration immediately.',
            page_number: 1,
            created_at: new Date().toISOString(),
          }
        ]);
      });
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-[#e0883f]">Safety Scan & Compliance Agent</span>
          </h1>
          <p className="text-sm text-slate-400">Automated compliance audit checking all ingested procedures against OSHA and OISD standards.</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-1.5 rounded-lg font-mono">
          🚨 {flags.filter(f => f.severity === 'CRITICAL').length} Critical Risk Flagged
        </div>
      </div>

      <div className="grid gap-4">
        {flags.map((flag) => (
          <div key={flag.id} className="bg-[#05070a] border border-red-900/40 p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="bg-red-500 text-black text-[11px] font-bold px-2 py-0.5 rounded">
                  {flag.severity}
                </span>
                <span className="font-mono text-xs text-[#3fd8c4] font-semibold">{flag.rule_id}</span>
                <span className="text-slate-400 text-xs">| Page {flag.page_number}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{new Date(flag.created_at).toLocaleTimeString()}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Parameter</span>
                <span className="font-semibold text-slate-200">{flag.parameter}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Observed in Document</span>
                <span className="font-semibold text-red-400 font-mono">{flag.observed_value}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Mandatory Limit</span>
                <span className="font-semibold text-emerald-400 font-mono">{flag.standard_limit}</span>
              </div>
            </div>

            <div className="text-xs bg-[#e0883f]/10 border border-[#e0883f]/30 p-3 rounded-lg text-slate-200">
              <strong className="text-[#e0883f]">Corrective Action: </strong>
              {flag.recommendation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
