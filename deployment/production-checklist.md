# CineStory Production Deployment Checklist

## Pre-Deployment Requirements

### 1. Environment Setup
- [ ] Production server configured with Docker & Docker Compose
- [ ] Domain names configured and SSL certificates obtained
- [ ] Environment variables configured in `.env.production`
- [ ] Database backup procedures in place
- [ ] Monitoring systems configured

### 2. Security Configuration
- [ ] API keys generated and securely stored
- [ ] Database credentials configured
- [ ] SSL certificates installed
- [ ] Firewall rules configured
- [ ] Rate limiting configured
- [ ] CORS policies configured

### 3. Performance Optimization
- [ ] CDN configured for static assets
- [ ] Database indexing optimized
- [ ] Caching layer configured (Redis)
- [ ] Load balancing configured if needed
- [ ] Monitoring and alerting set up

## Deployment Steps

### 1. Prepare Environment
```bash
# Clone repository
git clone https://github.com/cinestory/cinestory-suite.git
cd cinestory-suite

# Copy environment file
cp deployment/.env.production .env

# Edit environment variables
nano .env
```

### 2. Build and Deploy
```bash
# Build production containers
docker-compose -f deployment/docker-compose.yml build

# Run database migrations
docker-compose -f deployment/docker-compose.yml run --rm cinestory-api npm run migration:run

# Start all services
docker-compose -f deployment/docker-compose.yml up -d

# Verify all services are running
docker-compose -f deployment/docker-compose.yml ps
```

### 3. Post-Deployment Verification
```bash
# Check service health
curl https://api.cinestory.app/health
curl https://cinestory.app/health

# Check logs
docker-compose -f deployment/docker-compose.yml logs -f

# Run health checks
npm run health:check
```

## Production Environment Variables

### Required Variables
- `CINESTORY_API_KEY` - Production API key
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret
- `ENCRYPTION_KEY` - Data encryption key

### Optional Variables
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `AWS_ACCESS_KEY_ID` - AWS access key for S3
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `SENTRY_DSN` - Error tracking DSN

## Health Check Endpoints

### System Health
- `GET /health` - Basic health check
- `GET /api/health` - API service health
- `GET /api/system/status` - Detailed system metrics

### Service Health
- `GET /api/tools/status` - Tool service status
- `GET /api/workflows/progress` - Workflow system status
- `GET /api/ecosystem/nodes` - Ecosystem connectivity

## Monitoring Setup

### Key Metrics to Monitor
- [ ] CPU usage < 80%
- [ ] Memory usage < 85%
- [ ] Disk usage < 90%
- [ ] API response time < 500ms
- [ ] Error rate < 1%
- [ ] Database connection pool usage

### Alerts Configuration
- [ ] High CPU/Memory usage alerts
- [ ] API error rate alerts
- [ ] Database connection alerts
- [ ] Disk space alerts
- [ ] SSL certificate expiration alerts

## Backup Procedures

### Database Backup
```bash
# Daily automated backup
docker-compose exec postgres pg_dump -U $DB_USER cinestory > backup-$(date +%Y%m%d).sql

# Restore from backup
docker-compose exec postgres psql -U $DB_USER cinestory < backup-20241215.sql
```

### Media Files Backup
```bash
# Sync media files to S3
aws s3 sync ./media s3://cinestory-media-backup/$(date +%Y%m%d)/
```

## Rollback Procedures

### Quick Rollback
```bash
# Stop current deployment
docker-compose -f deployment/docker-compose.yml down

# Pull previous version
git checkout previous-stable-tag

# Redeploy
docker-compose -f deployment/docker-compose.yml up -d
```

### Database Rollback
```bash
# Restore database from backup
docker-compose exec postgres psql -U $DB_USER cinestory < backup-previous.sql
```

## Security Hardening

### Server Security
- [ ] SSH key-based authentication only
- [ ] Fail2ban configured
- [ ] Regular security updates
- [ ] Non-root Docker containers
- [ ] Secrets management system

### Application Security
- [ ] API rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection protection
- [ ] XSS protection headers
- [ ] CSRF protection enabled

## Performance Tuning

### Database Optimization
- [ ] Query performance optimized
- [ ] Proper indexing in place
- [ ] Connection pooling configured
- [ ] Query caching enabled

### Application Optimization
- [ ] Static asset compression
- [ ] Image optimization
- [ ] Bundle size optimization
- [ ] Cache-Control headers configured

## Maintenance Procedures

### Regular Maintenance
- [ ] Weekly log rotation
- [ ] Monthly security updates
- [ ] Quarterly performance review
- [ ] Semi-annual disaster recovery test

### Log Management
```bash
# View recent logs
docker-compose logs --tail=100 -f cinestory-api

# Archive old logs
find ./logs -name "*.log" -mtime +30 -delete
```

## Troubleshooting Guide

### Common Issues

#### Service Won't Start
1. Check environment variables
2. Verify database connectivity
3. Check port conflicts
4. Review service logs

#### High Memory Usage
1. Monitor active processes
2. Check for memory leaks
3. Review cache configuration
4. Scale horizontally if needed

#### Slow API Response
1. Check database performance
2. Review cache hit rates
3. Monitor network latency
4. Optimize database queries

### Emergency Contacts
- DevOps Team: devops@cinestory.app
- Backend Team: backend@cinestory.app
- Frontend Team: frontend@cinestory.app

## Success Criteria

### Deployment Successful When:
- [ ] All services are running and healthy
- [ ] API endpoints responding correctly
- [ ] Database migrations completed
- [ ] SSL certificates working
- [ ] Monitoring systems active
- [ ] Backup procedures tested
- [ ] Performance benchmarks met
- [ ] Security scans passed

### Post-Deployment Verification
- [ ] User registration works
- [ ] Project creation works
- [ ] Media upload works
- [ ] Tool launching works
- [ ] Ecosystem connectivity works
- [ ] Real-time updates work
- [ ] Error tracking works
- [ ] Analytics tracking works

## Documentation Updates
- [ ] API documentation updated
- [ ] User documentation updated
- [ ] Deployment documentation updated
- [ ] Monitoring runbooks updated
- [ ] Incident response procedures updated