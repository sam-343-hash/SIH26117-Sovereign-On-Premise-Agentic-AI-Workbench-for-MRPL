// RefinaAI — Phase 1 mock data layer.
// Every screen reads from here so swapping in real FastAPI calls later
// (Phase 2+) only means replacing these exports with fetch()/SWR calls.

export type NavKey =
  | "dashboard"
  | "chat"
  | "upload"
  | "rag"
  | "safety"
  | "graph"
  | "reports"
  | "admin";

export const navItems: { key: NavKey; label: string; href: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", href: "/", icon: "LayoutDashboard" },
  { key: "chat", label: "AI Workspace", href: "/chat", icon: "MessagesSquare" },
  { key: "upload", label: "Document Intake", href: "/upload", icon: "UploadCloud" },
  { key: "rag", label: "RAG Search", href: "/rag", icon: "Search" },
  { key: "safety", label: "Safety Agent", href: "/safety", icon: "ShieldAlert" },
  { key: "graph", label: "Knowledge Graph", href: "/knowledge-graph", icon: "Share2" },
  { key: "reports", label: "Reports", href: "/reports", icon: "FileText" },
  { key: "admin", label: "Admin Panel", href: "/admin", icon: "Settings2" },
];

// ---------- Dashboard ----------
export const kpis = [
  { label: "Documents Ingested", value: "1,284", delta: "+18.2%", trend: "up" },
  { label: "Active Queries / day", value: "3,940", delta: "+6.4%", trend: "up" },
  { label: "Safety Flags Resolved", value: "97.6%", delta: "+2.1%", trend: "up" },
  { label: "Avg. Response Latency", value: "1.4s", delta: "-0.3s", trend: "down" },
];

export const ingestTrend = [
  { day: "Mon", docs: 120, queries: 420 },
  { day: "Tue", docs: 180, queries: 512 },
  { day: "Wed", docs: 150, queries: 601 },
  { day: "Thu", docs: 220, queries: 545 },
  { day: "Fri", docs: 260, queries: 690 },
  { day: "Sat", docs: 90, queries: 310 },
  { day: "Sun", docs: 264, queries: 862 },
];

export const riskBreakdown = [
  { name: "Compliant", value: 78, color: "#3fd88a" },
  { name: "Needs Review", value: 15, color: "#f5b942" },
  { name: "Critical", value: 7, color: "#e5484d" },
];

export const pipelineStages = [
  { stage: "Ingest", status: "complete" },
  { stage: "Chunk + Embed", status: "complete" },
  { stage: "Vector Index", status: "active" },
  { stage: "Safety Scan", status: "pending" },
  { stage: "Graph Link", status: "pending" },
];

export const recentActivity = [
  { id: 1, actor: "Priya S.", action: "uploaded", target: "Refinery_Safety_Manual_v4.pdf", time: "2m ago" },
  { id: 2, actor: "Safety Agent", action: "flagged", target: "Incident Report #2291 — pressure anomaly", time: "12m ago" },
  { id: 3, actor: "Arjun M.", action: "generated report", target: "Q3 Compliance Summary", time: "34m ago" },
  { id: 4, actor: "RAG Engine", action: "indexed", target: "142 new chunks from 6 documents", time: "1h ago" },
  { id: 5, actor: "Admin", action: "updated model", target: "Qwen3-8B → Qwen3-14B (reasoning)", time: "3h ago" },
];

// ---------- Chat ----------
export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: { label: string; page?: number }[];
  timestamp: string;
};

export const chatThreads = [
  { id: "t1", title: "Pressure vessel inspection SOP", updated: "5m ago" },
  { id: "t2", title: "Q3 downtime root cause", updated: "1h ago" },
  { id: "t3", title: "Vendor contract clause review", updated: "Yesterday" },
  { id: "t4", title: "Emergency shutdown checklist", updated: "2 days ago" },
];

