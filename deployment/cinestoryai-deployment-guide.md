# 🎬 CineStory AI Deployment Guide - www.cinestoryai.com

## 📋 Complete Production Deployment Guide

### 🏗️ **Architecture Overview**
```
Internet → Cloudflare/CDN → Nginx (SSL) → React App → Supabase Backend
                                    ↓
                               Rate Limiting
                               Caching
                               Security Headers
```

---

## 🚀 **Quick Start Deployment**

### **Option 1: Docker Deployment (Recommended)**

```bash
# 1. Clone and prepare
git clone <cinestory-repo>
cd cinestory
cp deployment/cinestoryai-production.env .env.production

# 2. Update environment variables
nano .env.production
# Update domain, SSL paths, API keys

# 3. Build and deploy
docker-compose -f deployment/docker-compose-cinestoryai.yml up -d

# 4. Setup SSL certificates
docker-compose -f deployment/docker-compose-cinestoryai.yml --profile ssl-setup up certbot

# 5. Restart with SSL
docker-compose -f deployment/docker-compose-cinestoryai.yml restart nginx
```

### **Option 2: Manual Server Deployment**

```bash
# 1. Install dependencies
sudo apt update
sudo apt install -y nginx nodejs npm certbot python3-certbot-nginx

# 2. Setup Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone and build
git clone <cinestory-repo>
cd cinestory
npm install
npm run build

# 4. Configure Nginx
sudo cp deployment/nginx-cinestoryai.conf /etc/nginx/sites-available/cinestoryai.com
sudo ln -s /etc/nginx/sites-available/cinestoryai.com /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# 5. Setup SSL
sudo certbot --nginx -d cinestoryai.com -d www.cinestoryai.com

# 6. Deploy static files
sudo mkdir -p /var/www/cinestoryai
sudo cp -r dist/* /var/www/cinestoryai/
sudo chown -R www-data:www-data /var/www/cinestoryai

# 7. Start services
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🔧 **Server Requirements**

### **Minimum Requirements**
- **CPU:** 2 vCPUs
- **RAM:** 4GB
- **Storage:** 20GB SSD
- **OS:** Ubuntu 20.04+ / CentOS 8+ / Debian 11+

### **Recommended for Production**
- **CPU:** 4 vCPUs
- **RAM:** 8GB
- **Storage:** 50GB SSD + CDN
- **Network:** 1Gbps
- **Load Balancer:** Yes (for high availability)

### **Cloud Provider Recommendations**
```bash
# DigitalOcean Droplet
# - Premium Intel: $48/month (4 vCPU, 8GB RAM)
# - Regular: $24/month (2 vCPU, 4GB RAM)

# AWS EC2
# - t3.large: ~$67/month (2 vCPU, 8GB RAM)
# - t3.medium: ~$34/month (2 vCPU, 4GB RAM)

# Google Cloud
# - e2-standard-2: ~$49/month (2 vCPU, 8GB RAM)
# - e2-standard-4: ~$97/month (4 vCPU, 16GB RAM)
```

---

## 🌐 **Domain & DNS Configuration**

### **DNS Records for cinestoryai.com**
```
# A Records
@           IN  A       YOUR_SERVER_IP
www         IN  A       YOUR_SERVER_IP
api         IN  A       YOUR_SERVER_IP

# CNAME Records (Optional)
cdn         IN  CNAME   YOUR_CDN_DOMAIN
assets      IN  CNAME   YOUR_ASSETS_CDN

# MX Records (for email)
@           IN  MX  10  mail.cinestoryai.com

# TXT Records
@           IN  TXT     "v=spf1 include:_spf.google.com ~all"
_dmarc      IN  TXT     "v=DMARC1; p=quarantine; rua=mailto:dmarc@cinestoryai.com"
```

### **Cloudflare Configuration (Recommended)**
```
1. Add cinestoryai.com to Cloudflare
2. Enable these features:
   ✅ SSL/TLS: Full (strict)
   ✅ Always Use HTTPS: On
   ✅ HTTP Strict Transport Security: Enable
   ✅ Brotli: On
   ✅ Auto Minify: JS, CSS, HTML
   ✅ Browser Cache TTL: 4 hours
   ✅ Security Level: Medium
   ✅ Bot Fight Mode: On
```

---

## 🔒 **SSL Certificate Setup**

### **Let's Encrypt (Free)**
```bash
# Using Certbot
sudo certbot --nginx -d cinestoryai.com -d www.cinestoryai.com -d api.cinestoryai.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **Wildcard Certificate**
```bash
# For *.cinestoryai.com
sudo certbot certonly --manual --preferred-challenges=dns -d cinestoryai.com -d *.cinestoryai.com
```

