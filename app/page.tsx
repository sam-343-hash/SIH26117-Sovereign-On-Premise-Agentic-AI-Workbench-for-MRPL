"use client";
import React, { useState } from "react";
import Sidebar from "@/components/sidebar";

export default function WorkspacePage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; text: string; citations?: string[] }>>([
    {
      role: "assistant",
      text: "RefinaAI Sovereign Refinery Assistant active. All queries grounded against on-premise OISD and refinery standard operating procedures.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query.trim();
    setQuery("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/rag/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ query: userText, limit: 3 }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        throw new Error(`Server returned non-JSON response (${res.status}): ${rawText.slice(0, 100)}`);
      }

      if (!res.ok) {
        throw new Error(data.detail || `Server error: HTTP ${res.status}`);
      }

      let responseText = "No relevant context found in local refinery documents.";
      let citations: string[] = [];

      if (data.answer) {
        responseText = data.answer;
      } else if (Array.isArray(data.matches) && data.matches.length > 0) {
        responseText = data.matches.map((m: any) => m.text || m.content).join("\n\n");
        citations = data.matches.map((m: any) => `${m.filename || 'SOP-MRPL'} (p. ${m.page || 1})`);
      } else if (typeof data === "string") {
        responseText = data;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: responseText, citations: citations },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Backend Error: ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full bg-[#0d1322]/80 backdrop-blur-md">
        <header className="px-8 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">RefinaAI Workspace</h1>
            <p className="text-xs text-slate-400">Air-gapped on-premise execution (127.0.0.1:8000)</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-emerald-400 font-mono">SOVEREIGN CORE ONLINE</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-2xl px-5 py-3.5 rounded-xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-amber-600/90 text-white font-medium shadow-md shadow-amber-900/20"
                    : "bg-slate-900/90 border border-slate-800 text-slate-200 shadow-lg"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap gap-1.5">
                    {m.citations.map((c, ci) => (
                      <span
                        key={ci}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40"
                      >
                        📄 {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              Consulting local ChromaDB & Qwen 2.5...
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-6 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about a procedure, operating limit, or safety envelope..."
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors shadow-md"
            >
              {loading ? "Searching..." : "Query"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
