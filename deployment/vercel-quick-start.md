# 🎬 CineStory AI - Vercel Quick Start

## ⚡ **5-Minute Deployment to cinestoryai.com**

### **🚀 One-Click Deployment**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login and deploy
vercel login
vercel --prod

# 3. Add custom domain (in Vercel Dashboard)
# www.cinestoryai.com

# 4. Configure DNS at your registrar
# Point to Vercel nameservers or add A records
```

---

## 📝 **Step-by-Step Guide**

### **Step 1: Prepare Project**
```bash
# Clone/navigate to project
cd cinestoryai

# Install dependencies
npm install

# Test build
npm run build
```

### **Step 2: Deploy to Vercel**
```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Answer the prompts:
# ✔ Set up and deploy "~/cinestoryai"? … yes
# ✔ Which scope do you want to deploy to? … Your Personal Account
# ✔ Link to existing project? … no
# ✔ What's your project's name? … cinestoryai
# ✔ In which directory is your code located? … ./
```

### **Step 3: Configure Domain**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `cinestoryai` project
3. Go to Settings → Domains
4. Add `cinestoryai.com`
5. Add `www.cinestoryai.com`
6. Set `www.cinestoryai.com` as primary

### **Step 4: DNS Configuration**
Add these records to your domain registrar:

```
Type    Name    Value                          TTL
A       @       76.76.19.61                    3600
A       www     76.76.19.61                    3600
CNAME   *       cname.vercel-dns.com           3600
```

**Or use Vercel DNS:**
```
Nameservers:
ns1.vercel-dns.com
ns2.vercel-dns.com
```

### **Step 5: Environment Variables**
In Vercel Dashboard → Settings → Environment Variables:

```bash
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://plqwkmrvwuagdymsqeqe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBscXdrbXJ2d3VhZ2R5bXNxZXFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwMDk0MjksImV4cCI6MjA1MjU4NTQyOX0.nSIb7dCFZ9iKhc4_dSqOcNX8O6B9Kb_aKSlA-1VDZmc
NEXT_PUBLIC_API_BASE_URL=https://plqwkmrvwuagdymsqeqe.supabase.co/functions/v1/make-server-b27e4aa1/api
NEXT_PUBLIC_APP_URL=https://www.cinestoryai.com
```

---

## ✅ **Quick Verification**

```bash
# Test main site
curl -I https://www.cinestoryai.com/

# Test API proxy
curl -I https://www.cinestoryai.com/api/health

# Test early bird endpoint
curl -I https://www.cinestoryai.com/api/early-bird/stats
```

---

## 🎯 **Expected Results**

- ✅ **Live Site:** https://www.cinestoryai.com
- ✅ **SSL Certificate:** Automatic
- ✅ **API Endpoints:** Working via proxy
- ✅ **Performance:** 90+ Lighthouse score
- ✅ **Global CDN:** Enabled
- ✅ **Automatic Deployments:** On git push

---

## 🚨 **Troubleshooting**

### **Build Fails?**
```bash
npm run build  # Test locally first
npm run lint    # Fix any errors
```

### **Domain Not Working?**
```bash
# Check DNS propagation
dig www.cinestoryai.com
# Wait 24-48 hours for DNS propagation
```

### **API Not Working?**
Check `vercel.json` proxy configuration is correct.

---

## 📱 **Using Automated Script**

```bash
# Make script executable
chmod +x deployment/deploy-to-vercel.sh

# Run full deployment
./deployment/deploy-to-vercel.sh full

# Or use interactive menu
./deployment/deploy-to-vercel.sh menu
```

---

## 🎉 **You're Live!**

**🌐 Website:** https://www.cinestoryai.com  
**⚡ Performance:** Optimized  
**🔒 Security:** HTTPS enabled  
**📊 Analytics:** Ready to configure  
**🚀 Status:** Production ready!  

**Welcome to the future of video editing! 🎬✨**