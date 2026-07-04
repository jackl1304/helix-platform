# Start both servers in separate windows with visible output

Write-Host "Starting Helix Platform Servers..." -ForegroundColor Green
Write-Host ""

# Kill existing processes
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start Backend
Write-Host "Starting Backend Server (Port 3000)..." -ForegroundColor Cyan
$backendScript = @"
cd '$PWD'
`$env:NODE_ENV='development'
Write-Host 'Backend Server starting...' -ForegroundColor Green
tsx backend/src/server.ts
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

# Wait a bit
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend Server (Port 5173)..." -ForegroundColor Cyan
$frontendScript = @"
cd '$PWD'
Write-Host 'Frontend Server starting...' -ForegroundColor Green
npm run dev:client
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript

Write-Host ""
Write-Host "Servers starting in separate windows." -ForegroundColor Green
Write-Host "Check the windows for any errors." -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan

