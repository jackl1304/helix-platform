# Backend Server Starter - Shows ALL output
cd d:\HELIX_aktuell\helix-platform

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HELIX BACKEND SERVER STARTER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill existing processes
Write-Host "Cleaning up..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "Starting Backend Server..." -ForegroundColor Green
Write-Host "Watch for errors below!" -ForegroundColor Yellow
Write-Host ""

# Start backend
node backend/minimal-server.js

Write-Host ""
Write-Host "Server stopped." -ForegroundColor Red
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
