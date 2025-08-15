# ========================================================================
# Docker Compose Configuration for www.cinestoryai.com
# ========================================================================
# 🎬 CineStory AI - Professional Video Editing Platform
# Production deployment with Nginx, SSL, and monitoring

version: '3.8'

services:
  # ============================================================================
  # NGINX REVERSE PROXY & SSL TERMINATION
  # ============================================================================
  nginx:
    image: nginx:1.25-alpine
    container_name: cinestoryai-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      # Nginx configuration
      - ./nginx-cinestoryai.conf:/etc/nginx/conf.d/default.conf:ro
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      
      # SSL certificates (Let's Encrypt)
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /var/lib/letsencrypt:/var/lib/letsencrypt:ro
      
      # Static files
      - ./dist:/var/www/cinestoryai/dist:ro
      
      # Logs
      - ./logs/nginx:/var/log/nginx
      
      # Cache directory
      - nginx_cache:/var/cache/nginx
      
    depends_on:
      - cinestoryai-app
    environment:
      - TZ=UTC
    networks:
      - cinestoryai-network
    labels:
      - "com.centurylinklabs.watchtower.enable=true"
      - "traefik.enable=false"
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # ============================================================================
  # CINESTORY REACT APPLICATION
  # ============================================================================
  cinestoryai-app:
    build:
      context: ..
      dockerfile: deployment/Dockerfile.production
      args:
        - NODE_ENV=production
        - DOMAIN=cinestoryai.com
    container_name: cinestoryai-app
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DOMAIN=cinestoryai.com
      - API_URL=https://api.cinestoryai.com
      
      # Supabase configuration
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      
      # Feature flags
      - ENABLE_EARLY_BIRD=true
      - ENABLE_EYEMOTION=true
      - ENABLE_ANALYTICS=true
      
    volumes:
      # Application logs
      - ./logs/app:/app/logs
      
      # Upload directory (for future use)
      - app_uploads:/app/uploads
      
      # Environment file
      - ./cinestoryai-production.env:/app/.env.production:ro
      
    expose:
      - "3000"
    networks:
      - cinestoryai-network
    labels:
      - "com.centurylinklabs.watchtower.enable=true"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ============================================================================
  # REDIS CACHE (Optional - for session storage)
  # ============================================================================
  redis:
    image: redis:7-alpine
    container_name: cinestoryai-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-cinestory_redis_pass}
    volumes:
      - redis_data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf:ro
    expose:
      - "6379"
    networks:
      - cinestoryai-network
    environment:
      - TZ=UTC
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "5m"
        max-file: "2"

  # ============================================================================
  # SSL CERTIFICATE MANAGEMENT
  # ============================================================================
  certbot:
    image: certbot/certbot:latest
    container_name: cinestoryai-certbot
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt
      - /var/lib/letsencrypt:/var/lib/letsencrypt
      - ./dist:/var/www/cinestoryai/dist
    command: >
      sh -c "
        certbot certonly --webroot 
        --webroot-path=/var/www/cinestoryai/dist 
        --email admin@cinestoryai.com 
        --agree-tos 
        --no-eff-email 
        --domains cinestoryai.com,www.cinestoryai.com,api.cinestoryai.com
        --keep-until-expiring
      "
    depends_on:
      - nginx
    profiles:
      - ssl-setup

  # ============================================================================
  # MONITORING & HEALTH CHECK
  # ============================================================================
  healthcheck:
    image: curlimages/curl:latest
    container_name: cinestoryai-healthcheck
    restart: unless-stopped
    command: >
      sh -c "
        while true; do
          echo '[Health Check] Testing www.cinestoryai.com...'
          
          # Test main site
          if curl -f -s https://www.cinestoryai.com/ > /dev/null; then
            echo '[✅] Main site is healthy'
          else
            echo '[❌] Main site is down!'
          fi
          
          # Test API health
          if curl -f -s https://www.cinestoryai.com/api/health > /dev/null; then
            echo '[✅] API is healthy'
          else
            echo '[❌] API is down!'
          fi
          
          # Test early bird endpoint
          if curl -f -s https://www.cinestoryai.com/api/early-bird/stats > /dev/null; then
            echo '[✅] Early Bird API is healthy'
          else
            echo '[❌] Early Bird API is down!'
          fi
          
          sleep 300  # Check every 5 minutes
        done
      "
    networks:
      - cinestoryai-network
    profiles:
      - monitoring

  # ============================================================================
  # LOG ROTATION & CLEANUP
  # ============================================================================
  logrotate:
    image: alpine:latest
    container_name: cinestoryai-logrotate
    restart: unless-stopped
    volumes:
      - ./logs:/var/log/cinestoryai
      - ./logrotate.conf:/etc/logrotate.conf:ro
    command: >
      sh -c "
        while true; do
          echo '[Log Rotation] Running logrotate...'
          logrotate /etc/logrotate.conf
          sleep 86400  # Run daily
        done
      "
    profiles:
      - maintenance

  # ============================================================================
  # BACKUP SERVICE
  # ============================================================================
  backup:
    image: alpine:latest
    container_name: cinestoryai-backup
    restart: unless-stopped
    volumes:
      - ./logs:/backup/logs:ro
      - ./dist:/backup/app:ro
      - /etc/letsencrypt:/backup/ssl:ro
      - backup_data:/backup/output
    environment:
      - BACKUP_SCHEDULE=${BACKUP_SCHEDULE:-0 2 * * *}
      - BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
    command: >
      sh -c "
        while true; do
          echo '[Backup] Creating backup archive...'
          DATE=$$(date +%Y%m%d_%H%M%S)
          tar -czf /backup/output/cinestoryai_backup_$$DATE.tar.gz /backup/logs /backup/app /backup/ssl
          
          # Cleanup old backups
          find /backup/output -name '*.tar.gz' -mtime +$$BACKUP_RETENTION_DAYS -delete
          
          echo '[Backup] Backup completed: cinestoryai_backup_$$DATE.tar.gz'
          sleep 86400  # Run daily
        done
      "
    profiles:
      - backup

# ============================================================================
# NETWORKS
# ============================================================================
networks:
  cinestoryai-network:
    driver: bridge
    name: cinestoryai-network

# ============================================================================
# VOLUMES
# ============================================================================
volumes:
  nginx_cache:
    name: cinestoryai_nginx_cache
  redis_data:
    name: cinestoryai_redis_data
  app_uploads:
    name: cinestoryai_app_uploads
  backup_data:
    name: cinestoryai_backup_data

# ============================================================================
# PRODUCTION DEPLOYMENT COMMANDS
# ============================================================================
# 
# Initial setup:
# 1. docker-compose -f docker-compose-cinestoryai.yml --profile ssl-setup up certbot
# 2. docker-compose -f docker-compose-cinestoryai.yml up -d
# 
# With monitoring:
# docker-compose -f docker-compose-cinestoryai.yml --profile monitoring up -d
# 
# With backup:
# docker-compose -f docker-compose-cinestoryai.yml --profile backup up -d
# 
# Full production setup:
# docker-compose -f docker-compose-cinestoryai.yml --profile monitoring --profile backup up -d
# 
# SSL renewal:
# docker-compose -f docker-compose-cinestoryai.yml --profile ssl-setup run --rm certbot renew
# 
# Health check:
# docker-compose -f docker-compose-cinestoryai.yml logs healthcheck
# 
# Update application:
# docker-compose -f docker-compose-cinestoryai.yml build cinestoryai-app
# docker-compose -f docker-compose-cinestoryai.yml up -d cinestoryai-app
#