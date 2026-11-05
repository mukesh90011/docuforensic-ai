@echo off
title DocuForensic AI — Fake Document Detector Launcher
cd /d "%~dp0"
cls
echo ====================================================================
echo               DOCUFORENSIC AI — MULTI-BROWSER HOST
echo ====================================================================
echo.
echo  [1] Fresh Localhost Link:  http://localhost:3000
echo  [2] Standalone File Mode:   Open public\index.html directly
echo.
echo ====================================================================
echo  Launching default browser to fresh link...
echo ====================================================================

start http://localhost:3000

node server.js
pause
