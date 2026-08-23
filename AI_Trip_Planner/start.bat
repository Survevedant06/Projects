@echo off
title WanderAI - Starting Dev Server
color 0A

echo.
echo  ==========================================
echo    WanderAI - AI Travel Planner
echo    Starting development server...
echo  ==========================================
echo.

cd /d "e:\VS_Code\Projects\AI_Trip_Planner"

REM Check if node_modules exists
if not exist "node_modules\" (
  echo  [1/2] Installing dependencies...
  call npm.cmd install
  echo.
)

echo  [Ready] Opening http://localhost:3000
echo  [Info]  Press Ctrl+C to stop the server
echo.

REM Open browser after a short delay (background)
start "" cmd /c "timeout /t 4 >nul && start http://localhost:3000"

REM Start the dev server
call npm.cmd run dev
