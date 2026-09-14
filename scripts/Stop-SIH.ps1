. "$PSScriptRoot\SIH.Common.ps1"
if (-not (Test-Path $PidFile)) { Write-Info 'No project-owned process record found; nothing was stopped.'; exit 0 }
$pids = Get-Content -Raw $PidFile | ConvertFrom-Json
foreach ($trackedPid in @($pids.backendPid, $pids.frontendPid)) {
  if ($trackedPid -and (Get-Process -Id $trackedPid -ErrorAction SilentlyContinue)) {
    $taskkillOutput = & taskkill /PID $trackedPid /T /F 2>&1
    if ($LASTEXITCODE -eq 0) { Write-Ok "Stopped project process $trackedPid" }
    else { Write-Host ("[WARN] Could not stop tracked process {0}: {1}" -f $trackedPid, $taskkillOutput) -ForegroundColor Yellow }
  }
}
Remove-Item $PidFile -Force
