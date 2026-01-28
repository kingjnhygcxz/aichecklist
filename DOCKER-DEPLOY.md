# 🚀 AIChecklist.io - Docker Deployment Guide

Complete guide to deploying AIChecklist.io using Docker on any server.

---

## 📋 Prerequisites

Before you begin, you need:

1. **A Server** (Linux recommended)
   - Ubuntu 20.04+ or Debian 11+
   - At least 2GB RAM
   - 20GB disk space
   - From providers like: DigitalOcean ($6/mo), AWS, Google Cloud, Hetzner

2. **Docker Installed** on your server
   - [Install Docker](https://docs.docker.com/engine/install/)
   - [Install Docker Compose](https://docs.docker.com/compose/install/)

3. **Domain Name** (optional but recommended)
   - Point your domain to your server's IP address
   - Example: `aichecklist.yourdomain.com` → `123.456.789.0`

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Copy Files to Your Server

Upload these files to your server:
```bash
# On your local machine
scp -r aichecklist/ user@your-server-ip:/home/user/
```

Or clone from a git repository if you've pushed it there.

### Step 2: Configure Environment

```bash
# Navigate to the app directory
cd aichecklist

# Copy the environment template
cp .env.example .env

# Edit the configuration
nano .env
```

**REQUIRED** - Change these values:
```env
POSTGRES_PASSWORD=CREATE_A_STRONG_PASSWORD_HERE
SESSION_SECRET=CREATE_A_RANDOM_SECRET_HERE
```

Generate strong secrets:
```bash
# For SESSION_SECRET
openssl rand -base64 32
```

### Step 3: Start the Application

```bash
# Build and start everything
docker-compose up -d

# Check if it's running
docker-compose ps
```

That's it! Your app is now running at `http://your-server-ip:5000`

---

## 🔧 Detailed Configuration

### Required Settings

Edit your `.env` file:

```env
# Database (REQUIRED)
POSTGRES_PASSWORD=your_secure_password

# Security (REQUIRED)
SESSION_SECRET=your_random_secret_key
```

### Optional Features

Add these to enable advanced features:

```env
# AI Assistant (AIDOMO)
OPENAI_API_KEY=sk-your-openai-key

# Email Notifications
RESEND_API_KEY=re_your-resend-key

# Payment Processing
STRIPE_SECRET_KEY=sk_live_your-stripe-key

# Push Notifications
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

---

## 🌐 Setting Up a Domain (HTTPS)

### Option 1: Using Nginx + Let's Encrypt (Recommended)

1. **Install Nginx:**
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

2. **Create Nginx Config:**
```bash
sudo nano /etc/nginx/sites-available/aichecklist
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name aichecklist.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Enable Site:**
```bash
sudo ln -s /etc/nginx/sites-available/aichecklist /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. **Get SSL Certificate:**
```bash
sudo certbot --nginx -d aichecklist.yourdomain.com
```

Now access your app at: `https://aichecklist.yourdomain.com`

---

## 📊 Management Commands

### View Logs
```bash
# All logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# App logs only
docker-compose logs -f app

# Database logs only
docker-compose logs -f db
```

### Stop the Application
```bash
docker-compose down
```

### Stop and Remove Everything (Including Database)
```bash
docker-compose down -v
```

### Restart the Application
```bash
docker-compose restart
```

### Update to New Version
```bash
# Stop the app
docker-compose down

# Pull new code (if using git)
git pull

# Rebuild and start
docker-compose up -d --build
```

---

## 🔄 Database Management

### Backup Database
```bash
docker-compose exec db pg_dump -U aichecklist aichecklist > backup.sql
```

### Restore Database
```bash
docker-compose exec -T db psql -U aichecklist aichecklist < backup.sql
```

### Access Database
```bash
docker-compose exec db psql -U aichecklist
```

---

## 🔒 Security Best Practices

1. **Firewall Configuration:**
```bash
# Allow only HTTP, HTTPS, and SSH
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

2. **Regular Updates:**
```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Update Docker images
docker-compose pull
docker-compose up -d
```

3. **Strong Passwords:**
   - Use complex database passwords (20+ characters)
   - Use a unique SESSION_SECRET
   - Never commit `.env` file to git

4. **Backups:**
   - Schedule daily database backups
   - Store backups off-server
   - Test restore procedure monthly

---

## 🐛 Troubleshooting

### App Won't Start

Check logs:
```bash
docker-compose logs app
```

Common issues:
- Missing environment variables
- Database not ready (wait 30 seconds and try again)
- Port 5000 already in use

### Database Connection Error

```bash
# Check if database is running
docker-compose ps db

# Restart database
docker-compose restart db
```

### Can't Access from Browser

1. Check if app is running:
```bash
docker-compose ps
```

2. Check firewall:
```bash
sudo ufw status
```

3. Test locally on server:
```bash
curl http://localhost:5000
```

---

## 📈 Scaling & Performance

### Increase Memory (if needed)

Edit `docker-compose.yml`:
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G
```

### Enable Production Mode

Already enabled by default with `NODE_ENV=production`

### Monitor Resource Usage

```bash
docker stats
```

---

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify your `.env` configuration
3. Ensure Docker and Docker Compose are up to date
4. Check server resources: `df -h` and `free -m`

---

## 📝 Summary

**To deploy:**
```bash
cp .env.example .env
nano .env  # Set POSTGRES_PASSWORD and SESSION_SECRET
docker-compose up -d
```

**To access:**
- Local: `http://localhost:5000`
- Server: `http://your-server-ip:5000`
- Domain: `https://your-domain.com` (after nginx setup)

**To update:**
```bash
docker-compose down
git pull  # if using git
docker-compose up -d --build
```

**To backup:**
```bash
docker-compose exec db pg_dump -U aichecklist aichecklist > backup-$(date +%Y%m%d).sql
```

---

## 🎉 Next Steps

After deployment:

1. ✅ Test appointment booking at `/schedule/yourusername`
2. ✅ Configure email notifications (optional)
3. ✅ Set up push notifications (optional)
4. ✅ Configure payment processing (optional)
5. ✅ Schedule automated backups
6. ✅ Set up monitoring/alerts

Your AIChecklist.io is now live and ready for customers! 🚀
