. "$PSScriptRoot\SIH.Common.ps1"
Ensure-RuntimeDirectories
if (-not (Test-Path $VenvPython) -or -not (Test-Path (Join-Path $ProjectRoot 'node_modules'))) { Write-Info 'First-run setup is required.'; & "$PSScriptRoot\Setup-SIH.ps1" -PullModels; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
Ensure-BackendEnv
if (-not (Test-Command 'ollama') -or -not (Test-Http 'http://127.0.0.1:11434/api/tags')) {
  Write-Fail 'Ollama is unavailable. Run SETUP_SIH.bat, then try again.'
  exit 1
}
$requiredModels = @('qwen2.5:latest', 'nomic-embed-text:latest')
$availableModels = Get-OllamaModels
foreach ($model in $requiredModels) {
  if ($availableModels -notcontains $model) {
    Write-Fail "Required Ollama model '$model' is missing. Run SETUP_SIH.bat to download it."
    exit 1
  }
}
if (Test-ListeningPort 8000) { Write-Info 'Port 8000 is already in use; backend will not be started again.' } else {
  $backend = Start-Process -FilePath $VenvPython -ArgumentList '-m','uvicorn','app.main:app','--port','8000' -WorkingDirectory $BackendRoot -RedirectStandardOutput (Join-Path $LogRoot 'backend.log') -RedirectStandardError (Join-Path $LogRoot 'backend-error.log') -WindowStyle Hidden -PassThru
  $backendPid = $backend.Id
}
for ($i = 0; $i -lt 30 -and -not (Test-Http 'http://127.0.0.1:8000/api/health'); $i++) { Start-Sleep -Seconds 1 }
if (-not (Test-Http 'http://127.0.0.1:8000/api/health')) { Write-Fail 'Backend did not become healthy. Read runtime\logs\backend-error.log'; exit 1 }
Write-Ok 'Backend health check passed'
if (Test-ListeningPort 3000) { Write-Info 'Port 3000 is already in use; frontend will not be started again.' } else {
  $frontendCommand = 'set "NEXT_DIST_DIR=runtime/next-cache" && npm run dev 1> runtime\logs\frontend.log 2> runtime\logs\frontend-error.log'
  $frontend = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c',$frontendCommand -WorkingDirectory $ProjectRoot -WindowStyle Hidden -PassThru
  $frontendPid = $frontend.Id
}
for ($i = 0; $i -lt 30 -and -not (Test-Http 'http://localhost:3000'); $i++) { Start-Sleep -Seconds 1 }
if (-not (Test-Http 'http://localhost:3000')) {
  Write-Fail 'Frontend did not become ready. Read runtime\logs\frontend-error.log'
  exit 1
}
Write-Ok 'Frontend health check passed'
@{ backendPid = $backendPid; frontendPid = $frontendPid; startedAt = (Get-Date).ToString('o') } | ConvertTo-Json | Set-Content -Encoding UTF8 $PidFile -Force
Start-Process 'http://localhost:3000'
Write-Host "`nSIH is running.`nFrontend: http://localhost:3000`nBackend: http://127.0.0.1:8000`nAPI Docs: http://127.0.0.1:8000/docs" -ForegroundColor Green
