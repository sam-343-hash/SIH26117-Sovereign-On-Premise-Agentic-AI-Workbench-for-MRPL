#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend"
VENV_PYTHON="$BACKEND/.venv/bin/python"

require_command() {
  command -v "$1" >/dev/null || { echo "$1 is required. Install it, then run this script again." >&2; exit 1; }
}

require_command python3
require_command npm
require_command ollama
require_command curl

if ! curl --fail --silent http://127.0.0.1:11434/api/tags >/dev/null; then
  ollama serve >/tmp/refinaai-ollama.log 2>&1 &
  sleep 3
fi

MODELS="$(ollama list)"
for model in qwen2.5:latest nomic-embed-text:latest; do
  if ! grep -q "$model" <<<"$MODELS"; then
    echo "Missing Ollama model '$model'. Download it once with: ollama pull $model" >&2
    exit 1
  fi
done

if [[ "${1:-}" != "--skip-install" ]]; then
  [[ -d "$ROOT/node_modules" ]] || npm ci --prefix "$ROOT"
  [[ -x "$VENV_PYTHON" ]] || python3 -m venv "$BACKEND/.venv"
  "$VENV_PYTHON" -m pip install -r "$BACKEND/requirements.txt"
fi

export OLLAMA_BASE_URL="http://127.0.0.1:11434"
export CHAT_MODEL="qwen2.5:latest"
export EMBED_MODEL="nomic-embed-text:latest"

cd "$BACKEND"
"$VENV_PYTHON" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
cd "$ROOT"
npm run dev &
FRONTEND_PID=$!

cleanup() { kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true; }
trap cleanup EXIT INT TERM
echo "RefinaAI is starting: http://localhost:3000"
echo "API docs: http://localhost:8000/docs"
wait "$BACKEND_PID" "$FRONTEND_PID"
