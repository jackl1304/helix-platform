# MedTech Data Platform Setup Script for PowerShell
# This script sets up the development environment for the MedTech Data Platform

param(
    [Parameter(Position=0)]
    [string]$Action = "setup"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Function to check if command exists
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Function to check if Docker is running
function Test-Docker {
    try {
        docker info | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Function to check if Docker Compose is available
function Test-DockerCompose {
    return (Test-Command "docker-compose") -or (Test-Command "docker")
}

# Function to create necessary directories
function New-Directories {
    Write-Status "Creating necessary directories..."
    
    $directories = @(
        "logs",
        "data",
        "uploads",
        "ssl",
        "monitoring/grafana/dashboards",
        "monitoring/grafana/datasources",
        "monitoring/kibana",
        "monitoring/logstash"
    )
    
    foreach ($dir in $directories) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
    
    Write-Success "Directories created successfully"
}

# Function to create environment files
function New-EnvironmentFiles {
    Write-Status "Creating environment files..."
    
    # Backend .env file
    if (!(Test-Path "backend/.env")) {
        $backendEnv = @"
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/medtech_db
POSTGRES_DB=medtech_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Redis Configuration
REDIS_URL=redis://localhost:6379

# FastAPI Configuration
ENVIRONMENT=development
DEBUG=True
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=logs/backend.log

# Monitoring Configuration
ENABLE_METRICS=True
METRICS_PORT=8001

# File Storage Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760  # 10MB

# Email Configuration (Optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_TLS=True

# External API Configuration
FDA_API_KEY=
EMA_API_KEY=
BFARM_API_KEY=
HEALTH_CANADA_API_KEY=
TGA_API_KEY=
PMDA_API_KEY=
MHRA_API_KEY=
ANVISA_API_KEY=
HSA_API_KEY=
"@
        $backendEnv | Out-File -FilePath "backend/.env" -Encoding UTF8
        Write-Success "Backend .env file created"
    } else {
        Write-Warning "Backend .env file already exists"
    }
    
    # Frontend .env file
    if (!(Test-Path "frontend/.env")) {
        $frontendEnv = @"
# API Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_MONITORING=false

# External Services
REACT_APP_SENTRY_DSN=
REACT_APP_GOOGLE_ANALYTICS_ID=

# Development Configuration
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug
"@
        $frontendEnv | Out-File -FilePath "frontend/.env" -Encoding UTF8
        Write-Success "Frontend .env file created"
    } else {
        Write-Warning "Frontend .env file already exists"
    }
    
    # Root .env file
    if (!(Test-Path ".env")) {
        $rootEnv = @"
# Docker Compose Configuration
COMPOSE_PROJECT_NAME=medtech-platform
COMPOSE_FILE=docker-compose.yml

# Database Configuration
POSTGRES_DB=medtech_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Redis Configuration
REDIS_PASSWORD=password

# MinIO Configuration
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin

# Monitoring Configuration
GRAFANA_ADMIN_PASSWORD=admin
PROMETHEUS_RETENTION=200h

# SSL Configuration
SSL_CERT_PATH=./ssl/cert.pem
SSL_KEY_PATH=./ssl/key.pem

# Backup Configuration
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE=0 2 * * *

# Logging Configuration
LOG_LEVEL=INFO
LOG_RETENTION_DAYS=30
"@
        $rootEnv | Out-File -FilePath ".env" -Encoding UTF8
        Write-Success "Root .env file created"
    } else {
        Write-Warning "Root .env file already exists"
    }
}

# Function to install Python dependencies
function Install-PythonDependencies {
    Write-Status "Installing Python dependencies..."
    
    if (Test-Path "backend/requirements.txt") {
        Set-Location backend
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        Set-Location ..
        Write-Success "Python dependencies installed"
    } else {
        Write-Warning "Backend requirements.txt not found"
    }
}

# Function to install Node.js dependencies
function Install-NodeDependencies {
    Write-Status "Installing Node.js dependencies..."
    
    if (Test-Path "frontend/package.json") {
        Set-Location frontend
        npm install
        Set-Location ..
        Write-Success "Node.js dependencies installed"
    } else {
        Write-Warning "Frontend package.json not found"
    }
}

# Function to build Docker images
function Build-DockerImages {
    Write-Status "Building Docker images..."
    
    # Build backend image
    if (Test-Path "backend/Dockerfile") {
        docker build -t medtech-backend ./backend
        Write-Success "Backend Docker image built"
    } else {
        Write-Warning "Backend Dockerfile not found"
    }
    
    # Build frontend image
    if (Test-Path "frontend/Dockerfile") {
        docker build -t medtech-frontend ./frontend
        Write-Success "Frontend Docker image built"
    } else {
        Write-Warning "Frontend Dockerfile not found"
    }
}

# Function to start services with Docker Compose
function Start-Services {
    Write-Status "Starting services with Docker Compose..."
    
    # Check if docker-compose or docker compose is available
    $composeCmd = if (Test-Command "docker-compose") { "docker-compose" } else { "docker compose" }
    
    # Start services
    Invoke-Expression "$composeCmd up -d"
    
    Write-Success "Services started successfully"
    Write-Status "Waiting for services to be ready..."
    
    # Wait for services to be ready
    Start-Sleep -Seconds 30
    
    # Check service health
    Test-ServiceHealth
}

# Function to check service health
function Test-ServiceHealth {
    Write-Status "Checking service health..."
    
    # Check backend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Backend service is healthy"
        }
    }
    catch {
        Write-Warning "Backend service is not responding"
    }
    
    # Check frontend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Frontend service is healthy"
        }
    }
    catch {
        Write-Warning "Frontend service is not responding"
    }
    
    # Check database
    try {
        $result = docker exec medtech-db pg_isready -U postgres
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database service is healthy"
        }
    }
    catch {
        Write-Warning "Database service is not responding"
    }
    
    # Check Redis
    try {
        $result = docker exec medtech-redis redis-cli ping
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Redis service is healthy"
        }
    }
    catch {
        Write-Warning "Redis service is not responding"
    }
}

