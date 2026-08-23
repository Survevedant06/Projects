@echo off
title Weather App - Starting...
echo.
echo  ================================================
echo    Weather React App - Starting Dev Server
echo  ================================================
echo.

:: Navigate to the project directory (relative to this script's location)
cd /d "%~dp0"

:: Check if node_modules exists
if not exist "node_modules\" (
    echo  [!] node_modules not found. Installing dependencies...
    cmd /c "npm install"
    echo.
)

echo  [*] Launching app at http://localhost:3001
echo  [*] Press Ctrl+C to stop the server.
echo.

:: Use cmd /c to avoid PowerShell execution policy issues
cmd /c "npm start"

pause
