param([switch]$PullModels)
. "$PSScriptRoot\SIH.Common.ps1"
Write-Info "Setting up RefinaAI from $ProjectRoot"
Ensure-RuntimeDirectories
if ($ProjectRoot.Length -gt 180) { Write-Host '[WARN] This extraction path is long. If ONNX Runtime reports a DLL/path-length error, move the extracted folder to C:\SIH and run setup again.' -ForegroundColor Yellow }
if (Test-Command 'py') { $pythonExe = 'py'; $pythonArgs = @('-3.11') }
elseif (Test-Command 'python') { $pythonExe = 'python'; $pythonArgs = @() }
else { throw 'Python 3.11 or newer is required. Install it from https://www.python.org/downloads/windows/ and run SETUP_SIH.bat again.' }
$version = & $pythonExe @pythonArgs --version 2>&1
if ($version -notmatch 'Python 3\.(1[1-9]|[2-9][0-9])') { throw "Python 3.11+ is required; found $version" }
Write-Ok "$version detected"
if (-not (Test-Path $VenvPython)) { Write-Info 'Creating isolated backend virtual environment...'; & $pythonExe @pythonArgs -m venv (Join-Path $BackendRoot 'venv') }
Write-Ok 'Backend virtual environment ready'
& $VenvPython -m pip install --upgrade pip | Out-Host
& $VenvPython -m pip install -r (Join-Path $BackendRoot 'requirements.txt') | Out-Host
& $VenvPython -c "import numpy, onnxruntime, chromadb, reportlab; from app.main import app; print('Backend imports OK:', numpy.__version__, onnxruntime.__version__, chromadb.__version__)" -ErrorAction Stop
Write-Ok 'Backend dependencies and imports verified'
if (-not (Test-Command 'node') -or -not (Test-Command 'npm')) { throw 'Node.js and npm are required. Install the LTS version from https://nodejs.org/ and run SETUP_SIH.bat again.' }
Write-Ok "Node $(& node --version) and npm $(& npm --version) detected"
if (-not (Test-Path (Join-Path $ProjectRoot 'node_modules'))) { Write-Info 'Installing frontend dependencies...'; Push-Location $ProjectRoot; npm install; Pop-Location } else { Write-Ok 'Frontend dependencies already present' }
Ensure-BackendEnv
if (-not (Test-Command 'ollama')) { throw 'Ollama is not installed. Install it from https://ollama.com/download/windows, then run SETUP_SIH.bat again.' }
if (-not (Test-Http 'http://127.0.0.1:11434/api/tags')) { Write-Info 'Starting local Ollama service...'; Start-Process -FilePath 'ollama' -ArgumentList 'serve' -WindowStyle Hidden; Start-Sleep -Seconds 3 }
if (-not (Test-Http 'http://127.0.0.1:11434/api/tags')) { throw 'Ollama is installed but its local service is not reachable at http://127.0.0.1:11434.' }
$models = Get-OllamaModels
foreach ($model in @('qwen2.5:latest', 'nomic-embed-text:latest')) {
  if ($models -contains $model) { Write-Ok "$model available" }
  elseif ($PullModels) { Write-Info "Downloading required Ollama model $model..."; & ollama pull $model; if ($LASTEXITCODE -ne 0) { throw "Could not download $model. Check disk space and internet, then rerun setup." } }
  else { throw "Required Ollama model '$model' is missing. Run: ollama pull $model" }
}
Write-Host "`nSetup complete. Double-click START_SIH.bat to launch the application." -ForegroundColor Green
