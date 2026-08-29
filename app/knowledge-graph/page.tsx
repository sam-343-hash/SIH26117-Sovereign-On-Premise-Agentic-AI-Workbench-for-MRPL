'use client';
import React, { useEffect, useState } from 'react';
import { fetchGraphData } from '@/lib/api';

export default function KnowledgeGraphPage() {
  const [graph, setGraph] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });

  useEffect(() => {
    fetchGraphData()
      .then((data) => {
        if (data.nodes && data.nodes.length > 0) setGraph(data);
        else throw new Error();
      })
      .catch(() => {
        setGraph({
          nodes: [
            { id: 'CDU_01', label: 'Crude Distillation Unit (CDU-01)', category: 'EQUIPMENT' },
            { id: 'HEATER_101', label: 'Fired Heater H-101', category: 'EQUIPMENT' },
            { id: 'CRUDE_OIL', label: 'Heavy Arab Crude', category: 'CHEMICAL' },
            { id: 'OISD_106', label: 'OISD-106 Standard', category: 'SAFETY_RULE' },
          ],
          edges: [
            { source: 'HEATER_101', target: 'CDU_01', relation: 'PREHEATS_FEED_FOR' },
            { source: 'CDU_01', target: 'CRUDE_OIL', relation: 'PROCESSES' },
            { source: 'CDU_01', target: 'OISD_106', relation: 'GOVERNED_BY' },
          ]
        });
      });
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto text-slate-100">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-[#3fd8c4]">Knowledge Graph & Entity Linker</span>
        </h1>
        <p className="text-sm text-slate-400">Extracted operational relationships between equipment, chemicals, and industrial safety codes.</p>
      </div>

      <div className="bg-[#05070a] border border-slate-800 p-6 rounded-2xl space-y-6">
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#e0883f]"></span> Equipment</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#3fd8c4]"></span> Chemical</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-red-400"></span> Safety Rule</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <h2 className="text-xs uppercase font-bold text-slate-400 mb-3 tracking-wider">Indexed Entities (Nodes)</h2>
            <div className="space-y-2">
              {graph.nodes.map((node) => (
                <div key={node.id} className="flex items-center justify-between bg-[#05070a] p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="font-semibold text-slate-200">{node.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                    node.category === 'EQUIPMENT' ? 'bg-[#e0883f]/20 text-[#e0883f]' :
                    node.category === 'CHEMICAL' ? 'bg-[#3fd8c4]/20 text-[#3fd8c4]' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {node.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <h2 className="text-xs uppercase font-bold text-slate-400 mb-3 tracking-wider">Operational Relationships (Edges)</h2>
            <div className="space-y-2">
              {graph.edges.map((edge, idx) => (
                <div key={idx} className="bg-[#05070a] p-3 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
                  <span className="font-mono text-[#e0883f]">{edge.source}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    ── {edge.relation} ──►
                  </span>
                  <span className="font-mono text-[#3fd8c4]">{edge.target}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
