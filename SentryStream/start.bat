@echo off
title SentryStream Dev Launcher

echo.
echo   ==========================================
echo    SentryStream Dev Launcher
echo   ==========================================
echo    Backend  ^>  http://localhost:8000
echo    Frontend ^>  http://localhost:3001
echo    API Docs ^>  http://localhost:8000/docs
echo   ==========================================
echo.

:: Install frontend deps if missing
if not exist "%~dp0frontend\node_modules" (
    echo [setup] Installing frontend dependencies...
    cd /d "%~dp0frontend"
    npm install
    cd /d "%~dp0"
)

echo [1/2] Starting FastAPI backend...
start "SentryStream - Backend" cmd /k "cd /d "%~dp0" && .venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

echo [2/2] Starting Next.js frontend...
start "SentryStream - Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo   Both servers are starting in separate windows.
echo   Backend  : http://localhost:8000
echo   Frontend : http://localhost:3001
echo.
