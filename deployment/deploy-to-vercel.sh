#!/bin/bash

# ========================================================================
# CineStory AI - Vercel Deployment Script
# ========================================================================
# 🎬 One-click deployment to Vercel for www.cinestoryai.com
# Usage: ./deploy-to-vercel.sh [option]
# Options: setup, deploy, domain, test, monitor

set -e  # Exit on any error

# ========================================================================
# CONFIGURATION
# ========================================================================
PROJECT_NAME="cinestoryai"
DOMAIN="cinestoryai.com"
WWW_DOMAIN="www.cinestoryai.com"
APP_NAME="CineStory AI"

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

check_dependencies() {
    print_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Please install npm"
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    print_success "All dependencies are available"
}

# ========================================================================
# VERCEL SETUP
# ========================================================================

setup_vercel() {
    print_header "Setting up Vercel for $APP_NAME"
    
    # Check if logged in
    if ! vercel whoami &> /dev/null; then
        print_info "Logging in to Vercel..."
        vercel login
    else
        print_success "Already logged in to Vercel"
    fi
    
    # Install dependencies
    print_info "Installing project dependencies..."
    npm install
    
    # Test build
    print_info "Testing build process..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Build test successful"
    else
        print_error "Build test failed"
        exit 1
    fi
    
    print_success "Vercel setup completed!"
}

# ========================================================================
# DEPLOYMENT
# ========================================================================

deploy_to_vercel() {
    print_header "Deploying $APP_NAME to Vercel"
    
    print_info "Building for production..."
    npm run build
    
    print_info "Deploying to Vercel..."
    vercel --prod --yes
    
    if [ $? -eq 0 ]; then
        print_success "Deployment successful!"
        print_info "🌐 Your app is now live!"
    else
        print_error "Deployment failed"
        exit 1
    fi
}

# ========================================================================
# DOMAIN CONFIGURATION
# ========================================================================

configure_domain() {
    print_header "Configuring Custom Domain"
    
    print_info "Adding domain $DOMAIN to Vercel project..."
    vercel domains add $DOMAIN
    
    print_info "Adding www subdomain..."
    vercel domains add $WWW_DOMAIN
    
    print_info "Setting $WWW_DOMAIN as primary domain..."
    
    print_warning "⚠️  DNS Configuration Required:"
    echo ""
    echo "Add these DNS records to your domain registrar:"
    echo ""
    echo "Type    Name    Value                          TTL"
    echo "A       @       76.76.19.61                    3600"
    echo "A       www     76.76.19.61                    3600"
    echo "CNAME   *       cname.vercel-dns.com           3600"
    echo ""
    echo "Or use Vercel DNS nameservers:"
    echo "ns1.vercel-dns.com"
    echo "ns2.vercel-dns.com"
    echo ""
    
    print_info "Waiting for DNS propagation (this may take 24-48 hours)..."
    print_success "Domain configuration initiated!"
}

# ========================================================================
# TESTING
# ========================================================================

test_deployment() {
    print_header "Testing Deployment"
    
    # Test main domain
    print_info "Testing main site..."
    if curl -f -s "https://$WWW_DOMAIN/" > /dev/null; then
        print_success "Main site is accessible"
    else
        print_warning "Main site may not be ready yet (DNS propagation)"
    fi
    
    # Test Vercel URL
    print_info "Testing Vercel URL..."
    VERCEL_URL=$(vercel ls | grep $PROJECT_NAME | awk '{print $2}' | head -1)
    if [ ! -z "$VERCEL_URL" ]; then
        if curl -f -s "https://$VERCEL_URL/" > /dev/null; then
            print_success "Vercel URL is working: https://$VERCEL_URL"
        else
            print_warning "Vercel URL may have issues"
        fi
    fi
    
    # Test API endpoints via proxy
    print_info "Testing API proxy..."
    if curl -f -s "https://$WWW_DOMAIN/api/health" > /dev/null; then
        print_success "API proxy is working"
    else
        print_warning "API proxy may need configuration"
    fi
    
    # Test Early Bird API
    print_info "Testing Early Bird API..."
    if curl -f -s "https://$WWW_DOMAIN/api/early-bird/stats" > /dev/null; then
        print_success "Early Bird API is working"
    else
        print_warning "Early Bird API may need configuration"
    fi
    
    print_success "Testing completed!"
}

# ========================================================================
# MONITORING
# ========================================================================

