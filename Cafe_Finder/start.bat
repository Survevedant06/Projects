@echo off
title NomadSpot Cafe Finder - Port 3002
echo ========================================================
echo   Starting NomadSpot - Workspace & Cafe Discovery
echo   Port: 3002
echo ========================================================
echo.

cd /d "%~dp0"

:: Check if node_modules exists, install if missing
if not exist "node_modules\" (
    echo [1/3] Installing dependencies...
    call npm install
) else (
    echo [1/3] Dependencies verified.
)

:: Check if dev.db exists, push schema & seed if missing
if not exist "prisma\dev.db" (
    if not exist "dev.db" (
        echo [2/3] Initializing database & seeding sample cafes...
        call npx prisma db push
        call npx tsx prisma/seed.ts
    )
) else (
    echo [2/3] Database ready.
)

echo [3/3] Launching NomadSpot on http://localhost:3002 ...
echo.

:: Automatically open the browser after a brief delay
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3002"

:: Run Next.js dev server on port 3002
call npm run dev
pause
