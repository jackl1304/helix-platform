# Neon.tech Database Setup Script
# Dieses Script hilft beim Einrichten der Neon-Datenbank

Write-Host "🚀 Neon.tech Database Setup" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Prüfe ob .env existiert
if (Test-Path ".env") {
    Write-Host "✅ .env Datei existiert bereits" -ForegroundColor Green
    $envContent = Get-Content ".env" -Raw
    
    if ($envContent -match "DATABASE_URL") {
        Write-Host "✅ DATABASE_URL ist bereits gesetzt" -ForegroundColor Green
        $dbUrl = ($envContent -split "`n" | Where-Object { $_ -match "DATABASE_URL" }) -replace '.*DATABASE_URL="?([^"]+)"?.*', '$1'
        if ($dbUrl -match "neon\.tech") {
            Write-Host "✅ Neon.tech Connection String gefunden!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Nächste Schritte:" -ForegroundColor Yellow
            Write-Host "1. npm run db:push     - Erstellt das Datenbank-Schema"
            Write-Host "2. npm run db:seed:all - Spielt Seed-Daten ein"
            Write-Host "3. npm run dev         - Startet Server"
        } else {
            Write-Host "⚠️  DATABASE_URL gefunden, aber nicht von Neon.tech" -ForegroundColor Yellow
            Write-Host "Bitte aktualisiere die .env Datei mit deinem Neon Connection String" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  DATABASE_URL nicht in .env gefunden" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Bitte füge folgende Zeile in .env ein:" -ForegroundColor Yellow
        Write-Host 'DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"' -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ .env Datei nicht gefunden" -ForegroundColor Red
    Write-Host ""
    Write-Host "Erstelle .env Datei aus env.example..." -ForegroundColor Yellow
    
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "✅ .env Datei erstellt" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  WICHTIG: Bitte füge deinen Neon Connection String in .env ein:" -ForegroundColor Yellow
        Write-Host 'DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"' -ForegroundColor Cyan
    } else {
        Write-Host "❌ env.example nicht gefunden" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📖 Vollständige Anleitung: Siehe NEON-DATABASE-SETUP.md" -ForegroundColor Cyan
Write-Host "🌐 Neon.tech: https://neon.tech" -ForegroundColor Cyan
Write-Host ""

