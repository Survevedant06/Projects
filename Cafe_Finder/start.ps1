# NomadSpot One-Click PowerShell Launcher
Set-Location -Path $PSScriptRoot

Write-Host "========================================================" -ForegroundColor Amber
Write-Host "  Starting NomadSpot - Workspace & Cafe Discovery" -ForegroundColor Green
Write-Host "  Port: 3002" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Amber
Write-Host ""

if (-not (Test-Path "node_modules")) {
    Write-Host "[1/3] Installing dependencies..." -ForegroundColor Yellow
    cmd /c npm install
} else {
    Write-Host "[1/3] Dependencies verified." -ForegroundColor Green
}

if (-not (Test-Path "dev.db")) {
    Write-Host "[2/3] Initializing database & seeding sample cafes..." -ForegroundColor Yellow
    cmd /c npx prisma db push
    cmd /c npx tsx prisma/seed.ts
} else {
    Write-Host "[2/3] Database ready." -ForegroundColor Green
}

Write-Host "[3/3] Launching NomadSpot on http://localhost:3002 ..." -ForegroundColor Cyan

# Open browser in 2 seconds in background
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:3002"
} | Out-Null

cmd /c npm run dev
