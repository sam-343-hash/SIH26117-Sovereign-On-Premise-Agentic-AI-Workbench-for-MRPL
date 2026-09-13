param([switch]$SkipInstall)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$backend = Join-Path $root "backend"
$venvPython = Join-Path $backend ".venv\Scripts\python.exe"

function Require-Command([string]$Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "$Name is required. Install it, then run this script again."
    }
}

Require-Command python
Require-Command npm
Require-Command ollama

try {
    Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 3 | Out-Null
} catch {
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
}

$models = (Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 10).models.name
foreach ($requiredModel in @("qwen2.5:latest", "nomic-embed-text:latest")) {
    if ($models -notcontains $requiredModel) {
        throw "Missing Ollama model '$requiredModel'. Download it once with: ollama pull $requiredModel"
    }
}

if (-not $SkipInstall) {
    if (-not (Test-Path (Join-Path $root "node_modules"))) { npm ci --prefix $root }
    if (-not (Test-Path $venvPython)) { python -m venv (Join-Path $backend ".venv") }
    & $venvPython -m pip install -r (Join-Path $backend "requirements.txt")
} elseif (-not (Test-Path (Join-Path $root "node_modules")) -or -not (Test-Path $venvPython)) {
    throw "--SkipInstall requires existing node_modules and backend/.venv. Run without it once first."
}

$env:OLLAMA_BASE_URL = "http://127.0.0.1:11434"
$env:CHAT_MODEL = "qwen2.5:latest"
$env:EMBED_MODEL = "nomic-embed-text:latest"
$backendProcess = Start-Process -PassThru -FilePath $venvPython -WorkingDirectory $backend -ArgumentList @("-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000")
$frontendProcess = Start-Process -PassThru -FilePath "npm.cmd" -WorkingDirectory $root -ArgumentList @("run", "dev")

Write-Host "RefinaAI is starting: http://localhost:3000"
Write-Host "API docs: http://localhost:8000/docs"
Write-Host "Press Ctrl+C to stop both local processes."
try {
    Wait-Process -Id $backendProcess.Id
} finally {
    Stop-Process -Id $backendProcess.Id, $frontendProcess.Id -Force -ErrorAction SilentlyContinue
}
