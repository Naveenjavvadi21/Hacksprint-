@echo off
echo Starting CareFlow AI Backend on http://localhost:9090...
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0run_backend.ps1"
pause
