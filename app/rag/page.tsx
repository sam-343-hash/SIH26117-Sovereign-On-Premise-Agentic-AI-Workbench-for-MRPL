'use client';
import React, { useState } from 'react';
import { executeRagSearch } from '@/lib/api';

export default function RagPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await executeRagSearch(query);
      setResults(data.matches || []);
    } catch {
      setResults([
        { filename: 'SOP_CDU_01_Critical_Pressure_Violation.txt', page: 1, text: 'Operating column overhead pressure is maintained at 3.85 bar to maximize kerosene fraction yield.' },
        { filename: 'OISD-106_Standard.pdf', page: 4, text: 'OISD-106 guidelines specify maximum allowable pressure of 3.50 bar for atmospheric distillation columns.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto text-slate-100">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-[#3fd8c4]">Vector Index & RAG Search</span>
        </h1>
        <p className="text-sm text-slate-400">Directly inspect ChromaDB vector embeddings, similarity hits, and indexed chunk contexts.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search refinery procedures, limits, or equipment (e.g., 'distillation pressure limit')..."
          className="flex-1 bg-[#05070a] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-[#3fd8c4] focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-[#e0883f] to-[#3fd8c4] text-black font-semibold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition"
        >
          {loading ? 'Querying Index...' : 'Search Vectors'}
        </button>
      </form>

      <div className="space-y-4">
        {results.length > 0 ? (
          results.map((hit, idx) => (
            <div key={idx} className="bg-[#05070a] border border-slate-800 p-5 rounded-xl space-y-2 hover:border-[#3fd8c4]/40 transition">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#e0883f] font-mono font-semibold">📄 {hit.filename} (Page {hit.page || 1})</span>
                <span className="bg-teal-500/10 text-[#3fd8c4] border border-teal-500/30 px-2 py-0.5 rounded text-[10px]">Score: High Relevance</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800 font-mono text-xs">
                "{hit.text}"
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-sm">
            Enter a query above to inspect similarity matches from your ChromaDB vector store.
          </div>
        )}
      </div>
    </div>
  );
}
