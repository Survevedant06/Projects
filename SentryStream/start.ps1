# ── SentryStream Dev Launcher ─────────────────────────────────────────────────
# Starts the FastAPI backend and Next.js frontend in parallel.
# Run from the project root: .\start.ps1

$Root     = $PSScriptRoot
$Frontend = "$Root\frontend"
$Python   = "$Root\.venv\Scripts\python.exe"

Write-Host ""
Write-Host "  ███████╗███████╗███╗   ██╗████████╗██████╗ ██╗   ██╗" -ForegroundColor Cyan
Write-Host "  ██╔════╝██╔════╝████╗  ██║╚══██╔══╝██╔══██╗╚██╗ ██╔╝" -ForegroundColor Cyan
Write-Host "  ███████╗█████╗  ██╔██╗ ██║   ██║   ██████╔╝ ╚████╔╝ " -ForegroundColor Cyan
Write-Host "  ╚════██║██╔══╝  ██║╚██╗██║   ██║   ██╔══██╗  ╚██╔╝  " -ForegroundColor Cyan
Write-Host "  ███████║███████╗██║ ╚████║   ██║   ██║  ██║   ██║   " -ForegroundColor Cyan
Write-Host "  ╚══════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   " -ForegroundColor Cyan
Write-Host ""
Write-Host "  SentryStream Dev Launcher" -ForegroundColor White
Write-Host "  Backend  → http://localhost:8000" -ForegroundColor Green
Write-Host "  Frontend → http://localhost:3001" -ForegroundColor Green
Write-Host "  API Docs → http://localhost:8000/docs" -ForegroundColor DarkGray
Write-Host ""

# ── Install frontend deps if node_modules is missing ──────────────────────────
if (-not (Test-Path "$Frontend\node_modules")) {
    Write-Host "  [setup] Installing frontend dependencies via cmd..." -ForegroundColor DarkYellow
    cmd /c "cd /d `"$Frontend`" && npm install"
}

# ── Start FastAPI Backend (uses .venv) ────────────────────────────────────────
Write-Host "[1/2] Starting FastAPI backend (.venv)..." -ForegroundColor Yellow
$backend = Start-Process cmd -ArgumentList "/k", "cd /d `"$Root`" && `"$Python`" -m uvicorn app.main:app --reload --port 8000" -PassThru

# ── Start Next.js Frontend (uses cmd to bypass PS execution policy) ───────────
Write-Host "[2/2] Starting Next.js frontend..." -ForegroundColor Yellow
$frontend = Start-Process cmd -ArgumentList "/k", "cd /d `"$Frontend`" && npm run dev" -PassThru

Write-Host ""
Write-Host "  Both servers are running in separate windows." -ForegroundColor White
Write-Host "  Close those windows (or press Ctrl+C in each) to stop." -ForegroundColor DarkGray
Write-Host ""
