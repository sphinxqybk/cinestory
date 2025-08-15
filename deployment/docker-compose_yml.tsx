# CineStory Production Deployment Configuration
version: '3.8'

services:
  # Frontend - CineStory React Application
  cinestory-frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - CINESTORY_API_URL=https://api.cinestory.app/v1
      - CINESTORY_WS_URL=wss://ws.cinestory.app/v1
      - AUTOMATION_API_URL=https://automation.cinestory.app/v1
      - CINESTORY_API_KEY=${CINESTORY_API_KEY}
    depends_on:
      - cinestory-api
      - cinestory-websocket
    restart: unless-stopped
    networks:
      - cinestory-network

  # Backend API - Node.js/Express API Server
  cinestory-api:
    image: cinestory/api:latest
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - CINESTORY_API_KEY=${CINESTORY_API_KEY}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - cinestory-network
    volumes:
      - ./logs:/app/logs

  # WebSocket Server - Real-time communication
  cinestory-websocket:
    image: cinestory/websocket:latest
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - REDIS_URL=${REDIS_URL}
      - CINESTORY_API_KEY=${CINESTORY_API_KEY}
    depends_on:
      - redis
    restart: unless-stopped
    networks:
      - cinestory-network

  # Automation Engine - Background job processing
  cinestory-automation:
    image: cinestory/automation:latest
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - CINESTORY_API_KEY=${CINESTORY_API_KEY}
      - GPU_ENABLED=${GPU_ENABLED:-false}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - cinestory-network
    volumes:
      - ./media:/app/media
      - ./temp:/app/temp

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=cinestory
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    networks:
      - cinestory-network

  # Redis - Caching and session storage
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - cinestory-network

  # Nginx - Reverse proxy and load balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - cinestory-frontend
      - cinestory-api
      - cinestory-websocket
    restart: unless-stopped
    networks:
      - cinestory-network

  # Monitoring - Prometheus & Grafana
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
    restart: unless-stopped
    networks:
      - cinestory-network

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    restart: unless-stopped
    networks:
      - cinestory-network

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  cinestory-network:
    driver: bridge