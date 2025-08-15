# ========================================================================
# Nginx Configuration for www.cinestoryai.com
# ========================================================================
# 🎬 CineStory AI - Professional Video Editing Platform
# Production-ready configuration with SSL, caching, and security

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=early_bird:10m rate=5r/s;
limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

# Upstream backend (Supabase Edge Functions)
upstream cinestory_backend {
    server plqwkmrvwuagdymsqeqe.supabase.co:443;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name cinestoryai.com www.cinestoryai.com;
    
    # Security headers even for redirects
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://www.cinestoryai.com$request_uri;
}

# Redirect non-www to www
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name cinestoryai.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/cinestoryai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cinestoryai.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/cinestoryai.com/chain.pem;
    
    return 301 https://www.cinestoryai.com$request_uri;
}

# Main server block for www.cinestoryai.com
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.cinestoryai.com;
    
    # Document root
    root /var/www/cinestoryai/dist;
    index index.html index.htm;
    
    # ============================================================================
    # SSL CONFIGURATION
    # ============================================================================
    ssl_certificate /etc/letsencrypt/live/cinestoryai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cinestoryai.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/cinestoryai.com/chain.pem;
    
    # SSL Security Settings
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # ============================================================================
    # SECURITY HEADERS
    # ============================================================================
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # Content Security Policy
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plqwkmrvwuagdymsqeqe.supabase.co https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://plqwkmrvwuagdymsqeqe.supabase.co wss://plqwkmrvwuagdymsqeqe.supabase.co; frame-ancestors 'none';" always;
    
    # ============================================================================
    # COMPRESSION
    # ============================================================================
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        application/atom+xml
        application/javascript
        application/json
        application/ld+json
        application/manifest+json
        application/rss+xml
        application/vnd.geo+json
        application/vnd.ms-fontobject
        application/x-font-ttf
        application/x-web-app-manifest+json
        application/xhtml+xml
        application/xml
        font/opentype
        image/bmp
        image/svg+xml
        image/x-icon
        text/cache-manifest
        text/css
        text/plain
        text/vcard
        text/vnd.rim.location.xloc
        text/vtt
        text/x-component
        text/x-cross-domain-policy;
    
    # Brotli compression (if module available)
    brotli on;
    brotli_comp_level 6;
    brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # ============================================================================
    # CACHING CONFIGURATION
    # ============================================================================
    
    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|eot|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Cache-Status "STATIC";
    }
    
    # HTML files - no cache for main pages
    location ~* \.(html|htm)$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header X-Cache-Status "NO-CACHE";
    }
    
    # JSON files caching
    location ~* \.(json)$ {
        expires 1h;
        add_header Cache-Control "public";
        add_header X-Cache-Status "JSON";
    }
    
    # ============================================================================
    # API PROXY CONFIGURATION
    # ============================================================================
    
    # Early Bird API endpoints
    location /api/early-bird/ {
        limit_req zone=early_bird burst=20 nodelay;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://www.cinestoryai.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        add_header Access-Control-Allow-Credentials "true" always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://www.cinestoryai.com";
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization";
            add_header Access-Control-Max-Age 86400;
            add_header Content-Length 0;
            return 204;
        }
        
        # Proxy to Supabase
        proxy_pass https://plqwkmrvwuagdymsqeqe.supabase.co/functions/v1/make-server-b27e4aa1/api/early-bird/;
        proxy_ssl_server_name on;
        proxy_set_header Host plqwkmrvwuagdymsqeqe.supabase.co;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # Timeouts
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
        
        # Cache API responses briefly
        proxy_cache_valid 200 1m;
        add_header X-Cache-Status $upstream_cache_status;
    }
    
    # EyeMotion API endpoints
    location /api/eyemotion/ {
        limit_req zone=api burst=30 nodelay;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://www.cinestoryai.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        add_header Access-Control-Allow-Credentials "true" always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://www.cinestoryai.com";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization";
            add_header Access-Control-Max-Age 86400;
            add_header Content-Length 0;
            return 204;
        }
        
        # Proxy to Supabase
        proxy_pass https://plqwkmrvwuagdymsqeqe.supabase.co/functions/v1/make-server-b27e4aa1/api/eyemotion/;
        proxy_ssl_server_name on;
        proxy_set_header Host plqwkmrvwuagdymsqeqe.supabase.co;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # Timeouts
        proxy_connect_timeout 5s;
        proxy_send_timeout 15s;
        proxy_read_timeout 15s;
    }
    
    # Health check endpoint
    location /api/health {
        proxy_pass https://plqwkmrvwuagdymsqeqe.supabase.co/functions/v1/make-server-b27e4aa1/health;
        proxy_ssl_server_name on;
        proxy_set_header Host plqwkmrvwuagdymsqeqe.supabase.co;
        
        # Quick health checks
        proxy_connect_timeout 2s;
        proxy_send_timeout 5s;
        proxy_read_timeout 5s;
        
        add_header X-Health-Check "OK" always;
    }
    
    # ============================================================================
    # STATIC FILE SERVING
    # ============================================================================
    
    # Main application
    location / {
        limit_req zone=general burst=50 nodelay;
        
        try_files $uri $uri/ /index.html;
        
        # Add cache headers
        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options DENY;
        add_header X-XSS-Protection "1; mode=block";
    }
    
    # Favicon
    location = /favicon.ico {
        log_not_found off;
        access_log off;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Robots.txt
    location = /robots.txt {
        log_not_found off;
        access_log off;
        expires 1d;
        add_header Cache-Control "public";
    }
    
    # Sitemap
    location = /sitemap.xml {
        log_not_found off;
        access_log off;
        expires 1d;
        add_header Cache-Control "public";
    }
    
    # ============================================================================
    # SECURITY & MONITORING
    # ============================================================================
    
    # Block common attacks
    location ~* \.(git|svn|hg) {
        deny all;
    }
    
    location ~* \.(env|log|sql|bak|backup)$ {
        deny all;
    }
    
    # Block access to hidden files
    location ~ /\. {
        deny all;
    }
    
    # Status page for monitoring
    location = /nginx-status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        allow ::1;
        deny all;
    }
    
    # ============================================================================
    # LOGGING
    # ============================================================================
    access_log /var/log/nginx/cinestoryai.access.log combined;
    error_log /var/log/nginx/cinestoryai.error.log warn;
    
    # Custom log format for analytics
    log_format cinestory_analytics '$remote_addr - $remote_user [$time_local] '
                                  '"$request" $status $bytes_sent '
                                  '"$http_referer" "$http_user_agent" '
                                  '"$request_time" "$upstream_response_time"';
    
    access_log /var/log/nginx/cinestoryai.analytics.log cinestory_analytics;
}

# ========================================================================
# SUBDOMAIN CONFIGURATIONS
# ========================================================================

# API subdomain (if needed in the future)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.cinestoryai.com;
    
    ssl_certificate /etc/letsencrypt/live/cinestoryai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cinestoryai.com/privkey.pem;
    
    location / {
        proxy_pass https://plqwkmrvwuagdymsqeqe.supabase.co/functions/v1/make-server-b27e4aa1/api/;
        proxy_ssl_server_name on;
        proxy_set_header Host plqwkmrvwuagdymsqeqe.supabase.co;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}