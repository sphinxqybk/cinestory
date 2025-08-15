#!/bin/bash

# ========================================================================
# CineStory AI - One-Click Production Deployment Script
# ========================================================================
# 🎬 Deploy to www.cinestoryai.com with full production configuration
# Usage: ./deploy-cinestoryai.sh [option]
# Options: setup, deploy, update, ssl, test, backup, monitor

set -e  # Exit on any error

# ========================================================================
# CONFIGURATION
# ========================================================================
DOMAIN="cinestoryai.com"
WWW_DOMAIN="www.cinestoryai.com"
APP_NAME="CineStory AI"
PROJECT_DIR="/opt/cinestoryai"
WEB_DIR="/var/www/cinestoryai"
BACKUP_DIR="/opt/backups/cinestoryai"
LOG_FILE="/var/log/cinestoryai-deployment.log"

# Make script executable
chmod +x "$0" 2>/dev/null || true

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ========================================================================
# UTILITY FUNCTIONS
# ========================================================================

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

print_header() {
    echo -e "${PURPLE}"
    echo "========================================"
    echo "🎬 $1"
    echo "========================================"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

check_domain() {
    print_info "Checking domain resolution..."
    if ! nslookup $DOMAIN > /dev/null 2>&1; then
        print_warning "Domain $DOMAIN may not be properly configured"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "Domain $DOMAIN resolves correctly"
    fi
}

# ========================================================================
# SYSTEM SETUP
# ========================================================================

system_setup() {
    print_header "System Setup for $APP_NAME"
    
    log "Starting system setup"
    
    # Update system
    print_info "Updating system packages..."
    apt update && apt upgrade -y
    
    # Install required packages
    print_info "Installing required packages..."
    apt install -y \
        nginx \
        nodejs \
        npm \
        git \
        curl \
        wget \
        unzip \
        certbot \
        python3-certbot-nginx \
        ufw \
        fail2ban \
        htop \
        iotop \
        nethogs \
        logrotate \
        cron
    
    # Install Node.js 20.x
    print_info "Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    
    # Configure firewall
    print_info "Configuring firewall..."
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 'Nginx Full'
    ufw --force enable
    
    # Setup fail2ban
    print_info "Configuring fail2ban..."
    systemctl enable fail2ban
    systemctl start fail2ban
    
    # Create directories
    print_info "Creating project directories..."
    mkdir -p "$PROJECT_DIR"
    mkdir -p "$WEB_DIR"
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"
    
    print_success "System setup completed!"
    log "System setup completed successfully"
}

# ========================================================================
# APPLICATION DEPLOYMENT
# ========================================================================

deploy_application() {
    print_header "Deploying $APP_NAME"
    
    log "Starting application deployment"
    
    # Clone or update repository
    if [ -d "$PROJECT_DIR/.git" ]; then
        print_info "Updating existing repository..."
        cd "$PROJECT_DIR"
        git pull origin main
    else
        print_info "Cloning repository..."
        # Replace with actual repository URL
        # git clone https://github.com/your-org/cinestory.git "$PROJECT_DIR"
        print_info "Repository cloning skipped (replace with actual repo URL)"
        mkdir -p "$PROJECT_DIR"
    fi
    
    cd "$PROJECT_DIR"
    
    # Install dependencies
    print_info "Installing Node.js dependencies..."
    npm install --production
    
    # Build application
    print_info "Building application..."
    npm run build
    
    # Backup existing deployment
    if [ -d "$WEB_DIR" ]; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        print_info "Backing up existing deployment..."
        cp -r "$WEB_DIR" "${WEB_DIR}.backup.$TIMESTAMP"
    fi
    
    # Deploy new version
    print_info "Deploying new version..."
    mkdir -p "$WEB_DIR"
    cp -r dist/* "$WEB_DIR/"
    chown -R www-data:www-data "$WEB_DIR"
    chmod -R 755 "$WEB_DIR"
    
    print_success "Application deployment completed!"
    log "Application deployment completed successfully"
}

# ========================================================================
# NGINX CONFIGURATION
# ========================================================================

configure_nginx() {
    print_header "Configuring Nginx"
    
    log "Configuring Nginx for $DOMAIN"
    
    # Copy nginx configuration
    print_info "Installing Nginx configuration..."
    cp deployment/nginx-cinestoryai.conf /etc/nginx/sites-available/$DOMAIN
    
    # Enable site
    print_info "Enabling site..."
    ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    print_info "Testing Nginx configuration..."
    if nginx -t; then
        print_success "Nginx configuration is valid"
    else
        print_error "Nginx configuration has errors"
        return 1
    fi
    
    # Restart nginx
    print_info "Restarting Nginx..."
    systemctl restart nginx
    systemctl enable nginx
    
    print_success "Nginx configuration completed!"
    log "Nginx configuration completed successfully"
}

# ========================================================================
# SSL SETUP
# ========================================================================

setup_ssl() {
    print_header "Setting up SSL Certificates"
    
    log "Setting up SSL certificates for $DOMAIN"
    
    print_info "Obtaining SSL certificate from Let's Encrypt..."
    
    # Get SSL certificate
    if certbot --nginx \
        -d "$DOMAIN" \
        -d "$WWW_DOMAIN" \
        --non-interactive \
        --agree-tos \
        --email "admin@$DOMAIN" \
        --redirect; then
        
        print_success "SSL certificate obtained successfully!"
        
        # Setup auto-renewal
        print_info "Setting up SSL auto-renewal..."
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        
        # Test renewal
        print_info "Testing SSL renewal..."
        certbot renew --dry-run
        
    else
        print_error "Failed to obtain SSL certificate"
        print_warning "You may need to setup DNS records first"
        return 1
    fi
    
    print_success "SSL setup completed!"
    log "SSL setup completed successfully"
}

# ========================================================================
# TESTING
# ========================================================================

run_tests() {
    print_header "Running Deployment Tests"
    
    log "Running deployment tests"
    
    print_info "Testing main site..."
    if curl -f -s "https://$WWW_DOMAIN/" > /dev/null; then
        print_success "Main site is accessible"
    else
        print_error "Main site is not accessible"
        return 1
    fi
    
    print_info "Testing SSL configuration..."
    if curl -f -s -I "https://$WWW_DOMAIN/" | grep -q "HTTP/2 200"; then
        print_success "SSL/HTTP2 is working"
    else
        print_warning "SSL/HTTP2 may have issues"
    fi
    
    print_info "Testing API health endpoint..."
    if curl -f -s "https://$WWW_DOMAIN/api/health" > /dev/null; then
        print_success "API health endpoint is working"
    else
        print_warning "API health endpoint may have issues"
    fi
    
    print_info "Testing early bird endpoint..."
    if curl -f -s "https://$WWW_DOMAIN/api/early-bird/stats" > /dev/null; then
        print_success "Early bird API is working"
    else
        print_warning "Early bird API may have issues"
    fi
    
    # Performance test
    print_info "Testing performance..."
    LOAD_TIME=$(curl -o /dev/null -s -w '%{time_total}' "https://$WWW_DOMAIN/")
    if (( $(echo "$LOAD_TIME < 3.0" | bc -l) )); then
        print_success "Performance is good (${LOAD_TIME}s)"
    else
        print_warning "Performance is slow (${LOAD_TIME}s)"
    fi
    
    print_success "All tests completed!"
    log "Deployment tests completed"
}

# ========================================================================
# BACKUP
# ========================================================================

create_backup() {
    print_header "Creating Backup"
    
    log "Creating backup"
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/cinestoryai_backup_$TIMESTAMP.tar.gz"
    
    print_info "Creating backup archive..."
    tar -czf "$BACKUP_FILE" \
        -C / \
        "var/www/cinestoryai" \
        "etc/nginx/sites-available/$DOMAIN" \
        "etc/letsencrypt" \
        2>/dev/null || true
    
    # Cleanup old backups (keep 30 days)
    print_info "Cleaning up old backups..."
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete
    
    print_success "Backup created: $BACKUP_FILE"
    log "Backup created: $BACKUP_FILE"
}

# ========================================================================
# MONITORING SETUP
# ========================================================================

setup_monitoring() {
    print_header "Setting up Monitoring"
    
    log "Setting up monitoring"
    
    # Create monitoring script
    cat > /usr/local/bin/cinestoryai-monitor.sh << 'EOF'
#!/bin/bash
DOMAIN="www.cinestoryai.com"
LOG_FILE="/var/log/cinestoryai-monitor.log"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Check if site is up
if curl -f -s "https://$DOMAIN/" > /dev/null; then
    log "✅ Main site is UP"
else
    log "❌ Main site is DOWN"
    # Send alert (configure email/slack here)
fi

# Check API health
if curl -f -s "https://$DOMAIN/api/health" > /dev/null; then
    log "✅ API is UP"
else
    log "❌ API is DOWN"
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    log "⚠️ Disk usage is high: ${DISK_USAGE}%"
fi

# Check memory usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$MEM_USAGE" -gt 90 ]; then
    log "⚠️ Memory usage is high: ${MEM_USAGE}%"
fi
EOF

    chmod +x /usr/local/bin/cinestoryai-monitor.sh
    
    # Setup cron job for monitoring
    print_info "Setting up monitoring cron job..."
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/cinestoryai-monitor.sh") | crontab -
    
    # Setup log rotation
    cat > /etc/logrotate.d/cinestoryai << EOF
/var/log/cinestoryai*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
EOF
    
    print_success "Monitoring setup completed!"
    log "Monitoring setup completed"
}

# ========================================================================
# MAIN MENU
# ========================================================================

show_menu() {
    print_header "$APP_NAME - Deployment Menu"
    echo -e "${CYAN}1. Full Setup (New Installation)${NC}"
    echo -e "${BLUE}2. Deploy Application Only${NC}"
    echo -e "${GREEN}3. Update Application${NC}"
    echo -e "${YELLOW}4. Setup SSL Certificate${NC}"
    echo -e "${PURPLE}5. Run Tests${NC}"
    echo -e "${CYAN}6. Create Backup${NC}"
    echo -e "${BLUE}7. Setup Monitoring${NC}"
    echo -e "${RED}8. Exit${NC}"
    echo ""
    read -p "Choose an option (1-8): " choice
}

# ========================================================================
# MAIN EXECUTION
# ========================================================================

main() {
    # Create log file
    touch "$LOG_FILE"
    
    print_header "$APP_NAME Deployment Script"
    print_info "Domain: $WWW_DOMAIN"
    print_info "Log file: $LOG_FILE"
    echo ""
    
    # Handle command line arguments
    case "${1:-menu}" in
        "setup"|"full")
            check_root
            check_domain
            system_setup
            deploy_application
            configure_nginx
            setup_ssl
            setup_monitoring
            run_tests
            create_backup
            print_success "🎉 Full deployment completed!"
            print_info "Visit: https://$WWW_DOMAIN"
            ;;
        "deploy")
            check_root
            deploy_application
            configure_nginx
            ;;
        "update")
            check_root
            create_backup
            deploy_application
            run_tests
            ;;
        "ssl")
            check_root
            setup_ssl
            ;;
        "test")
            run_tests
            ;;
        "backup")
            check_root
            create_backup
            ;;
        "monitor")
            check_root
            setup_monitoring
            ;;
        "menu")
            while true; do
                show_menu
                case $choice in
                    1)
                        check_root
                        check_domain
                        system_setup
                        deploy_application
                        configure_nginx
                        setup_ssl
                        setup_monitoring
                        run_tests
                        create_backup
                        print_success "🎉 Full deployment completed!"
                        print_info "Visit: https://$WWW_DOMAIN"
                        break
                        ;;
                    2)
                        check_root
                        deploy_application
                        configure_nginx
                        ;;
                    3)
                        check_root
                        create_backup
                        deploy_application
                        run_tests
                        ;;
                    4)
                        check_root
                        setup_ssl
                        ;;
                    5)
                        run_tests
                        ;;
                    6)
                        check_root
                        create_backup
                        ;;
                    7)
                        check_root
                        setup_monitoring
                        ;;
                    8)
                        print_info "Goodbye!"
                        exit 0
                        ;;
                    *)
                        print_error "Invalid option. Please choose 1-8."
                        ;;
                esac
                echo ""
                read -p "Press Enter to continue..."
            done
            ;;
        *)
            echo "Usage: $0 {setup|deploy|update|ssl|test|backup|monitor|menu}"
            echo ""
            echo "Commands:"
            echo "  setup   - Full installation (system setup + deployment)"
            echo "  deploy  - Deploy application only"
            echo "  update  - Update existing deployment"
            echo "  ssl     - Setup SSL certificate"
            echo "  test    - Run deployment tests"
            echo "  backup  - Create backup"
            echo "  monitor - Setup monitoring"
            echo "  menu    - Show interactive menu"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"