---

## 📊 **Monitoring & Analytics Setup**

### **1. Google Analytics 4**
```javascript
// Add to index.html
gtag('config', 'GA_MEASUREMENT_ID', {
  page_title: 'CineStory AI',
  page_location: 'https://www.cinestoryai.com'
});
```

### **2. Server Monitoring**
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Setup log monitoring
sudo tail -f /var/log/nginx/cinestoryai.access.log
sudo tail -f /var/log/nginx/cinestoryai.error.log
```

### **3. Uptime Monitoring**
```bash
# Setup with services like:
# - UptimeRobot (free)
# - Pingdom
# - New Relic
# - DataDog

# Monitor these endpoints:
# https://www.cinestoryai.com/
# https://www.cinestoryai.com/api/health
# https://www.cinestoryai.com/api/early-bird/stats
```

---

## 🛡️ **Security Hardening**

### **Firewall Configuration**
```bash
# UFW Setup
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Fail2Ban for SSH protection
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

### **Nginx Security Headers**
```nginx
# Already included in nginx-cinestoryai.conf
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=63072000" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### **Rate Limiting**
```nginx
# API rate limiting (already configured)
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=early_bird:10m rate=5r/s;
```

---

## 📈 **Performance Optimization**

### **1. CDN Setup**
```bash
# Cloudflare (Recommended)
1. Enable Cloudflare proxy (orange cloud)
2. Setup page rules:
   - *.cinestoryai.com/api/* → Cache Level: Bypass
   - *.cinestoryai.com/*.js → Cache Level: Standard, Edge TTL: 1 month
   - *.cinestoryai.com/*.css → Cache Level: Standard, Edge TTL: 1 month
   - *.cinestoryai.com/* → Cache Level: Standard, Edge TTL: 2 hours
```

### **2. Compression**
```nginx
# Gzip + Brotli (configured in nginx-cinestoryai.conf)
gzip on;
gzip_comp_level 6;
brotli on;
brotli_comp_level 6;
```

### **3. Caching Strategy**
```
Static Assets (.js, .css, .png): 1 year
HTML files: No cache
API responses: 1 minute
JSON data: 1 hour
```

---

## 🔄 **Deployment Process**

### **Initial Deployment**
```bash
#!/bin/bash
# deploy-initial.sh

echo "🎬 CineStory AI - Initial Deployment"

# 1. Server setup
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx nodejs npm git curl

# 2. Clone repository
git clone <repo-url> /opt/cinestoryai
cd /opt/cinestoryai

# 3. Install dependencies
npm install

# 4. Build application
npm run build

# 5. Setup nginx
sudo cp deployment/nginx-cinestoryai.conf /etc/nginx/sites-available/cinestoryai.com
sudo ln -s /etc/nginx/sites-available/cinestoryai.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 6. Deploy files
sudo mkdir -p /var/www/cinestoryai
sudo cp -r dist/* /var/www/cinestoryai/
sudo chown -R www-data:www-data /var/www/cinestoryai

# 7. SSL setup
sudo certbot --nginx -d cinestoryai.com -d www.cinestoryai.com

# 8. Start services
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "✅ Deployment completed!"
echo "🌐 Visit: https://www.cinestoryai.com"
```

### **Update Deployment**
```bash
#!/bin/bash
# deploy-update.sh

echo "🔄 CineStory AI - Update Deployment"

cd /opt/cinestoryai

# 1. Pull latest changes
git pull origin main

# 2. Install new dependencies
npm install

# 3. Build application
npm run build

# 4. Backup current version
sudo cp -r /var/www/cinestoryai /var/www/cinestoryai.backup.$(date +%Y%m%d_%H%M%S)

# 5. Deploy new version
sudo cp -r dist/* /var/www/cinestoryai/
sudo chown -R www-data:www-data /var/www/cinestoryai

# 6. Test nginx config
sudo nginx -t

# 7. Reload nginx
sudo systemctl reload nginx

echo "✅ Update completed!"
```

---

## 🧪 **Testing & Validation**

### **Automated Testing Script**
```bash
#!/bin/bash
# test-deployment.sh

echo "🧪 Testing CineStory AI Deployment"

# Test main site
echo "Testing main site..."
if curl -f -s https://www.cinestoryai.com/ > /dev/null; then
    echo "✅ Main site OK"
else
    echo "❌ Main site FAILED"
    exit 1
fi

# Test API health
echo "Testing API health..."
if curl -f -s https://www.cinestoryai.com/api/health > /dev/null; then
    echo "✅ API health OK"
else
    echo "❌ API health FAILED"
    exit 1
fi

# Test early bird endpoint
echo "Testing early bird endpoint..."
if curl -f -s https://www.cinestoryai.com/api/early-bird/stats > /dev/null; then
    echo "✅ Early bird API OK"
else
    echo "❌ Early bird API FAILED"
    exit 1
fi

# Test SSL
echo "Testing SSL..."
if curl -f -s -I https://www.cinestoryai.com/ | grep -q "HTTP/2 200"; then
    echo "✅ SSL/HTTP2 OK"
else
    echo "❌ SSL/HTTP2 FAILED"
fi

# Performance test
echo "Testing performance..."
LOAD_TIME=$(curl -o /dev/null -s -w '%{time_total}' https://www.cinestoryai.com/)
if (( $(echo "$LOAD_TIME < 3.0" | bc -l) )); then
    echo "✅ Performance OK (${LOAD_TIME}s)"
else
    echo "⚠️ Performance SLOW (${LOAD_TIME}s)"
fi

echo "🎉 All tests completed!"
```

---

## 📦 **Backup & Recovery**

### **Automated Backup Script**
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/opt/backups/cinestoryai"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup website files
echo "Backing up website files..."
tar -czf $BACKUP_DIR/website_$DATE.tar.gz /var/www/cinestoryai

# Backup nginx config
echo "Backing up nginx config..."
tar -czf $BACKUP_DIR/nginx_$DATE.tar.gz /etc/nginx/sites-available/cinestoryai.com

# Backup SSL certificates
echo "Backing up SSL certificates..."
tar -czf $BACKUP_DIR/ssl_$DATE.tar.gz /etc/letsencrypt

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "✅ Backup completed: $BACKUP_DIR"
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

**1. SSL Certificate Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run
sudo certbot renew --force-renewal
```

**2. Nginx Configuration Errors**
```bash
# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/cinestoryai.error.log
```

**3. API Connection Issues**
```bash
# Test Supabase connection
curl -v https://plqwkmrvwuagdymsqeqe.supabase.co/functions/v1/make-server-b27e4aa1/health

# Check CORS headers
curl -H "Origin: https://www.cinestoryai.com" -I https://www.cinestoryai.com/api/health
```

**4. Performance Issues**
```bash
# Check server resources
htop
iotop
nethogs

# Check nginx status
sudo systemctl status nginx
sudo nginx -T
```

---

## 📞 **Support & Maintenance**

### **Regular Maintenance Tasks**
```bash
# Weekly tasks
- Check SSL certificate expiry
- Review access logs for anomalies
- Update system packages
- Check disk space usage
- Verify backup integrity

# Monthly tasks
- Review performance metrics
- Update dependencies
- Security audit
- Optimize database (when implemented)
```

### **Emergency Contacts**
```
Technical Issues: admin@cinestoryai.com
Security Issues: security@cinestoryai.com
Domain Issues: dns@cinestoryai.com
```

---

## 🎯 **Go-Live Checklist**

### **Pre-Launch**
- [ ] Domain configured and propagated
- [ ] SSL certificates installed and working
- [ ] All API endpoints tested
- [ ] Performance tests passed
- [ ] Security headers configured
- [ ] Analytics tracking setup
- [ ] Backup system configured
- [ ] Monitoring alerts setup

### **Launch Day**
- [ ] Deploy to production
- [ ] Run full test suite
- [ ] Monitor server resources
- [ ] Check error logs
- [ ] Verify analytics data
- [ ] Test early bird registration
- [ ] Announce launch

### **Post-Launch**
- [ ] Monitor traffic and performance
- [ ] Review error logs daily
- [ ] Check conversion rates
- [ ] Gather user feedback
- [ ] Plan next features

---

## 🏆 **Success Metrics**

### **Technical KPIs**
- **Uptime:** > 99.9%
- **Load Time:** < 2 seconds
- **API Response:** < 500ms
- **Error Rate:** < 0.1%

### **Business KPIs**
- **Early Bird Signups:** Target 15,000
- **Conversion Rate:** > 2%
- **Bounce Rate:** < 60%
- **User Engagement:** > 3 minutes

---

**🎬 CineStory AI is ready for production deployment!**

**Visit: https://www.cinestoryai.com**

**For support: admin@cinestoryai.com**