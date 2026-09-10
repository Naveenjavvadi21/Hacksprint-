@echo off
cd /d "%~dp0"
if exist ".env" (
    for /f "usebackq tokens=1* delims==" %%a in (".env") do (
        set line=%%a
        if not "!line:~0,1!"=="#" (
            set %%a=%%b
        )
    )
)
echo Starting CareFlow AI Backend on http://localhost:9090...
if exist "target\careflow-backend-0.0.1-SNAPSHOT.jar" (
    java -jar "target\careflow-backend-0.0.1-SNAPSHOT.jar"
) else (
    powershell -ExecutionPolicy Bypass -File "%~dp0run_backend.ps1"
)
pause
