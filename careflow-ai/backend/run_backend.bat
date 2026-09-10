@echo off
echo Starting CareFlow AI Backend on http://localhost:9090...
cd /d "%~dp0"
if exist "target\careflow-backend-0.0.1-SNAPSHOT.jar" (
    java -jar "target\careflow-backend-0.0.1-SNAPSHOT.jar"
) else (
    powershell -ExecutionPolicy Bypass -File "%~dp0run_backend.ps1"
)
pause
