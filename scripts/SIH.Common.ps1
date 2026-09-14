$ErrorActionPreference = 'Stop'
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$BackendRoot = Join-Path $ProjectRoot 'backend'
$VenvPython = Join-Path $BackendRoot 'venv\Scripts\python.exe'
$RuntimeRoot = Join-Path $ProjectRoot 'runtime'
$LogRoot = Join-Path $RuntimeRoot 'logs'
$NextRuntimeCache = Join-Path $RuntimeRoot 'next-cache-v2'
$PidFile = Join-Path $RuntimeRoot 'processes.json'

function Write-Ok([string]$Message) { Write-Host "[OK] $Message" -ForegroundColor Green }
function Write-Info([string]$Message) { Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Fail([string]$Message) { Write-Host "[ERROR] $Message" -ForegroundColor Red }
function Test-Command([string]$Name) { return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue) }
function Test-ListeningPort([int]$Port) {
  return $null -ne (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1)
}
function Test-Http([string]$Url) {
  try { Invoke-WebRequest -Uri $Url -TimeoutSec 3 -UseBasicParsing | Out-Null; return $true } catch { return $false }
}
function Get-PythonCommand {
  if (Test-Command 'py') { return @('py', '-3.11') }
  if (Test-Command 'python') { return @('python') }
  throw 'Python 3.11 or newer is required. Install it from https://www.python.org/downloads/windows/ and run SETUP_SIH.bat again.'
}
function Ensure-RuntimeDirectories {
  @($RuntimeRoot, $LogRoot, (Join-Path $RuntimeRoot 'reports'), (Join-Path $RuntimeRoot 'diagnostics')) | ForEach-Object {
    New-Item -ItemType Directory -Force -Path $_ | Out-Null
  }
  @('uploads', 'uploaded_docs', 'chroma_db') | ForEach-Object { New-Item -ItemType Directory -Force -Path (Join-Path $BackendRoot $_) | Out-Null }
}
function Ensure-BackendEnv {
  $envFile = Join-Path $BackendRoot '.env'
  if (-not (Test-Path $envFile)) {
    Copy-Item (Join-Path $BackendRoot '.env.example') $envFile
    Write-Ok 'Created backend/.env with safe local Ollama defaults.'
  } else { Write-Ok 'Existing backend/.env preserved.' }
}
function Get-OllamaModels {
  try { return @((Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/tags' -TimeoutSec 5).models | ForEach-Object { $_.name }) } catch { return @() }
}
