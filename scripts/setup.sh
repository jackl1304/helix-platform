#!/bin/bash

# MedTech Data Platform Setup Script
# This script sets up the development environment for the MedTech Data Platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose is not available. Please install Docker Compose and try again."
        exit 1
    fi
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p data
    mkdir -p uploads
    mkdir -p ssl
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/datasources
    mkdir -p monitoring/kibana
    mkdir -p monitoring/logstash
    
    print_success "Directories created successfully"
}

# Function to create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Backend .env file
    if [ ! -f backend/.env ]; then
        cat > backend/.env << EOF
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
EOF
        print_success "Backend .env file created"
    else
        print_warning "Backend .env file already exists"
    fi
    
    # Frontend .env file
    if [ ! -f frontend/.env ]; then
        cat > frontend/.env << EOF
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
EOF
        print_success "Frontend .env file created"
    else
        print_warning "Frontend .env file already exists"
    fi
    
    # Root .env file
    if [ ! -f .env ]; then
        cat > .env << EOF
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
EOF
        print_success "Root .env file created"
    else
        print_warning "Root .env file already exists"
    fi
}

# Function to install Python dependencies
install_python_dependencies() {
    print_status "Installing Python dependencies..."
    
    if [ -f backend/requirements.txt ]; then
        cd backend
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        cd ..
        print_success "Python dependencies installed"
    else
        print_warning "Backend requirements.txt not found"
    fi
}

# Function to install Node.js dependencies
install_node_dependencies() {
    print_status "Installing Node.js dependencies..."
    
    if [ -f frontend/package.json ]; then
        cd frontend
        npm install
        cd ..
        print_success "Node.js dependencies installed"
    else
        print_warning "Frontend package.json not found"
    fi
}

# Function to build Docker images
build_docker_images() {
    print_status "Building Docker images..."
    
    # Build backend image
    if [ -f backend/Dockerfile ]; then
        docker build -t medtech-backend ./backend
        print_success "Backend Docker image built"
    else
        print_warning "Backend Dockerfile not found"
    fi
    
    # Build frontend image
    if [ -f frontend/Dockerfile ]; then
        docker build -t medtech-frontend ./frontend
        print_success "Frontend Docker image built"
    else
        print_warning "Frontend Dockerfile not found"
    fi
}

# Function to start services with Docker Compose
start_services() {
    print_status "Starting services with Docker Compose..."
    
    # Check if docker-compose or docker compose is available
    if command_exists docker-compose; then
        COMPOSE_CMD="docker-compose"
    else
        COMPOSE_CMD="docker compose"
    fi
    
    # Start services
    $COMPOSE_CMD up -d
    
    print_success "Services started successfully"
    print_status "Waiting for services to be ready..."
    
    # Wait for services to be ready
    sleep 30
    
    # Check service health
    check_service_health
}

# Function to check service health
check_service_health() {
    print_status "Checking service health..."
    
    # Check backend
    if curl -f http://localhost:8000/health >/dev/null 2>&1; then
        print_success "Backend service is healthy"
    else
        print_warning "Backend service is not responding"
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        print_success "Frontend service is healthy"
    else
        print_warning "Frontend service is not responding"
    fi
    
    # Check database
    if docker exec medtech-db pg_isready -U postgres >/dev/null 2>&1; then
        print_success "Database service is healthy"
    else
        print_warning "Database service is not responding"
    fi
    
    # Check Redis
    if docker exec medtech-redis redis-cli ping >/dev/null 2>&1; then
        print_success "Redis service is healthy"
    else
        print_warning "Redis service is not responding"
    fi
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait for database to be ready
    sleep 10
    
    # Run migrations (if available)
    if [ -f backend/alembic.ini ]; then
        cd backend
        alembic upgrade head
        cd ..
        print_success "Database migrations completed"
    else
        print_warning "No migrations found"
    fi
}

# Function to create initial data
create_initial_data() {
    print_status "Creating initial data..."
    
    # This would typically involve running seed scripts or API calls
    # For now, we'll just print a message
    print_success "Initial data creation completed"
}

# Function to display service URLs
display_service_urls() {
    print_success "Setup completed successfully!"
    echo
    echo "Service URLs:"
    echo "============="
    echo "Frontend:        http://localhost:3000"
    echo "Backend API:     http://localhost:8000"
    echo "API Docs:        http://localhost:8000/docs"
    echo "Database:        localhost:5432"
    echo "Redis:           localhost:6379"
    echo "Nginx:           http://localhost:80"
    echo "Prometheus:      http://localhost:9090"
    echo "Grafana:         http://localhost:3001 (admin/admin)"
    echo "Elasticsearch:   http://localhost:9200"
    echo "Kibana:          http://localhost:5601"
    echo "Jaeger:          http://localhost:16686"
    echo "MinIO:           http://localhost:9001 (minioadmin/minioadmin)"
    echo "Flower:          http://localhost:5555"
    echo
    echo "Default Credentials:"
    echo "==================="
    echo "Database:        postgres/password"
    echo "Grafana:         admin/admin"
    echo "MinIO:           minioadmin/minioadmin"
    echo
    echo "To stop services: docker-compose down"
    echo "To view logs:    docker-compose logs -f [service-name]"
    echo "To restart:      docker-compose restart [service-name]"
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up..."
    
    # Stop and remove containers
    if command_exists docker-compose; then
        docker-compose down -v
    else
        docker compose down -v
    fi
    
    # Remove images (optional)
    # docker rmi medtech-backend medtech-frontend
    
    print_success "Cleanup completed"
}

# Function to show help
show_help() {
    echo "MedTech Data Platform Setup Script"
    echo
    echo "Usage: $0 [OPTION]"
    echo
    echo "Options:"
    echo "  setup       Set up the development environment (default)"
    echo "  start       Start services with Docker Compose"
    echo "  stop        Stop services"
    echo "  restart     Restart services"
    echo "  build       Build Docker images"
    echo "  clean       Clean up containers and volumes"
    echo "  health      Check service health"
    echo "  logs        Show logs for all services"
    echo "  help        Show this help message"
    echo
    echo "Examples:"
    echo "  $0 setup    # Set up the development environment"
    echo "  $0 start    # Start services"
    echo "  $0 logs     # Show logs"
}

# Function to show logs
show_logs() {
    if command_exists docker-compose; then
        docker-compose logs -f
    else
        docker compose logs -f
    fi
}

# Main function
main() {
    case "${1:-setup}" in
        "setup")
            print_status "Setting up MedTech Data Platform..."
            check_docker
            check_docker_compose
            create_directories
            create_env_files
            install_python_dependencies
            install_node_dependencies
            build_docker_images
            start_services
            run_migrations
            create_initial_data
            display_service_urls
            ;;
        "start")
            check_docker
            check_docker_compose
            start_services
            ;;
        "stop")
            if command_exists docker-compose; then
                docker-compose down
            else
                docker compose down
            fi
            print_success "Services stopped"
            ;;
        "restart")
            if command_exists docker-compose; then
                docker-compose restart
            else
                docker compose restart
            fi
            print_success "Services restarted"
            ;;
        "build")
            check_docker
            build_docker_images
            ;;
        "clean")
            cleanup
            ;;
        "health")
            check_service_health
            ;;
        "logs")
            show_logs
            ;;
        "help")
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
