. "$PSScriptRoot\SIH.Common.ps1"
Ensure-RuntimeDirectories
$report = [ordered]@{ generatedAt=(Get-Date).ToString('o'); projectRoot=$ProjectRoot; ports=@{frontend3000=(Test-ListeningPort 3000);backend8000=(Test-ListeningPort 8000);ollama11434=(Test-ListeningPort 11434)}; commands=@{}; models=(Get-OllamaModels); backendRoutes=@(); logs=@{} }
foreach($command in @('python','node','npm','ollama','git')) { $report.commands[$command] = (Test-Command $command) }
if(Test-Path $VenvPython) { $report.python = & $VenvPython --version; try { Push-Location $BackendRoot; $report.backendRoutes = @(& $VenvPython -c 'from app.main import app; print(*sorted(r.path for r in app.routes if getattr(r,chr(112)+chr(97)+chr(116)+chr(104),None)),sep=chr(10))'); Pop-Location } catch { $report.backendImportError=$_.Exception.Message } }
foreach($log in @('backend.log','backend-error.log','frontend.log','frontend-error.log')) { $path=Join-Path $LogRoot $log; if(Test-Path $path) { $report.logs[$log]=@(Get-Content $path -Tail 30) } }
$jsonPath=Join-Path $RuntimeRoot 'diagnostics\latest.json'
try {
  $report | ConvertTo-Json -Depth 6 | Set-Content -Encoding UTF8 $jsonPath -Force
  Write-Host "Diagnostic report saved to $jsonPath" -ForegroundColor Green
} catch {
  Write-Host "[WARN] Could not save the diagnostic file: $($_.Exception.Message)" -ForegroundColor Yellow
}
$report | ConvertTo-Json -Depth 6
