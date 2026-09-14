param([switch]$SkipBuild)
. "$PSScriptRoot\SIH.Common.ps1"
$failed = $false
function Check([string]$Name, [scriptblock]$Action) {
  try { & $Action; Write-Ok $Name }
  catch { Write-Fail ($Name + ': ' + $_.Exception.Message); $script:failed = $true }
}
Check 'Python virtual environment' { if (-not (Test-Path $VenvPython)) { throw 'Run SETUP_SIH.bat first.' }; & $VenvPython --version | Out-Null }
Check 'Backend imports (NumPy, ONNX Runtime, ChromaDB, ReportLab, FastAPI)' { Push-Location $BackendRoot; & $VenvPython -c 'import numpy,onnxruntime,chromadb,reportlab; from app.main import app; print(len(app.routes))'; if ($LASTEXITCODE -ne 0) { throw 'FastAPI import failed.' }; Pop-Location }
Check 'Frontend dependencies' { if (-not (Test-Path (Join-Path $ProjectRoot 'node_modules'))) { throw 'Run SETUP_SIH.bat first.' } }
Check 'Ollama API' { if (-not (Test-Http 'http://127.0.0.1:11434/api/tags')) { throw 'Ollama is unavailable at 127.0.0.1:11434.' } }
Check 'Required Ollama models' { $models=Get-OllamaModels; foreach($m in @('qwen2.5:latest','nomic-embed-text:latest')) { if($models -notcontains $m){throw ('Missing model: ' + $m)} } }
Check 'Backend health (if running)' { if (Test-ListeningPort 8000) { if (-not (Test-Http 'http://127.0.0.1:8000/api/health')) { throw 'Health endpoint failed.' } } else { Write-Info 'Backend is not running; import check passed.' } }
if (-not $SkipBuild) { Check 'Frontend production build' { Push-Location $ProjectRoot; npm run build; if ($LASTEXITCODE -ne 0) { throw 'npm run build failed.' }; Pop-Location } }
if ($failed) { Write-Fail 'VERIFY RESULT: FAIL'; exit 1 }; Write-Host 'VERIFY RESULT: PASS' -ForegroundColor Green
