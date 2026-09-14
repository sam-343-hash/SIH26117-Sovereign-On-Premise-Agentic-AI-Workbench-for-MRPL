. "$PSScriptRoot\SIH.Common.ps1"
if (-not (Test-Path $PidFile)) { Write-Info 'No project-owned process record found; nothing was stopped.'; exit 0 }
$pids = Get-Content -Raw $PidFile | ConvertFrom-Json
foreach ($pid in @($pids.backendPid, $pids.frontendPid)) { if ($pid -and (Get-Process -Id $pid -ErrorAction SilentlyContinue)) { & taskkill /PID $pid /T /F | Out-Null; Write-Ok "Stopped project process $pid" } }
Remove-Item $PidFile -Force
