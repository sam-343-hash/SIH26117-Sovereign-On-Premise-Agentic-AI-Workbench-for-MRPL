@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Setup-SIH.ps1" -PullModels
pause
