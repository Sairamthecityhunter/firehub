# 🚀 FirehubECO Deployment Guide

This guide will help you deploy your FirehubECO application to production using Docker.

## 📋 Prerequisites

Before deploying, ensure you have:

- **Docker** (v20.10+) and **Docker Compose** (v2.0+) installed
- **Domain name** pointed to your server
- **SSL certificate** (Let's Encrypt recommended)
- **AWS S3 bucket** for file storage
- **Stripe account** for payments
- **Email service** (Gmail, SendGrid, etc.)
- **Server** with at least 2GB RAM and 20GB storage

## 🔧 Deployment Options

### Option 1: Docker Compose (Recommended)

#### 1. **Prepare Environment Variables**

```bash
# Copy environment files
cp env.production.example .env
cp frontend/env.production.example frontend/.env.production

# Edit with your actual values
nano .env
nano frontend/.env.production
```

#### 2. **Configure Environment Variables**

**Backend (.env):**
```bash
# Django Settings
DEBUG=False
SECRET_KEY=your-super-secret-production-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DB_NAME=erostream_prod
DB_USER=erostream_user
DB_PASSWORD=your-secure-database-password

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=your-s3-bucket-name

# Stripe
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key

# Email
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

**Frontend (.env.production):**
```bash
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
```

#### 3. **Deploy with Script**

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

#### 4. **Manual Deployment Steps**

If you prefer manual deployment:

```bash
# Build images
docker-compose build --no-cache

# Start services
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

### Option 2: Cloud Deployment

#### **AWS ECS/Fargate**

1. Push images to ECR
2. Create ECS cluster
3. Configure load balancer
4. Set up RDS for database
5. Configure ElastiCache for Redis

#### **Google Cloud Run**

1. Build and push to Container Registry
2. Deploy backend to Cloud Run
3. Deploy frontend to Cloud Storage + CDN
4. Configure Cloud SQL for database

#### **DigitalOcean App Platform**

1. Connect GitHub repository
2. Configure build settings
3. Set environment variables
4. Deploy with managed database

## 🔒 Security Configuration

### 1. **SSL/TLS Setup**

**Using Let's Encrypt with Certbot:**

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. **Firewall Configuration**

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Block direct access to backend
sudo ufw deny 8000/tcp
```

### 3. **Environment Security**

- Use strong passwords (20+ characters)
- Enable 2FA on all accounts
- Rotate secrets regularly
- Use environment-specific keys
- Never commit secrets to version control

## 📊 Monitoring & Maintenance

### 1. **Health Checks**

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Check specific service
docker-compose logs backend
```

### 2. **Database Backups**

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T db pg_dump -U $DB_USER $DB_NAME > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
rm backup_$DATE.sql
EOF

# Schedule daily backups
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

### 3. **Log Management**

```bash
# Rotate logs
docker-compose exec backend python manage.py clearsessions
docker system prune -f

# Set up log rotation
sudo nano /etc/logrotate.d/docker
```

## 🚀 Performance Optimization

### 1. **Database Optimization**

```sql
-- PostgreSQL optimizations
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
SELECT pg_reload_conf();
```

### 2. **Redis Configuration**

```bash
# Optimize Redis
docker-compose exec redis redis-cli CONFIG SET maxmemory 256mb
docker-compose exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### 3. **CDN Setup**

Configure CloudFlare or AWS CloudFront for:
- Static file delivery
- Image optimization
- Global caching
- DDoS protection

## 🔄 Updates & Maintenance

### 1. **Application Updates**

```bash
# Pull latest code
git pull origin main

# Rebuild and deploy
docker-compose build --no-cache
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate
```

### 2. **Scaling**

**Horizontal Scaling:**
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
  
  celery:
    deploy:
      replicas: 2
```

**Vertical Scaling:**
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database status
   docker-compose exec db pg_isready
   
   # Reset database
   docker-compose down -v
   docker-compose up -d
   ```

2. **Static Files Not Loading**
   ```bash
   # Recollect static files
   docker-compose exec backend python manage.py collectstatic --clear --noinput
   ```

3. **Memory Issues**
   ```bash
   # Check memory usage
   docker stats
   
   # Increase swap space
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

### Logs to Check

```bash
# Application logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs celery

# System logs
sudo journalctl -u docker
sudo tail -f /var/log/nginx/error.log
```

## 📞 Support

For deployment issues:

1. Check the logs first
2. Review environment variables
3. Verify network connectivity
4. Check resource usage
5. Consult the troubleshooting section

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Database backups scheduled
- [ ] Monitoring set up
- [ ] Firewall configured
- [ ] CDN configured
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Security headers configured
- [ ] Rate limiting enabled

Your FirehubECO application is now ready for production! 🎉
