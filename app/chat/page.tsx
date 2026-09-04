"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Plus, FileText, Sparkles, Paperclip } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { chatThreads, sampleConversation, type ChatMessage } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type ChatApiResponse = {
  content: string;
  citations: { label: string; page?: number | null }[];
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function ChatPage() {
  const [messages, setMessages] = React.useState<ChatMessage[]>(sampleConversation);
  const [input, setInput] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const [activeThread, setActiveThread] = React.useState("t1");
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function handleSend() {
    const question = input.trim();
    if (!question || thinking) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    try {
  const response = await fetch("/api/backend-proxy?path=/api/chat/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: question, role: "admin" }),
  });

  if (!response.ok) {
    throw new Error(`Chat API returned ${response.status}`);
  }

  if (!response.body) {
    throw new Error("Response body is null");
  }

  const assistantId = crypto.randomUUID();
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulatedContent = "";
  let extractedCitations: Array<{ label: string; page?: number }> = [];

  // Seed assistant placeholder
  setMessages((prev) => [
    ...prev,
    {
      id: assistantId,
      role: "assistant",
      content: "",
      citations: [],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  setThinking(false);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;
        try {
          const payload = JSON.parse(jsonStr);

          if (payload.citations) {
            extractedCitations = payload.citations;
          }
          if (payload.content) {
            accumulatedContent += payload.content;
          }

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content: accumulatedContent, citations: extractedCitations }
                : msg
            )
          );
        } catch {
          // Ignore partial SSE split lines across read chunks
        }
      }
    }
  }
} catch (error: any) {
  setThinking(false);
  setMessages((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `I could not reach the RefinaAI backend yet. Detail: ${error.message}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
}
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      {/* Thread list */}
      <Card className="hidden w-72 shrink-0 flex-col md:flex">
        <div className="flex items-center justify-between p-4 pb-2">
          <p className="font-display text-sm font-semibold text-slate-200">Threads</p>
          <Button size="icon" variant="ghost" className="h-7 w-7">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-2">
          {chatThreads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveThread(t.id)}
              className={cn(
                "w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                activeThread === t.id
                  ? "bg-flux/10 text-flux-light ring-1 ring-flux/20"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
              )}
            >
              <p className="truncate font-medium">{t.title}</p>
              <p className="text-xs text-slate-600">{t.updated}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Conversation */}
      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-gradient-to-br from-copper to-copper-dark text-slate-950"
                      : "glass text-slate-200"
                  )}
                >
                  {m.role === "assistant" && (
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-flux-light">
                      <Sparkles className="h-3.5 w-3.5" />
                      RefinaAI
                    </div>
                  )}
                  <p>{m.content}</p>
                  {m.citations && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.citations.map((c, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-400"
                        >
                          <FileText className="h-3 w-3" />
                          {c.label}
                          {c.page && <span className="text-slate-600">· p.{c.page}</span>}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className={cn("mt-1.5 text-[10px]", m.role === "user" ? "text-slate-900/60" : "text-slate-600")}>
                    {m.timestamp}
                  </p>
                </div>
              </motion.div>
            ))}
            {thinking && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="glass flex items-center gap-2 rounded-2xl px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-flux [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-flux [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-flux" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <div className="border-t border-white/5 p-4">
          <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-2 focus-within:border-flux/40">
            <button className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-slate-300">
              <Paperclip className="h-4 w-4" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder="Ask about a procedure, incident, or document…"
              className="max-h-32 flex-1 resize-none bg-transparent py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none"
            />
            <Button onClick={handleSend} disabled={thinking || !input.trim()} size="icon" className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-600">
            RefinaAI grounds answers in your indexed documents. Verify safety-critical guidance against source SOPs.
          </p>
        </div>
      </Card>
    </div>
  );
}
