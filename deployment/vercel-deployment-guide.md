# 🎬 CineStory AI - Vercel Deployment Guide

## 🚀 **Deploy to www.cinestoryai.com via Vercel**

### **📋 Prerequisites**
- [x] Vercel account created
- [x] Domain `cinestoryai.com` purchased
- [x] GitHub repository with CineStory code
- [x] Supabase backend running

---

## 🌐 **Step 1: Domain Setup**

### **1.1 Configure DNS Records**
In your domain registrar (GoDaddy, Namecheap, etc.), add these records:

```
Type    Name    Value                          TTL
A       @       76.76.19.61                    3600
A       www     76.76.19.61                    3600
CNAME   *       cname.vercel-dns.com           3600
```

**Note:** The IP `76.76.19.61` is Vercel's A record. Use `cname.vercel-dns.com` for CNAME.

### **1.2 Alternative: Use Vercel DNS**
```bash
# Point nameservers to Vercel (recommended)
ns1.vercel-dns.com
ns2.vercel-dns.com
```

---

## 🚀 **Step 2: Deploy to Vercel**

### **2.1 Install Vercel CLI**
```bash
npm install -g vercel
```

### **2.2 Login to Vercel**
```bash
vercel login
```

### **2.3 Deploy from Project Directory**
```bash
# Navigate to project directory
cd /path/to/cinestoryai

# Deploy to Vercel
vercel --prod

# Follow the prompts:
# ? Set up and deploy "~/cinestoryai"? [Y/n] y
# ? Which scope do you want to deploy to? Your Personal Account
# ? Link to existing project? [y/N] n
# ? What's your project's name? cinestoryai
# ? In which directory is your code located? ./
```

---

## ⚙️ **Step 3: Configure Project Settings**

### **3.1 Vercel Dashboard Configuration**

Go to [Vercel Dashboard](https://vercel.com/dashboard) → Select your project

#### **Build & Development Settings:**
```
Framework Preset: Vite
Build Command: npm run vercel-build
Output Directory: dist
Install Command: npm install
Development Command: npm run dev
```

#### **Environment Variables:**
Add these in Project Settings → Environment Variables:

```bash
# Production Environment Variables
NODE_ENV=production
VERCEL_ENV=production

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://plqwkmrvwuagdymsqeqe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBscXdrbXJ2d3VhZ2R5bXNxZXFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwMDk0MjksImV4cCI6MjA1MjU4NTQyOX0.nSIb7dCFZ9iKhc4_dSqOcNX8O6B9Kb_aKSlA-1VDZmc

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://plqwkmrvwuagdymsqeqe.supabase.co/functions/v1/make-server-b27e4aa1/api

# App Configuration
NEXT_PUBLIC_APP_URL=https://www.cinestoryai.com
NEXT_PUBLIC_DOMAIN=cinestoryai.com

# Feature Flags
NEXT_PUBLIC_ENABLE_EARLY_BIRD=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Optional: Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id_here
```

---

## 🏷️ **Step 4: Custom Domain Setup**

### **4.1 Add Domain in Vercel**
1. Go to Project Settings → Domains
2. Add `cinestoryai.com`
3. Add `www.cinestoryai.com`
4. Set `www.cinestoryai.com` as primary domain

### **4.2 SSL Certificate**
Vercel automatically provisions SSL certificates for custom domains. This usually takes a few minutes.

---

## 🔧 **Step 5: Deployment Commands**

### **5.1 Deploy via CLI**
```bash
# Deploy to production
npm run deploy

# Deploy preview (staging)
npm run deploy:preview

# Deploy specific branch
vercel --prod --branch main
```

### **5.2 Deploy via Git Integration**
```bash
# Connect GitHub repository in Vercel Dashboard
# Auto-deploy on push to main branch
git push origin main
```

---

## 📊 **Step 6: Monitoring & Analytics**

### **6.1 Vercel Analytics**
Enable in Project Settings → Analytics

### **6.2 Performance Monitoring**
```javascript
// Add to App.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <CineStoryEarlyBird />
      <Analytics />
    </>
  );
}
```

### **6.3 Speed Insights**
```javascript
// Add to App.tsx
import { SpeedInsights } from '@vercel/speed-insights/react';

function App() {
  return (
    <>
      <CineStoryEarlyBird />
      <SpeedInsights />
    </>
  );
}
```

---

## 🧪 **Step 7: Testing Deployment**

### **7.1 Test URLs**
```bash
# Test main site
curl -I https://www.cinestoryai.com/

# Test API proxy
curl -I https://www.cinestoryai.com/api/health

# Test early bird endpoint
curl -I https://www.cinestoryai.com/api/early-bird/stats
```

### **7.2 Lighthouse Audit**
```bash
# Run Lighthouse test
npx lighthouse https://www.cinestoryai.com --view

# Expected scores:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 90+
```

---

## 🔄 **Step 8: CI/CD Setup**

### **8.1 GitHub Actions (Optional)**
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Build project
        run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          vercel-args: '--prod'
```

---

## 🚨 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. Build Fails**
```bash
# Check build logs in Vercel Dashboard
# Common fixes:
npm run type-check  # Fix TypeScript errors
npm run lint        # Fix ESLint errors
npm run build       # Test build locally
```

#### **2. API Routes Not Working**
```javascript
// Check vercel.json proxy configuration
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://plqwkmrvwuagdymsqeqe.supabase.co/functions/v1/make-server-b27e4aa1/api/$1"
    }
  ]
}
```

#### **3. Domain Not Connecting**
```bash
# Check DNS propagation
dig cinestoryai.com
nslookup www.cinestoryai.com