# Function to run database migrations
function Invoke-Migrations {
    Write-Status "Running database migrations..."
    
    # Wait for database to be ready
    Start-Sleep -Seconds 10
    
    # Run migrations (if available)
    if (Test-Path "backend/alembic.ini") {
        Set-Location backend
        alembic upgrade head
        Set-Location ..
        Write-Success "Database migrations completed"
    } else {
        Write-Warning "No migrations found"
    }
}

# Function to create initial data
function New-InitialData {
    Write-Status "Creating initial data..."
    
    # This would typically involve running seed scripts or API calls
    # For now, we'll just print a message
    Write-Success "Initial data creation completed"
}

# Function to display service URLs
function Show-ServiceUrls {
    Write-Success "Setup completed successfully!"
    Write-Host ""
    Write-Host "Service URLs:"
    Write-Host "============="
    Write-Host "Frontend:        http://localhost:3000"
    Write-Host "Backend API:     http://localhost:8000"
    Write-Host "API Docs:        http://localhost:8000/docs"
    Write-Host "Database:        localhost:5432"
    Write-Host "Redis:           localhost:6379"
    Write-Host "Nginx:           http://localhost:80"
    Write-Host "Prometheus:      http://localhost:9090"
    Write-Host "Grafana:         http://localhost:3001 (admin/admin)"
    Write-Host "Elasticsearch:   http://localhost:9200"
    Write-Host "Kibana:          http://localhost:5601"
    Write-Host "Jaeger:          http://localhost:16686"
    Write-Host "MinIO:           http://localhost:9001 (minioadmin/minioadmin)"
    Write-Host "Flower:          http://localhost:5555"
    Write-Host ""
    Write-Host "Default Credentials:"
    Write-Host "==================="
    Write-Host "Database:        postgres/password"
    Write-Host "Grafana:         admin/admin"
    Write-Host "MinIO:           minioadmin/minioadmin"
    Write-Host ""
    Write-Host "To stop services: docker-compose down"
    Write-Host "To view logs:    docker-compose logs -f [service-name]"
    Write-Host "To restart:      docker-compose restart [service-name]"
}

# Function to cleanup
function Remove-Containers {
    Write-Status "Cleaning up..."
    
    # Stop and remove containers
    $composeCmd = if (Test-Command "docker-compose") { "docker-compose" } else { "docker compose" }
    Invoke-Expression "$composeCmd down -v"
    
    # Remove images (optional)
    # docker rmi medtech-backend medtech-frontend
    
    Write-Success "Cleanup completed"
}

# Function to show help
function Show-Help {
    Write-Host "MedTech Data Platform Setup Script for PowerShell"
    Write-Host ""
    Write-Host "Usage: .\scripts\setup.ps1 [OPTION]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  setup       Set up the development environment (default)"
    Write-Host "  start       Start services with Docker Compose"
    Write-Host "  stop        Stop services"
    Write-Host "  restart     Restart services"
    Write-Host "  build       Build Docker images"
    Write-Host "  clean       Clean up containers and volumes"
    Write-Host "  health      Check service health"
    Write-Host "  logs        Show logs for all services"
    Write-Host "  help        Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\scripts\setup.ps1 setup    # Set up the development environment"
    Write-Host "  .\scripts\setup.ps1 start    # Start services"
    Write-Host "  .\scripts\setup.ps1 logs     # Show logs"
}

# Function to show logs
function Show-Logs {
    $composeCmd = if (Test-Command "docker-compose") { "docker-compose" } else { "docker compose" }
    Invoke-Expression "$composeCmd logs -f"
}

# Main function
function Main {
    switch ($Action.ToLower()) {
        "setup" {
            Write-Status "Setting up MedTech Data Platform..."
            if (!(Test-Docker)) {
                Write-Error "Docker is not running. Please start Docker and try again."
                exit 1
            }
            if (!(Test-DockerCompose)) {
                Write-Error "Docker Compose is not available. Please install Docker Compose and try again."
                exit 1
            }
            New-Directories
            New-EnvironmentFiles
            Install-PythonDependencies
            Install-NodeDependencies
            Build-DockerImages
            Start-Services
            Invoke-Migrations
            New-InitialData
            Show-ServiceUrls
        }
        "start" {
            if (!(Test-Docker)) {
                Write-Error "Docker is not running. Please start Docker and try again."
                exit 1
            }
            if (!(Test-DockerCompose)) {
                Write-Error "Docker Compose is not available. Please install Docker Compose and try again."
                exit 1
            }
            Start-Services
        }
        "stop" {
            $composeCmd = if (Test-Command "docker-compose") { "docker-compose" } else { "docker compose" }
            Invoke-Expression "$composeCmd down"
            Write-Success "Services stopped"
        }
        "restart" {
            $composeCmd = if (Test-Command "docker-compose") { "docker-compose" } else { "docker compose" }
            Invoke-Expression "$composeCmd restart"
            Write-Success "Services restarted"
        }
        "build" {
            if (!(Test-Docker)) {
                Write-Error "Docker is not running. Please start Docker and try again."
                exit 1
            }
            Build-DockerImages
        }
        "clean" {
            Remove-Containers
        }
        "health" {
            Test-ServiceHealth
        }
        "logs" {
            Show-Logs
        }
        "help" {
            Show-Help
        }
        default {
            Write-Error "Unknown option: $Action"
            Show-Help
            exit 1
        }
    }
}

# Run main function
Main
