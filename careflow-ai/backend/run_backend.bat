@echo off
echo Starting CareFlow AI Backend Server on http://localhost:8080...
cd /d "%~dp0"
java -jar target\careflow-backend-0.0.1-SNAPSHOT.jar
pause
