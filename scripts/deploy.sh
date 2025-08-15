#!/bin/bash

# CineStory Production Deployment Script
# Usage: ./scripts/deploy.sh [environment] [action]
# Example: ./scripts/deploy.sh production deploy
# Example: ./scripts/deploy.sh staging rollback

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOYMENT_DIR="$PROJECT_ROOT/deployment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-production}
ACTION=${2:-deploy}
COMPOSE_FILE="$DEPLOYMENT_DIR/docker-compose.yml"
ENV_FILE="$DEPLOYMENT_DIR/.env.${ENVIRONMENT}"

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if environment file exists
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file $ENV_FILE not found."
        error "Please copy $DEPLOYMENT_DIR/.env.production and configure it."
        exit 1
    fi
    
    # Check if we're in the right directory
    if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        error "Not in CineStory project root directory."
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Load environment variables
load_environment() {
    log "Loading environment variables for $ENVIRONMENT..."
    
    # Export environment variables
    set -a
    source "$ENV_FILE"
    set +a
    
    # Validate critical environment variables
    local required_vars=(
        "CINESTORY_API_KEY"
        "DATABASE_URL"
        "REDIS_URL"
        "JWT_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    success "Environment variables loaded"
}

# Health check function
health_check() {
    log "Performing health check..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log "Health check attempt $attempt/$max_attempts"
        
        # Check if services are running
        if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
            # Check API health endpoint
            if curl -sf "http://localhost:3001/health" > /dev/null 2>&1; then
                success "Health check passed"
                return 0
            fi
        fi
        
        sleep 10
        ((attempt++))
    done
    
    error "Health check failed after $max_attempts attempts"
    return 1
}

# Backup function
create_backup() {
    log "Creating backup..."
    
    local backup_dir="$PROJECT_ROOT/backups"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$backup_dir/cinestory_backup_${timestamp}.sql"
    
    # Create backup directory if it doesn't exist
    mkdir -p "$backup_dir"
    
    # Create database backup
    if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U "$DB_USER" cinestory > "$backup_file"; then
        success "Database backup created: $backup_file"
    else
        error "Failed to create database backup"
        return 1
    fi
    
    # Compress backup
    if gzip "$backup_file"; then
        success "Backup compressed: ${backup_file}.gz"
    else
        warning "Failed to compress backup"
    fi
    
    # Clean old backups (keep last 10)
    find "$backup_dir" -name "cinestory_backup_*.sql.gz" -type f | sort -r | tail -n +11 | xargs -r rm
    
    return 0
}

# Deploy function
deploy() {
    log "Starting deployment to $ENVIRONMENT..."
    
    # Create backup before deployment
    if [[ "$ENVIRONMENT" == "production" ]]; then
        create_backup || {
            error "Backup failed, aborting deployment"
            exit 1
        }
    fi
    
    # Pull latest images
    log "Pulling latest Docker images..."
    docker-compose -f "$COMPOSE_FILE" pull
    
    # Build custom images
    log "Building custom images..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    
    # Run database migrations
    log "Running database migrations..."
    docker-compose -f "$COMPOSE_FILE" run --rm cinestory-api npm run migration:run || {
        error "Database migration failed"
        exit 1
    }
    
    # Start services
    log "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 30
    
    # Perform health check
    if health_check; then
        success "Deployment completed successfully"
    else
        error "Deployment failed health check"
        log "Rolling back..."
        rollback
        exit 1
    fi
    
    # Clean up old Docker images
    log "Cleaning up old Docker images..."
    docker image prune -f
    
    success "Deployment to $ENVIRONMENT completed successfully"
}

# Rollback function
rollback() {
    log "Starting rollback..."
    
    # Stop current services
    log "Stopping current services..."
    docker-compose -f "$COMPOSE_FILE" down
    
    # Restore from latest backup
    local backup_dir="$PROJECT_ROOT/backups"
    local latest_backup=$(find "$backup_dir" -name "cinestory_backup_*.sql.gz" -type f | sort -r | head -1)
    
    if [[ -n "$latest_backup" ]]; then
        log "Restoring from backup: $latest_backup"
        
        # Start only database service
        docker-compose -f "$COMPOSE_FILE" up -d postgres redis
        sleep 10
        
        # Restore database
        gunzip -c "$latest_backup" | docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U "$DB_USER" cinestory
        
        # Start all services
        docker-compose -f "$COMPOSE_FILE" up -d
        
        # Wait and health check
        sleep 30
        if health_check; then
            success "Rollback completed successfully"
        else
            error "Rollback failed"
            exit 1
        fi
    else
        error "No backup found for rollback"
        exit 1
    fi
}

# Status function
status() {
    log "Checking service status..."
    
    # Show running containers
    echo -e "\n${BLUE}Running Containers:${NC}"
    docker-compose -f "$COMPOSE_FILE" ps
    
    # Show resource usage
    echo -e "\n${BLUE}Resource Usage:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    
    # Show logs for key services
    echo -e "\n${BLUE}Recent Logs (last 10 lines):${NC}"
    docker-compose -f "$COMPOSE_FILE" logs --tail=10 cinestory-api cinestory-frontend
}

# Logs function
logs() {
    local service=${3:-}
    
    if [[ -n "$service" ]]; then
        log "Showing logs for service: $service"
        docker-compose -f "$COMPOSE_FILE" logs -f "$service"
    else
        log "Showing logs for all services"
        docker-compose -f "$COMPOSE_FILE" logs -f
    fi
}

# Scale function
scale() {
    local service=${3:-cinestory-api}
    local replicas=${4:-2}
    
    log "Scaling $service to $replicas replicas..."
    docker-compose -f "$COMPOSE_FILE" up -d --scale "$service=$replicas"
    
    success "Scaled $service to $replicas replicas"
}

# Stop function
stop() {
    log "Stopping all services..."
    docker-compose -f "$COMPOSE_FILE" down
    success "All services stopped"
}

# Restart function
restart() {
    log "Restarting all services..."
    docker-compose -f "$COMPOSE_FILE" restart
    
    # Wait and health check
    sleep 30
    if health_check; then
        success "All services restarted successfully"
    else
        error "Service restart failed health check"
        exit 1
    fi
}

# Update function
update() {
    log "Updating services with zero downtime..."
    
    # Create backup first
    create_backup || {
        error "Backup failed, aborting update"
        exit 1
    }
    
    # Pull latest images
    docker-compose -f "$COMPOSE_FILE" pull
    
    # Update services one by one
    local services=("cinestory-api" "cinestory-frontend" "cinestory-websocket" "cinestory-automation")
    
    for service in "${services[@]}"; do
        log "Updating $service..."
        docker-compose -f "$COMPOSE_FILE" up -d --no-deps "$service"
        sleep 10
        
        # Health check for the specific service
        if ! curl -sf "http://localhost:3001/health" > /dev/null 2>&1; then
            error "Health check failed for $service"
            exit 1
        fi
    done
    
    success "Zero-downtime update completed"
}

# Main execution
main() {
    log "CineStory Deployment Script"
    log "Environment: $ENVIRONMENT"
    log "Action: $ACTION"
    
    check_prerequisites
    load_environment
    
    case "$ACTION" in
        deploy)
            deploy
            ;;
        rollback)
            rollback
            ;;
        status)
            status
            ;;
        logs)
            logs "$@"
            ;;
        scale)
            scale "$@"
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        update)
            update
            ;;
        backup)
            create_backup
            ;;
        health)
            health_check
            ;;
        *)
            error "Unknown action: $ACTION"
            echo "Available actions: deploy, rollback, status, logs, scale, stop, restart, update, backup, health"
            exit 1
            ;;
    esac
}

# Show usage if no arguments
if [[ $# -eq 0 ]]; then
    echo "Usage: $0 [environment] [action] [options]"
    echo ""
    echo "Environments: production, staging, development"
    echo "Actions:"
    echo "  deploy    - Deploy the application"
    echo "  rollback  - Rollback to previous version"
    echo "  status    - Show service status"
    echo "  logs      - Show service logs"
    echo "  scale     - Scale services"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart all services"
    echo "  update    - Zero-downtime update"
    echo "  backup    - Create database backup"
    echo "  health    - Run health check"
    echo ""
    echo "Examples:"
    echo "  $0 production deploy"
    echo "  $0 staging rollback"
    echo "  $0 production logs cinestory-api"
    echo "  $0 production scale cinestory-api 3"
    exit 0
fi

# Run main function
main "$@"