export const sampleConversation: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    content: "Summarize the emergency shutdown procedure for Unit 3 and flag any safety-critical steps.",
    timestamp: "10:02 AM",
  },
  {
    id: "m2",
    role: "assistant",
    content:
      "Unit 3's emergency shutdown (ESD) follows a 4-stage sequence: isolate feed valves, depressurize to flare, cut heater duty, and confirm interlock status before restart. Steps 1 and 3 are safety-critical — they require dual sign-off per SOP-114.",
    citations: [
      { label: "Unit3_ESD_Procedure.pdf", page: 4 },
      { label: "SOP-114_Signoff_Policy.pdf", page: 1 },
    ],
    timestamp: "10:02 AM",
  },
];

// ---------- Upload / Documents ----------
export type DocRow = {
  id: string;
  name: string;
  type: "PDF" | "DOCX" | "Scan";
  pages: number;
  size: string;
  status: "Indexed" | "Processing" | "Queued" | "Failed";
  uploaded: string;
};

export const documents: DocRow[] = [
  { id: "d1", name: "Refinery_Safety_Manual_v4.pdf", type: "PDF", pages: 212, size: "18.4 MB", status: "Indexed", uploaded: "2m ago" },
  { id: "d2", name: "Unit3_ESD_Procedure.pdf", type: "PDF", pages: 24, size: "3.1 MB", status: "Indexed", uploaded: "1h ago" },
  { id: "d3", name: "Vendor_Contract_2026.docx", type: "DOCX", pages: 41, size: "2.2 MB", status: "Processing", uploaded: "6m ago" },
  { id: "d4", name: "Incident_Report_2291_scan.pdf", type: "Scan", pages: 6, size: "9.7 MB", status: "Queued", uploaded: "just now" },
  { id: "d5", name: "Pipeline_Corrosion_Study.pdf", type: "PDF", pages: 88, size: "12.0 MB", status: "Indexed", uploaded: "3h ago" },
  { id: "d6", name: "Environmental_Compliance_2025.pdf", type: "PDF", pages: 64, size: "7.8 MB", status: "Failed", uploaded: "1d ago" },
];

// ---------- RAG Search ----------
export type RagResult = {
  id: string;
  doc: string;
  page: number;
  snippet: string;
  score: number;
};

export const ragResults: RagResult[] = [
  {
    id: "r1",
    doc: "Unit3_ESD_Procedure.pdf",
    page: 4,
    snippet:
      "...upon detection of over-pressure, the primary interlock isolates feed valves FV-101/102 within 2 seconds, followed by controlled depressurization to the flare header...",
    score: 0.94,
  },
  {
    id: "r2",
    doc: "Refinery_Safety_Manual_v4.pdf",
    page: 118,
    snippet:
      "...dual sign-off is mandatory for any manual override of ESD stage 1 or stage 3, logged via the digital permit-to-work system...",
    score: 0.91,
  },
  {
    id: "r3",
    doc: "Pipeline_Corrosion_Study.pdf",
    page: 33,
    snippet:
      "...localized pitting corrosion observed near weld joints correlates with H2S concentration above 40 ppm over sustained exposure windows...",
    score: 0.85,
  },
];

// ---------- Safety Agent ----------
export type SafetyFlag = {
  id: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  title: string;
  source: string;
  description: string;
  status: "Open" | "Under Review" | "Resolved";
  time: string;
};

export const safetyFlags: SafetyFlag[] = [
  {
    id: "s1",
    severity: "Critical",
    title: "Pressure anomaly exceeds ESD threshold",
    source: "Incident_Report_2291_scan.pdf",
    description: "Reported reading of 148 bar against a rated ESD trip of 140 bar — no logged interlock trip recorded.",
    status: "Open",
    time: "12m ago",
  },
  {
    id: "s2",
    severity: "High",
    title: "Missing dual sign-off on manual override",
    source: "Digital Permit-to-Work Log",
    description: "Stage 1 override on Unit 3 recorded with a single approver; SOP-114 requires two.",
    status: "Under Review",
    time: "1h ago",
  },
  {
    id: "s3",
    severity: "Medium",
    title: "Corrosion rate trending above baseline",
    source: "Pipeline_Corrosion_Study.pdf",
    description: "H2S exposure near weld joint 22-B trending 12% above 6-month baseline.",
    status: "Open",
    time: "5h ago",
  },
  {
    id: "s4",
    severity: "Low",
    title: "PPE compliance note in inspection log",
    source: "Daily Inspection Log",
    description: "Minor note on face-shield usage during sampling; no incident reported.",
    status: "Resolved",
    time: "1d ago",
  },
];