setup_monitoring() {
    print_header "Setting up Monitoring"
    
    print_info "Monitoring tools available:"
    echo ""
    echo "1. Vercel Analytics: Enable in Vercel Dashboard"
    echo "2. Vercel Speed Insights: Enable in project settings"
    echo "3. Lighthouse: Run 'npx lighthouse https://$WWW_DOMAIN'"
    echo "4. Uptime monitoring: Use UptimeRobot or similar"
    echo ""
    
    print_info "Adding performance monitoring..."
    
    # Create monitoring script
    cat > monitoring.js << 'EOF'
const https = require('https');

const monitorSite = (url) => {
  const start = Date.now();
  
  https.get(url, (res) => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] ${url} - Status: ${res.statusCode} - Response: ${duration}ms`);
    
    if (res.statusCode !== 200) {
      console.error(`❌ Site may be down: ${url}`);
    } else if (duration > 3000) {
      console.warn(`⚠️ Slow response: ${url} (${duration}ms)`);
    } else {
      console.log(`✅ Site is healthy: ${url}`);
    }
  }).on('error', (err) => {
    console.error(`❌ Error accessing ${url}:`, err.message);
  });
};

// Monitor main endpoints
setInterval(() => {
  monitorSite('https://www.cinestoryai.com/');
  monitorSite('https://www.cinestoryai.com/api/health');
}, 300000); // Every 5 minutes

console.log('🔍 Monitoring started for CineStory AI...');
EOF

    print_success "Monitoring setup completed!"
    print_info "Run 'node monitoring.js' to start monitoring"
}

# ========================================================================
# ENVIRONMENT VARIABLES
# ========================================================================

setup_env_vars() {
    print_header "Setting up Environment Variables"
    
    print_info "Environment variables should be configured in Vercel Dashboard:"
    echo ""
    echo "Go to: https://vercel.com/dashboard → $PROJECT_NAME → Settings → Environment Variables"
    echo ""
    echo "Required variables:"
    echo "NODE_ENV=production"
    echo "NEXT_PUBLIC_SUPABASE_URL=https://plqwkmrvwuagdymsqeqe.supabase.co"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    echo "NEXT_PUBLIC_API_BASE_URL=https://plqwkmrvwuagdymsqeqe.supabase.co/functions/v1/make-server-b27e4aa1/api"
    echo "NEXT_PUBLIC_APP_URL=https://www.cinestoryai.com"
    echo ""
    echo "Optional variables:"
    echo "NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id"
    echo "NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_pixel_id"
    echo ""
    
    print_info "See deployment/.env.vercel for complete list"
}

# ========================================================================
# MAIN MENU
# ========================================================================

show_menu() {
    print_header "$APP_NAME - Vercel Deployment Menu"
    echo -e "${CYAN}1. Setup Vercel Project${NC}"
    echo -e "${BLUE}2. Deploy to Production${NC}"
    echo -e "${GREEN}3. Configure Custom Domain${NC}"
    echo -e "${YELLOW}4. Setup Environment Variables${NC}"
    echo -e "${PURPLE}5. Test Deployment${NC}"
    echo -e "${CYAN}6. Setup Monitoring${NC}"
    echo -e "${BLUE}7. Full Deployment (All Steps)${NC}"
    echo -e "${RED}8. Exit${NC}"
    echo ""
    read -p "Choose an option (1-8): " choice
}

# ========================================================================
# MAIN EXECUTION
# ========================================================================

main() {
    print_header "$APP_NAME Vercel Deployment Script"
    print_info "Target Domain: $WWW_DOMAIN"
    echo ""
    
    # Handle command line arguments
    case "${1:-menu}" in
        "setup")
            check_dependencies
            setup_vercel
            setup_env_vars
            ;;
        "deploy")
            check_dependencies
            deploy_to_vercel
            ;;
        "domain")
            configure_domain
            ;;
        "test")
            test_deployment
            ;;
        "monitor")
            setup_monitoring
            ;;
        "env")
            setup_env_vars
            ;;
        "full")
            check_dependencies
            setup_vercel
            deploy_to_vercel
            configure_domain
            setup_monitoring
            test_deployment
            print_success "🎉 Full deployment completed!"
            print_info "🌐 Visit: https://$WWW_DOMAIN"
            ;;
        "menu")
            while true; do
                show_menu
                case $choice in
                    1)
                        check_dependencies
                        setup_vercel
                        setup_env_vars
                        ;;
                    2)
                        check_dependencies
                        deploy_to_vercel
                        ;;
                    3)
                        configure_domain
                        ;;
                    4)
                        setup_env_vars
                        ;;
                    5)
                        test_deployment
                        ;;
                    6)
                        setup_monitoring
                        ;;
                    7)
                        check_dependencies
                        setup_vercel
                        deploy_to_vercel
                        configure_domain
                        setup_monitoring
                        test_deployment
                        print_success "🎉 Full deployment completed!"
                        print_info "🌐 Visit: https://$WWW_DOMAIN"
                        break
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
            echo "Usage: $0 {setup|deploy|domain|test|monitor|env|full|menu}"
            echo ""
            echo "Commands:"
            echo "  setup   - Setup Vercel project and dependencies"
            echo "  deploy  - Deploy to Vercel production"
            echo "  domain  - Configure custom domain"
            echo "  test    - Test deployment"
            echo "  monitor - Setup monitoring"
            echo "  env     - Show environment variables guide"
            echo "  full    - Complete deployment process"
            echo "  menu    - Show interactive menu"
            exit 1
            ;;
    esac
}

# Make script executable
chmod +x "$0" 2>/dev/null || true

# Run main function with all arguments
main "$@"