# CineStory Production Environment Variables
# Copy this file to .env.production and update with your actual values

# =============================================================================
# BASIC CONFIGURATION
# =============================================================================
NODE_ENV=production
PORT=3000

# =============================================================================
# CINESTORY API CONFIGURATION
# =============================================================================
CINESTORY_API_URL=https://api.cinestory.app/v1
CINESTORY_WS_URL=wss://ws.cinestory.app/v1
AUTOMATION_API_URL=https://automation.cinestory.app/v1

# API Authentication
CINESTORY_API_KEY=your_production_api_key_here
CINESTORY_STAGING_API_KEY=your_staging_api_key_here

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
DATABASE_URL=postgresql://user:password@postgres:5432/cinestory
DB_USER=cinestory_user
DB_PASSWORD=secure_password_here
DB_NAME=cinestory
DB_HOST=postgres
DB_PORT=5432

# =============================================================================
# REDIS CONFIGURATION
# =============================================================================
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=secure_redis_password

# =============================================================================
# SUPABASE CONFIGURATION (Optional)
# =============================================================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# =============================================================================
# AUTHENTICATION & SECURITY
# =============================================================================
JWT_SECRET=your_super_secure_jwt_secret_here
SESSION_SECRET=your_session_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key

# =============================================================================
# FILE STORAGE & MEDIA
# =============================================================================
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=cinestory-media-production

# Alternative: Local storage
MEDIA_STORAGE_PATH=/app/media
TEMP_STORAGE_PATH=/app/temp

# =============================================================================
# MONITORING & LOGGING
# =============================================================================
LOG_LEVEL=info
LOG_FILE_PATH=/app/logs/cinestory.log

# Monitoring
GRAFANA_PASSWORD=secure_grafana_password
PROMETHEUS_RETENTION=15d

# Error Tracking (Optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# =============================================================================
# PERFORMANCE & SCALING
# =============================================================================
MAX_CONCURRENT_JOBS=10
WORKER_THREADS=4
GPU_ENABLED=false

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# =============================================================================
# FEATURE FLAGS
# =============================================================================
ENABLE_ANALYTICS=true
ENABLE_REAL_TIME_UPDATES=true
ENABLE_AUTOMATION=true
ENABLE_ECOSYSTEM=true
ENABLE_DEBUG_MODE=false

# =============================================================================
# EXTERNAL SERVICES
# =============================================================================
# Email Service (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# Notification Services (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK

# =============================================================================
# SSL CERTIFICATES (for HTTPS)
# =============================================================================
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem

# =============================================================================
# BACKUP CONFIGURATION
# =============================================================================
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=cinestory-backups

# =============================================================================
# DOMAIN CONFIGURATION
# =============================================================================
DOMAIN=cinestory.app
API_DOMAIN=api.cinestory.app
WS_DOMAIN=ws.cinestory.app
AUTOMATION_DOMAIN=automation.cinestory.app

# =============================================================================
# DEVELOPMENT OVERRIDES (for staging)
# =============================================================================
# Uncomment these for staging environment
# CINESTORY_API_URL=https://staging-api.cinestory.app/v1
# CINESTORY_WS_URL=wss://staging-ws.cinestory.app/v1
# AUTOMATION_API_URL=https://staging-automation.cinestory.app/v1