# Wait 24-48 hours for DNS propagation
# Contact domain registrar if issues persist
```

#### **4. SSL Certificate Issues**
```bash
# SSL certificates are automatic in Vercel
# If issues occur:
# 1. Remove and re-add domain in Vercel
# 2. Wait 15-30 minutes
# 3. Check domain verification
```

---

## 📈 **Step 9: Post-Deployment**

### **9.1 Performance Optimization**
```javascript
// Already configured in vercel.json:
// - Static asset caching
// - Gzip compression
// - Security headers
// - API proxying
```

### **9.2 SEO Setup**
```html
<!-- Add to index.html -->
<meta name="description" content="CineStory AI - Professional AI-powered video editing platform">
<meta property="og:title" content="CineStory AI">
<meta property="og:description" content="The future of video editing with AI">
<meta property="og:url" content="https://www.cinestoryai.com">
<meta property="og:image" content="https://www.cinestoryai.com/og-image.jpg">
```

### **9.3 Analytics Setup**
```javascript
// Google Analytics 4
gtag('config', 'GA_MEASUREMENT_ID', {
  page_title: 'CineStory AI',
  page_location: 'https://www.cinestoryai.com'
});
```

---

## ✅ **Deployment Checklist**

### **Pre-Deployment**
- [ ] Code tested locally
- [ ] Build successful (`npm run build`)
- [ ] Environment variables prepared
- [ ] Domain DNS configured
- [ ] Vercel account setup

### **Deployment**
- [ ] Project deployed to Vercel
- [ ] Custom domain connected
- [ ] SSL certificate active
- [ ] Environment variables set
- [ ] API routes working

### **Post-Deployment**
- [ ] All pages loading correctly
- [ ] Early bird form working
- [ ] API endpoints responding
- [ ] Analytics tracking active
- [ ] Performance scores good (90+)

---

## 🎯 **Quick Deployment Commands**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login and deploy
vercel login
vercel --prod

# 3. Add custom domain in Vercel Dashboard
# www.cinestoryai.com

# 4. Configure environment variables
# (Use Vercel Dashboard UI)

# 5. Test deployment
curl -I https://www.cinestoryai.com/
```

---

## 🌟 **Expected Results**

After successful deployment:

- **Main Site:** https://www.cinestoryai.com
- **API Health:** https://www.cinestoryai.com/api/health
- **Early Bird API:** https://www.cinestoryai.com/api/early-bird/stats
- **SSL Certificate:** A+ rating
- **Performance:** 90+ Lighthouse score
- **Uptime:** 99.9%

---

## 📞 **Support**

### **Vercel Support**
- Documentation: https://vercel.com/docs
- Support: https://vercel.com/support
- Status: https://vercel-status.com/

### **CineStory Support**
- Technical: admin@cinestoryai.com
- Domain: dns@cinestoryai.com

---

**🎬 CineStory AI is ready for production!**

**Live Site:** https://www.cinestoryai.com  
**Deployment Platform:** Vercel  
**Status:** ✅ Production Ready  
**SSL:** ✅ Automatic  
**Performance:** ⚡ Optimized  

**Join the AI video editing revolution! 🚀**