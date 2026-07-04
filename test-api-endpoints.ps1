# API-Endpunkte Test-Skript
Write-Host "=== API-Endpunkte Test ===" -ForegroundColor Cyan
Write-Host ""

# Warte auf Backend-Start
Write-Host "Warte 3 Sekunden auf Backend-Start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Test 1: Legal Cases
Write-Host "1. Testing /api/legal-cases..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/legal-cases" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    Write-Host "   ✅ Response: JSON mit $($json.Count) Einträgen" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Fehler: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 2: Data Sources
Write-Host "2. Testing /api/data-sources..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/data-sources" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    Write-Host "   ✅ Response: JSON mit $($json.Count) Einträgen" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Fehler: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 3: Knowledge Articles
Write-Host "3. Testing /api/knowledge-articles..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/knowledge-articles" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    Write-Host "   ✅ Response: JSON mit $($json.Count) Einträgen" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Fehler: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 4: Navigator
Write-Host "4. Testing /api/navigator/start-project..." -ForegroundColor Green
try {
    $body = @{productIdea="Test Product"} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/navigator/start-project" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    Write-Host "   ✅ Response: JSON - Success: $($json.success)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Fehler: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 5: FDA Approvals (bekannt funktionierend)
Write-Host "5. Testing /api/fda/approvals..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/fda/approvals" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    Write-Host "   ✅ Response: JSON - Success: $($json.success), Count: $($json.count)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Fehler: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: Regulatory Updates (mit Tenant-Header)
Write-Host "6. Testing /api/regulatory-updates (mit Tenant-Header)..." -ForegroundColor Green
try {
    $headers = @{
        "X-Tenant-ID" = "00000000-0000-0000-0000-000000000000"
    }
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/regulatory-updates?limit=5" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    Write-Host "   ✅ Response: JSON - Success: $($json.success)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Fehler: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Yellow
    }
}
Write-Host ""

Write-Host "=== Test abgeschlossen ===" -ForegroundColor Cyan

