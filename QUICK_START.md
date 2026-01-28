# 🚀 AIChecklist.io - Quick Start Guide

## One-Click Deployment in 5 Minutes

This is your complete, production-ready backup of AIChecklist.io created on **November 21, 2025**.

---

## ⚡ Fast Track Setup

### 1. Extract & Install (2 minutes)
```bash
# Extract backup
tar -xzf aichecklist-backup-YYYYMMDD-HHMMSS.tar.gz
cd aichecklist-backup-YYYYMMDD-HHMMSS

# Install dependencies
npm install
```

### 2. Configure Environment (2 minutes)
```bash
# Copy template
cp .env.example .env

# Edit with your favorite editor
nano .env
```

**Minimum required values:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `OPENAI_API_KEY` - From platform.openai.com
- `GEMINI_API_KEY` - From ai.google.dev (free)
- One email service (RESEND_API_KEY recommended)

### 3. Initialize Database (30 seconds)
```bash
npm run db:push
```

### 4. Start Application (30 seconds)
```bash
npm start
```

### 5. Open Browser
Visit: `http://localhost:5000`

---

## 🎯 What You Get

✅ **Full-Stack Application**
- React 18 + TypeScript frontend
- Node.js + Express backend
- PostgreSQL database

✅ **AI-Powered Features**
- AIDOMO AI assistant (OpenAI GPT-4o + Gemini fallback)
- Web page summarization
- Professional PDF report generation
- Smart task suggestions

✅ **Advanced Features**
- Voice biometric authentication
- Google Calendar two-way sync
- 226 productivity templates (auto-loaded)
- Achievement & gamification system
- Real-time task timers
- Drag-and-drop organization
- Task sharing
- Stripe payment integration

✅ **Performance Optimizations**
- <100ms task completion (optimistic updates)
- Non-blocking background processing
- Database connection pooling
- Response compression

---

## 📝 Essential Environment Variables

Copy from `.env.example` and fill in:

```env
# Database (Required)
DATABASE_URL=postgresql://user:pass@host:5432/db

# AI Services (Required)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=your-key

# Email (Required - pick one)
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com

# Application (Required)
NODE_ENV=production
PORT=5000
```

---

## 🗄️ Quick Database Setup

### Option 1: Neon (Free, Recommended)
1. Go to https://neon.tech
2. Create account & project
3. Copy connection string
4. Paste as `DATABASE_URL` in `.env`

### Option 2: Self-Hosted
```bash
# Ubuntu/Debian
sudo apt install postgresql
sudo -u postgres createdb aichecklist
sudo -u postgres createuser -P aicheck_user
# Use: postgresql://aicheck_user:password@localhost:5432/aichecklist
```

---

## 🔑 Getting API Keys

### OpenAI (Required)
1. https://platform.openai.com/api-keys
2. Sign up / Log in
3. Create new secret key
4. Add credits to account ($5-$10 recommended)

### Google Gemini (Recommended for fallback)
1. https://ai.google.dev
2. Sign in with Google
3. Get API key (free tier available)

### Resend Email (Recommended)
1. https://resend.com
2. Sign up for free account
3. Verify your domain
4. Create API key

---

## 🚢 Production Deployment

### Using Docker
```bash
# Build image
docker build -t aichecklist .

# Run container
docker run -d -p 5000:5000 --env-file .env aichecklist
```

### Using PM2
```bash
# Install PM2
npm install -g pm2

# Start app
pm2 start npm --name "aichecklist" -- start

# Auto-start on reboot
pm2 startup && pm2 save
```

### With Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## ✅ Verify It's Working

After starting the app:

1. **Frontend loads:** `http://localhost:5000`
2. **Can log in:** Use existing credentials or create account
3. **Tasks work:** Create and complete a task
4. **AI responds:** Ask AIDOMO a question
5. **Email works:** Test password reset

---

## 📚 Full Documentation

For detailed setup, troubleshooting, and advanced configuration, see:
- **DEPLOYMENT_GUIDE.md** - Complete deployment documentation
- **replit.md** - Architecture and technical details
- **PERFORMANCE_AUDIT_REPORT.md** - Performance optimization guide

---

## 🆘 Quick Troubleshooting

**Database connection fails?**
```bash
# Test connection
psql $DATABASE_URL

# Check .env is loaded
echo $DATABASE_URL
```

**Port already in use?**
```bash
# Find process
sudo lsof -i :5000

# Kill it or change PORT in .env
```

**AI not responding?**
- Check OPENAI_API_KEY has credits
- Verify GEMINI_API_KEY is set (fallback)
- Check logs for API errors

**Emails not sending?**
- Verify email service API key
- Check FROM_EMAIL matches your domain
- Look at logs for SMTP errors

---

## 📦 What's in This Backup

```
aichecklist-backup/
├── client/           # React frontend
├── server/           # Express backend  
├── shared/           # TypeScript schemas
├── package.json      # Dependencies
├── tsconfig.json     # TypeScript config
├── vite.config.ts    # Build config
├── drizzle.config.ts # Database config
├── DEPLOYMENT_GUIDE.md    # Full docs (you are here)
├── .env.example      # Environment template
└── README.md         # Project overview
```

---

## 🎯 Next Steps

1. ✅ Get basic app running locally
2. ✅ Test core features (tasks, AI, email)
3. ✅ Set up production database
4. ✅ Configure domain & SSL
5. ✅ Deploy to production server
6. ✅ Set up automated backups
7. ✅ Configure monitoring

---

**Backup Date:** November 21, 2025  
**Status:** Production-Ready ✅  
**Setup Time:** ~5 minutes  
**First Deploy:** ~30 minutes

Need help? Check **DEPLOYMENT_GUIDE.md** for detailed instructions!
