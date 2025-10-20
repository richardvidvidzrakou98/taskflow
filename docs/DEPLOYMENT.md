# Deployment Guide

This guide covers deploying TaskFlow to various hosting platforms.

## Deployment Options

### 1. Vercel (Recommended)

Vercel provides seamless Next.js deployment with zero configuration.

#### Prerequisites

- GitHub repository
- Vercel account

#### Steps

1. **Connect Repository**

   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**

   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Import your TaskFlow repository
   - Configure project settings (defaults work fine)
   - Click "Deploy"

3. **Environment Configuration**
   - No additional environment variables needed
   - Data persists in JSON files (not recommended for production)

#### Custom Domain (Optional)

```bash
# Add custom domain in Vercel dashboard
# Update DNS records as instructed
```

### 2. Netlify

Alternative static hosting platform.

#### Steps

1. **Build Configuration**

   ```bash
   # netlify.toml
   [build]
     command = "npm run build"
     publish = ".next"
   ```

2. **Deploy**
   - Connect GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `.next`
   - Deploy

### 3. Docker Deployment

For containerized deployments.

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Build and Run

```bash
# Build image
docker build -t taskflow .

# Run container
docker run -p 3000:3000 taskflow
```

#### Docker Compose

```yaml
version: "3.8"
services:
  taskflow:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
```

### 4. VPS/Server Deployment

For dedicated server deployment.

#### Prerequisites

- Node.js 18+ installed
- PM2 process manager (recommended)

#### Steps

1. **Server Setup**

   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   npm install -g pm2
   ```

2. **Deploy Application**

   ```bash
   # Clone repository
   git clone https://github.com/yourusername/taskflow.git
   cd taskflow

   # Install dependencies
   npm install

   # Build application
   npm run build

   # Start with PM2
   pm2 start npm --name "taskflow" -- start
   pm2 save
   pm2 startup
   ```

3. **Reverse Proxy (Nginx)**

   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Production Considerations

### 1. Data Storage

**Current:** JSON files in `/data` directory
**Recommendation:** Migrate to a database for production

```typescript
// Replace file-based storage with database
// Consider PostgreSQL, MongoDB, or SQLite
```

### 2. Environment Variables

Create production environment configuration:

```bash
# .env.production
NODE_ENV=production
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://yourdomain.com
```

### 3. Security Enhancements

#### Enable HTTPS

```bash
# Using Certbot for Let's Encrypt
sudo certbot --nginx -d yourdomain.com
```

#### Security Headers

```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};
```

### 4. Performance Optimization

#### Enable Gzip Compression

```nginx
# In Nginx config
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

#### Caching Strategy

```typescript
// Add cache headers for static assets
export const metadata = {
  "Cache-Control": "public, max-age=31536000, immutable",
};
```

### 5. Monitoring & Logging

#### Error Tracking

```bash
# Consider integrating Sentry or LogRocket
npm install @sentry/nextjs
```

#### Performance Monitoring

```bash
# Vercel Analytics (if using Vercel)
npm install @vercel/analytics
```

## Health Checks

Add health check endpoint for monitoring:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: "OK", timestamp: new Date().toISOString() });
}
```

## Backup Strategy

For file-based data:

```bash
# Automated backup script
#!/bin/bash
tar -czf backup-$(date +%Y%m%d).tar.gz data/
```

## Troubleshooting

### Common Issues

1. **Build Failures**

   ```bash
   # Clear cache and rebuild
   rm -rf .next
   npm run build
   ```

2. **Memory Issues**

   ```bash
   # Increase Node.js memory limit
   NODE_OPTIONS="--max_old_space_size=4096" npm run build
   ```

3. **File Permissions**
   ```bash
   # Ensure data directory is writable
   chmod 755 data/
   ```

### Logs

```bash
# PM2 logs
pm2 logs taskflow

# Docker logs
docker logs container_name

# Vercel logs
vercel logs
```

## Scaling Considerations

For high-traffic deployments:

1. Implement database clustering
2. Use CDN for static assets
3. Add load balancing
4. Consider microservices architecture
5. Implement caching (Redis)

## Security Checklist

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Input validation implemented
- [ ] SQL injection prevention (when using database)
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Regular security updates
- [ ] Backup strategy in place
- [ ] Monitoring and alerting configured
