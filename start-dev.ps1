# Helix Platform Development Server Starter
# Startet Backend (Port 3000) und Frontend (Port 5173)

Write-Host "Starting Helix Platform Development Servers..." -ForegroundColor Green
Write-Host ""

# Setze Umgebungsvariablen
$env:NODE_ENV = "development"

# Pruefe ob .env existiert
if (-not (Test-Path ".env")) {
    Write-Host ".env file not found. Creating from env.example..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
}

# Starte Backend Server in neuem Fenster
Write-Host "Starting Backend Server on Port 3000..." -ForegroundColor Cyan
$backendCmd = "cd '$PWD'; `$env:NODE_ENV='development'; Write-Host 'Backend Server starting on http://localhost:3000' -ForegroundColor Green; tsx backend/src/server.ts"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Normal

# Warte kurz
Start-Sleep -Seconds 3

# Starte Frontend Server in neuem Fenster
Write-Host "Starting Frontend Server on Port 5173..." -ForegroundColor Cyan
$frontendCmd = "cd '$PWD'; Write-Host 'Frontend Server starting on http://localhost:5173' -ForegroundColor Green; npm run dev:client"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal

Write-Host ""
Write-Host "Servers starting in separate windows..." -ForegroundColor Green
Write-Host "   Backend:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Waiting for servers to start..." -ForegroundColor Cyan

# Warte und pruefe ob Server laufen
$maxWait = 30
$waited = 0
while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 2
    $waited += 2
    
    $backendRunning = netstat -ano | Select-String ":3000" | Select-String "ABHOREN"
    $frontendRunning = netstat -ano | Select-String ":5173" | Select-String "ABHOREN"
    
    if ($backendRunning -and $frontendRunning) {
        Write-Host ""
        Write-Host "Both servers are running!" -ForegroundColor Green
        Write-Host "   Open http://localhost:5173 in your browser" -ForegroundColor Yellow
        break
    }
    
    Write-Host "." -NoNewline -ForegroundColor Gray
}

Write-Host ""
Write-Host "Check the server windows for any errors." -ForegroundColor Cyan

