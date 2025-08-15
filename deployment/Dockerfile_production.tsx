# ========================================================================
# Production Dockerfile for CineStory AI - www.cinestoryai.com
# ========================================================================
# 🎬 Multi-stage build for optimized production deployment

# ============================================================================
# BUILD STAGE
# ============================================================================
FROM node:20-alpine AS builder

# Build arguments
ARG NODE_ENV=production
ARG DOMAIN=cinestoryai.com
ARG BUILD_DATE
ARG BUILD_VERSION=1.0.0

# Environment variables for build
ENV NODE_ENV=${NODE_ENV}
ENV DOMAIN=${DOMAIN}
ENV BUILD_DATE=${BUILD_DATE}
ENV BUILD_VERSION=${BUILD_VERSION}

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production --no-audit --prefer-offline \
    && npm cache clean --force

# Copy source code
COPY . .

# Copy production environment
COPY deployment/cinestoryai-production.env .env.production

# Build the application
RUN npm run build

# ============================================================================
# PRODUCTION STAGE
# ============================================================================
FROM nginx:1.25-alpine AS production

# Labels for container identification
LABEL maintainer="CineStory Team <admin@cinestoryai.com>"
LABEL description="CineStory AI - Professional Video Editing Platform"
LABEL version="${BUILD_VERSION}"
LABEL domain="www.cinestoryai.com"

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    ca-certificates \
    tzdata \
    && rm -rf /var/cache/apk/*

# Set timezone
ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create application user
RUN addgroup -g 1001 -S cinestory && \
    adduser -S cinestory -u 1001 -G cinestory

# Copy built application from builder stage
COPY --from=builder --chown=cinestory:cinestory /app/dist /var/www/cinestoryai/dist

# Copy nginx configuration
COPY deployment/nginx-cinestoryai.conf /etc/nginx/conf.d/default.conf

# Create necessary directories
RUN mkdir -p /var/log/nginx /var/cache/nginx /app/logs \
    && chown -R cinestory:cinestory /var/log/nginx /var/cache/nginx /app/logs \
    && chmod -R 755 /var/www/cinestoryai/dist

# Copy custom nginx.conf for production optimization
COPY <<EOF /etc/nginx/nginx.conf
user cinestory;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging format
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                   '\$status \$body_bytes_sent "\$http_referer" '
                   '"\$http_user_agent" "\$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Include server configurations
    include /etc/nginx/conf.d/*.conf;
}
EOF

# Health check script
COPY <<EOF /usr/local/bin/healthcheck.sh
#!/bin/sh
set -e

# Check if nginx is running
if ! pgrep nginx > /dev/null; then
    echo "ERROR: Nginx is not running"
    exit 1
fi

# Check if the application is accessible
if ! curl -f -s http://localhost/api/health > /dev/null; then
    echo "WARNING: Health check endpoint not accessible"
fi

# Check if main page loads
if ! curl -f -s http://localhost/ > /dev/null; then
    echo "ERROR: Main page not accessible"
    exit 1
fi

echo "Health check passed"
exit 0
EOF

RUN chmod +x /usr/local/bin/healthcheck.sh

# Startup script
COPY <<EOF /usr/local/bin/start.sh
#!/bin/sh
set -e

echo "=========================================="
echo "🎬 Starting CineStory AI Production Server"
echo "=========================================="
echo "Domain: www.cinestoryai.com"
echo "Build Version: ${BUILD_VERSION}"
echo "Build Date: ${BUILD_DATE}"
echo "Environment: production"
echo "=========================================="

# Test nginx configuration
echo "Testing nginx configuration..."
nginx -t

# Start nginx
echo "Starting nginx..."
exec nginx -g 'daemon off;'
EOF

RUN chmod +x /usr/local/bin/start.sh

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

# Switch to non-root user
USER cinestory

# Set working directory
WORKDIR /var/www/cinestoryai

# Start the application
CMD ["/usr/local/bin/start.sh"]

# ============================================================================
# NODE.JS ALTERNATIVE (if needed for SSR or API)
# ============================================================================
FROM node:20-alpine AS nodejs-production

# Build arguments
ARG NODE_ENV=production
ARG DOMAIN=cinestoryai.com

# Environment variables
ENV NODE_ENV=${NODE_ENV}
ENV DOMAIN=${DOMAIN}
ENV PORT=3000

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    ca-certificates \
    tzdata \
    && rm -rf /var/cache/apk/*

# Create app user
RUN addgroup -g 1001 -S cinestory && \
    adduser -S cinestory -u 1001 -G cinestory

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --only=production --no-audit --prefer-offline \
    && npm cache clean --force

# Copy built application
COPY --from=builder --chown=cinestory:cinestory /app/dist ./dist
COPY --from=builder --chown=cinestory:cinestory /app/server ./server

# Copy production environment
COPY deployment/cinestoryai-production.env .env.production

# Create logs directory
RUN mkdir -p /app/logs && chown cinestory:cinestory /app/logs

# Health check script for Node.js
COPY <<EOF /usr/local/bin/node-healthcheck.sh
#!/bin/sh
curl -f http://localhost:3000/api/health || exit 1
EOF

RUN chmod +x /usr/local/bin/node-healthcheck.sh

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD /usr/local/bin/node-healthcheck.sh

# Switch to non-root user
USER cinestory

# Start the application
CMD ["node", "server/index.js"]