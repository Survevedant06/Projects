@echo off
:: ============================================
::  Endgame / Jarvis AI - Direct GUI Launcher
::  Bypasses face authentication (--gui-only)
:: ============================================

:: Move to the project directory regardless of where the batch is launched from
cd /d "%~dp0"

:: Activate the virtual environment
call .venv\Scripts\activate.bat

:: Launch the GUI directly, skipping face authentication
python endgame.py --gui-only

:: Keep the window open if there is an error
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] The application exited with code %ERRORLEVEL%.
    pause
)