// ---------- Knowledge Graph ----------
export type GraphNode = { id: string; label: string; group: "document" | "entity" | "process" | "risk"; x: number; y: number };
export type GraphEdge = { source: string; target: string; label?: string };

export const graphNodes: GraphNode[] = [
  { id: "n1", label: "Unit 3 ESD", group: "process", x: 400, y: 220 },
  { id: "n2", label: "FV-101 Valve", group: "entity", x: 220, y: 140 },
  { id: "n3", label: "FV-102 Valve", group: "entity", x: 220, y: 300 },
  { id: "n4", label: "SOP-114", group: "document", x: 560, y: 120 },
  { id: "n5", label: "Pressure Anomaly", group: "risk", x: 560, y: 320 },
  { id: "n6", label: "Flare Header", group: "entity", x: 620, y: 220 },
  { id: "n7", label: "Incident #2291", group: "document", x: 740, y: 340 },
  { id: "n8", label: "Corrosion Study", group: "document", x: 120, y: 380 },
  { id: "n9", label: "Weld Joint 22-B", group: "entity", x: 260, y: 440 },
];

export const graphEdges: GraphEdge[] = [
  { source: "n1", target: "n2", label: "isolates" },
  { source: "n1", target: "n3", label: "isolates" },
  { source: "n1", target: "n4", label: "governed by" },
  { source: "n1", target: "n6", label: "vents to" },
  { source: "n5", target: "n1", label: "triggers" },
  { source: "n5", target: "n7", label: "logged in" },
  { source: "n8", target: "n9", label: "documents" },
  { source: "n9", target: "n5", label: "contributes to" },
];

// ---------- Reports ----------
export type ReportTemplate = {
  id: string;
  name: string;
  description: string;
  lastRun: string;
};

export const reportTemplates: ReportTemplate[] = [
  { id: "rp1", name: "Compliance Summary", description: "Rolls up safety flags, sign-offs, and SOP adherence for a date range.", lastRun: "Today" },
  { id: "rp2", name: "Incident Root-Cause Brief", description: "Structured 1-pager linking an incident to source evidence and graph context.", lastRun: "Yesterday" },
  { id: "rp3", name: "Vendor Risk Digest", description: "Summarizes contract clauses flagged for renegotiation or risk exposure.", lastRun: "3 days ago" },
  { id: "rp4", name: "Corrosion & Integrity Trend", description: "Time-series view of pipeline integrity signals across documents.", lastRun: "1 week ago" },
];

// ---------- Admin ----------
export const modelConfig = {
  chatModel: "qwen3:14b",
  visionModel: "qwen2.5-vl:7b",
  embeddingModel: "nomic-embed-text",
  vectorStore: "ChromaDB (local)",
  graphStore: "Neo4j (disabled — SQLite fallback)",
  temperature: 0.3,
};

export const users = [
  { id: "u1", name: "Priya Sharma", role: "Safety Lead", status: "Active" },
  { id: "u2", name: "Arjun Mehta", role: "Compliance Analyst", status: "Active" },
  { id: "u3", name: "Dev Verma", role: "Admin", status: "Active" },
  { id: "u4", name: "Sana Iyer", role: "Viewer", status: "Invited" },
];

export const systemHealth = [
  { name: "Ollama Runtime", status: "Healthy", detail: "qwen3:14b · 6.2GB VRAM" },
  { name: "FastAPI Backend", status: "Healthy", detail: "v0.1.0 · 8 workers" },
  { name: "ChromaDB", status: "Healthy", detail: "12,940 vectors" },
  { name: "Neo4j Graph", status: "Disabled", detail: "Enable in Phase 6" },
];
