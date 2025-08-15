# ========================================================================
# CineStory AI Production Environment - www.cinestoryai.com
# ========================================================================
# 🎬 Professional AI Video Editing Platform
# For deployment to cinestoryai.com domain

# ========================================================================
# BASIC CONFIGURATION
# ========================================================================
NODE_ENV=production
PORT=3000
APP_NAME=CineStory
APP_VERSION=1.0.0

# ========================================================================
# DOMAIN CONFIGURATION - cinestoryai.com
# ========================================================================
DOMAIN=cinestoryai.com
MAIN_URL=https://www.cinestoryai.com
API_URL=https://api.cinestoryai.com
CDN_URL=https://cdn.cinestoryai.com
ASSETS_URL=https://assets.cinestoryai.com

# Early Bird Landing Page
LANDING_PAGE_URL=https://www.cinestoryai.com
EARLY_BIRD_API=https://api.cinestoryai.com/v1/early-bird

# ========================================================================
# SUPABASE CONFIGURATION (Current Backend)
# ========================================================================
SUPABASE_URL=https://plqwkmrvwuagdymsqeqe.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBscXdrbXJ2d3VhZ2R5bXNxZXFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwMDk0MjksImV4cCI6MjA1MjU4NTQyOX0.nSIb7dCFZ9iKhc4_dSqOcNX8O6B9Kb_aKSlA-1VDZmc
SUPABASE_SERVICE_ROLE_KEY=production_service_role_key_here

# Backend API Endpoints
API_BASE_URL=https://plqwkmrvwuagdymsqeqe.supabase.co/functions/v1/make-server-b27e4aa1/api
BACKEND_HEALTH_CHECK=https://plqwkmrvwuagdymsqeqe.supabase.co/functions/v1/make-server-b27e4aa1/health

# ========================================================================
# SECURITY & SSL
# ========================================================================
FORCE_SSL=true
SECURE_COOKIES=true
CORS_ORIGIN=https://www.cinestoryai.com,https://cinestoryai.com
CORS_CREDENTIALS=true

# SSL Certificates (Let's Encrypt recommended)
SSL_CERT_PATH=/etc/letsencrypt/live/cinestoryai.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/cinestoryai.com/privkey.pem

# ========================================================================
# RATE LIMITING & PERFORMANCE
# ========================================================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_EARLY_BIRD=100

# Cache Configuration
CACHE_TTL=3600
CDN_CACHE_TTL=86400
STATIC_CACHE_TTL=604800

# ========================================================================
# MONITORING & ANALYTICS
# ========================================================================
LOG_LEVEL=info
LOG_FORMAT=json
ENABLE_ACCESS_LOGS=true
ENABLE_ERROR_TRACKING=true

# Analytics (Optional - Add your keys)
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID_HERE
FACEBOOK_PIXEL_ID=FB_PIXEL_ID_HERE
HOTJAR_ID=HOTJAR_ID_HERE

# Error Tracking (Optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# ========================================================================
# EMAIL & NOTIFICATIONS
# ========================================================================
# SMTP Configuration for early bird notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=noreply@cinestoryai.com
SMTP_PASS=your_email_app_password

# Email Templates
FROM_EMAIL=CineStory Team <noreply@cinestoryai.com>
SUPPORT_EMAIL=support@cinestoryai.com
EARLY_BIRD_EMAIL_TEMPLATE=early-bird-welcome

# ========================================================================
# FEATURE FLAGS
# ========================================================================
ENABLE_EARLY_BIRD=true
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_REAL_TIME_STATS=true
ENABLE_ANALYTICS=true
ENABLE_HEALTH_CHECK=true
ENABLE_MAINTENANCE_MODE=false

# EyeMotion Features
ENABLE_EYEMOTION_REGISTRATION=true
ENABLE_EYEMOTION_LOGIN=true
ENABLE_MEMBER_DASHBOARD=true

# ========================================================================
# SOCIAL MEDIA & MARKETING
# ========================================================================
FACEBOOK_URL=https://facebook.com/cinestoryai
TWITTER_URL=https://twitter.com/cinestoryai
DISCORD_URL=https://discord.gg/cinestoryai
BLOG_URL=https://cinestoryai.com/blog
COMMUNITY_URL=https://cinestoryai.com/community

# ========================================================================
# BACKUP & DISASTER RECOVERY
# ========================================================================
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30

# ========================================================================
# REDIS CACHE (Optional - for session storage)
# ========================================================================
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=cinestory:prod:
REDIS_TTL=3600

# ========================================================================
# FILE STORAGE (for future media uploads)
# ========================================================================
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_S3_BUCKET=cinestoryai-assets-prod
AWS_S3_PUBLIC_BUCKET=cinestoryai-public-prod
AWS_CLOUDFRONT_DOMAIN=cdn.cinestoryai.com

# Local fallback
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=100MB
ALLOWED_FILE_TYPES=.mp4,.mov,.avi,.mkv,.mp3,.wav,.jpg,.png,.gif

# ========================================================================
# DATABASE (PostgreSQL for future expansion)
# ========================================================================
DATABASE_URL=postgresql://cinestory_user:secure_password@localhost:5432/cinestory_prod
DB_POOL_SIZE=20
DB_CONNECTION_TIMEOUT=10000

# ========================================================================
# WORKER PROCESSES (for background jobs)
# ========================================================================
WORKER_PROCESSES=4
MAX_CONCURRENT_JOBS=10
JOB_TIMEOUT=300000

# ========================================================================
# MAINTENANCE & UPDATES
# ========================================================================
MAINTENANCE_MODE=false
MAINTENANCE_MESSAGE="CineStory is currently under maintenance. We'll be back soon!"
UPDATE_CHECK_INTERVAL=3600000

# ========================================================================
# LEGAL & COMPLIANCE
# ========================================================================
PRIVACY_POLICY_URL=https://cinestoryai.com/privacy
TERMS_OF_SERVICE_URL=https://cinestoryai.com/terms
GDPR_COMPLIANCE=true
DATA_RETENTION_DAYS=365

# ========================================================================
# DEVELOPMENT & DEBUGGING (Production Settings)
# ========================================================================
DEBUG=false
VERBOSE_LOGGING=false
ENABLE_SOURCE_MAPS=false
MINIFY_ASSETS=true
COMPRESS_RESPONSES=true

# ========================================================================
# WEBHOOK ENDPOINTS (for integrations)
# ========================================================================
WEBHOOK_SECRET=your_webhook_secret_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
PAYPAL_WEBHOOK_URL=https://api.cinestoryai.com/webhooks/paypal

# ========================================================================
# API KEYS (Add your production keys)
# ========================================================================
# OpenAI (for future AI features)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Payment Processing
STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key

# Social Auth (for future login features)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# ========================================================================
# PERFORMANCE MONITORING
# ========================================================================
NEW_RELIC_LICENSE_KEY=your_new_relic_license_key
DATADOG_API_KEY=your_datadog_api_key

# ========================================================================
# TIMEZONE & LOCALIZATION
# ========================================================================
TZ=UTC
DEFAULT_LOCALE=en
SUPPORTED_LOCALES=en,th
DEFAULT_CURRENCY=USD

# ========================================================================
# BUILD CONFIGURATION
# ========================================================================
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
BUILD_VERSION=1.0.0
BUILD_ENVIRONMENT=production
BUILD_TARGET=cinestoryai.com