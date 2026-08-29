# RefinaAI — Enterprise Refinery Intelligence Platform
### Built for Smart India Hackathon 2026

This package contains a **working MVP**:

- **Phase 1 — complete**: full Next.js + TypeScript + Tailwind + Framer Motion UI,
  all 8 modules, running on realistic mock data. This is what you demo today.
- **Phase 2 — complete**: a real FastAPI + SQLite backend with live endpoints
  matching every screen's data shape, so wiring the frontend to it is a
  find-and-replace of mock imports with `fetch()` calls (see "Connecting
  Phase 1 → Phase 2" below).
- **Phase 3–7 — scaffolded with working stubs and exact next steps** so you
  can build them incrementally over the remaining days without re-architecting
  anything.

---

## 1. Project layout

```
refinaai/
├── app/                     # Next.js App Router pages
│   ├── layout.tsx           # Shell: sidebar + topbar + command palette
│   ├── page.tsx             # Dashboard
│   ├── chat/page.tsx        # AI Chat Workspace
│   ├── upload/page.tsx      # Document Intake (PDF upload)
│   ├── rag/page.tsx         # RAG Search
│   ├── safety/page.tsx      # Safety Agent
│   ├── knowledge-graph/page.tsx
│   ├── reports/page.tsx     # Report Generator
│   ├── admin/page.tsx       # Admin Panel
│   └── globals.css
├── components/
│   ├── sidebar.tsx / topbar.tsx / command-palette.tsx
│   └── ui/                  # button, card, badge, progress (shadcn-style, hand-adapted)
├── lib/
│   ├── mock-data.ts         # Phase 1 data source — swap for API calls in Phase 2+
│   └── utils.ts
├── backend/                 # FastAPI service (Phase 2)
│   ├── requirements.txt
│   └── app/
│       ├── main.py          # app + CORS + router registration
│       ├── database.py      # SQLite via SQLModel
│       ├── models/          # Document, SafetyFlagRow
│       ├── routers/         # chat, documents, rag, safety, reports, admin
│       └── services/        # llm_service.py, rag_service.py (stubs → Phase 3/4)
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 2. Run it locally on a MacBook Air M1

### Prerequisites (one-time)

```bash
# Node (via nvm is easiest)
brew install nvm
nvm install 20
nvm use 20

# Python
brew install python@3.11

# Ollama (runs Qwen models locally, Apple Silicon optimized)
brew install ollama
ollama serve &                      # starts the local model server
ollama pull qwen3:14b               # ~9GB — the main chat/report model
ollama pull qwen2.5-vl:7b           # vision model for scanned PDFs
ollama pull nomic-embed-text        # embedding model for RAG
```

> M1 8GB RAM tip: if `qwen3:14b` is too heavy, use `ollama pull qwen3:8b`
> and update `chatModel` in `lib/mock-data.ts` / `backend/app/routers/admin.py`.

### Frontend

```bash
cd refinaai
npm install
npm run dev
# → http://localhost:3000
```

### Backend

```bash
cd refinaai/backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000/docs   (interactive Swagger UI)
```

Run both `npm run dev` and `uvicorn` in separate terminal tabs. The frontend
runs standalone on mock data even with the backend off — useful for pure UI
demo polishing.

---

## 3. Connecting Phase 1 → Phase 2 (do this once both run cleanly)

Each page currently imports static arrays from `lib/mock-data.ts`. Replace
those imports with a fetch to the matching backend route:

| Screen | Mock import | Replace with |
|---|---|---|
| Upload | `documents` | `GET http://localhost:8000/api/documents/` |
| Upload dropzone | — | `POST http://localhost:8000/api/documents/upload` (multipart) |
| RAG Search | `ragResults` | `GET http://localhost:8000/api/rag/search?q=...` |
| Chat | mock `setTimeout` | `POST http://localhost:8000/api/chat/message` |
| Safety Agent | `safetyFlags` | `GET http://localhost:8000/api/safety/flags` |
| Reports | mock timer | `POST http://localhost:8000/api/reports/generate` |
| Admin | `modelConfig`, `systemHealth` | `GET /api/admin/config`, `GET /api/admin/health` |

Add a `lib/api.ts` with `NEXT_PUBLIC_API_URL=http://localhost:8000` and use
`fetch` or SWR — the JSON shapes returned by the backend routes already
match the TypeScript types in `mock-data.ts`, so component code barely changes.

---

## 4. Day-by-day plan for the remaining hackathon time

**Day 1 (today) — Phase 1 + 2, done.** Polish the demo script: Dashboard →
Upload a real PDF → Chat asks a grounded question → Safety Agent shows a
flag → Knowledge Graph shows the same incident linked → Report Generator
produces a summary. That loop *is* your demo.

**Day 2 — Phase 3: real chat.** In `backend/app/services/llm_service.py`,
replace the stub with the real `ollama.chat(...)` call shown in the
docstring. Test with `curl -X POST localhost:8000/api/chat/message -d '{"message":"..."}'`.
Wire the frontend chat composer to this endpoint (remove the `setTimeout`).

**Day 3 — Phase 4: PDF upload + RAG.**
```bash
pip install pypdf python-docx chromadb
```
In `documents.py`'s upload handler, after saving the file: extract text
(`pypdf.PdfReader` for PDFs, `python-docx` for DOCX), chunk it (~500 tokens,
100 overlap), embed each chunk via Ollama's `nomic-embed-text`, and
`collection.add(...)` into a persistent ChromaDB client. Flip
`doc.status = "Indexed"`. Replace `rag_service.search` with the real
ChromaDB query shown in its docstring.

**Day 4 — Phase 5: Safety Agent as a real agent.** Turn the safety scan into
a LangChain pipeline: after each document is indexed, run a prompt that
asks Qwen3 to compare new content against a rule set (pressure thresholds,
sign-off policy, PPE requirements) and insert a `SafetyFlagRow` when it
finds a mismatch. This is your most "agentic" and highest-scoring feature —
budget real time here.

**Day 5 — Phase 6: Knowledge Graph.** Start with SQLite-derived
relationships (already the pattern in `mock-data.ts`'s `graphNodes`/`graphEdges`)
extracted via a Qwen3 entity/relation extraction prompt over each document's
chunks. Only reach for Neo4j (`brew install neo4j`) if time allows — the
SVG graph component in `knowledge-graph/page.tsx` doesn't care where the
edges come from, so you can ship the SQLite version and call it done.

**Day 7 — Phase 7: reports + polish.** Wire `reports/generate` to pull
recent safety flags + RAG hits into a Qwen3 prompt that drafts a structured
report; render to PDF with `weasyprint` or the markdown skill. Then: run
Lighthouse, fix any layout shift, rehearse the demo script twice, record a
backup video in case the venue Wi-Fi/local model is slow.

---

## 5. Design notes (why it looks the way it does)

- **Palette**: near-black abyss background (`#05070a`), copper (`#e0883f`)
  for "refinery" material warmth, teal flux (`#3fd8c4`) for the "AI signal"
  — deliberately not the generic AI-cream/terracotta or acid-green defaults.
- **Signature motif**: the animated `pipe-rule` gradient line (used under
  KPI cards, in the sidebar, as chart dividers) — a literal refinery
  pipeline flow, tying the visual language to "Refina" in the product name.
- **Typography**: Sora (display) + Inter (body) + JetBrains Mono (data/model
  strings) — an enterprise-technical pairing distinct from generic sans stacks.
- All glass panels use `.glass` / `.glass-strong` utility classes in
  `globals.css` — one place to tune blur/opacity for perf if needed on
  lower-end demo hardware.
