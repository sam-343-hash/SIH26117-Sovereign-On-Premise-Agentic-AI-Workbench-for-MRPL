# RefinaAI local support

Run `SETUP_SIH.bat` once, then `START_SIH.bat`. The local UI is `http://localhost:3000`; FastAPI is `http://127.0.0.1:8000`; docs are `/docs`.

Required Ollama models: `qwen2.5:latest` and `nomic-embed-text:latest`. Run `VERIFY_SIH.bat` for checks, `STOP_SIH.bat` to stop project-owned processes, and `DOCTOR_SIH.bat` for a redacted diagnostic JSON file under `runtime/diagnostics`.

Expected API routes: `/api/health`, `/api/chat/message`, `/api/documents`, `/api/documents/upload`, `/api/rag/search`, `/api/safety/flags`, `/api/graph`, `/api/reports/download`, `/api/admin/status`.

If Windows reports a DLL/path-length issue, move the extracted project to a short path such as `C:\SIH`. Never share `.env` files or access tokens.
