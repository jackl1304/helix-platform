# Test Backend Startup
cd d:\HELIX_aktuell\helix-platform
$env:NODE_ENV="development"

Write-Host "=== Starting Backend Server ===" -ForegroundColor Green
Write-Host "Watch this window for errors!" -ForegroundColor Yellow
Write-Host ""

tsx backend/src/server.ts

Write-Host ""
Write-Host "=== Server stopped ===" -ForegroundColor Red
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

