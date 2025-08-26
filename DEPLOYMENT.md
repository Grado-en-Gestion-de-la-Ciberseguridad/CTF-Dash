# CTF Dashboard Deployment Guide

## 📋 Prerequisites

Before deploying the CTF Dashboard, ensure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** package manager
- **Git** (for cloning the repository)

## 🚀 Quick Start Deployment

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repository-url>
cd CTF-Dash

# Install dependencies
npm install

# Initialize the database
npm run db:init

# Build the application
npm run build

# Start the production server
npm start
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database Configuration
DATABASE_URL=./data/ctf.db

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-here
NEXT_AUTH_SECRET=your-nextauth-secret-here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
CTF_EVENT_NAME="Campus Security Breach CTF"
CTF_EVENT_DESCRIPTION="A hacker has infiltrated campus security systems"

# Admin Configuration
DEFAULT_ADMIN_PASSWORD=SecureAdmin2025!
DEFAULT_STAFF_PASSWORD=StaffPass123!
```

### 3. Database Initialization

The application uses SQLite for data storage. Initialize the database:

```bash
# Create database schema and default users
npm run db:init

# Or manually run the initialization script
node scripts/init-db.js
```

## 🔐 Default Credentials

### Admin Account

- **Username:** `ctf_admin`
- **Password:** `SecureAdmin2025!`
- **Role:** Administrator
- **Permissions:** Full access to all features, team management, challenge management

### Staff Account

- **Username:** `staff1`
- **Password:** `StaffPass123!`
- **Role:** Staff
- **Permissions:** View submissions, manage teams, moderate challenges

### Team Registration

- Teams can register themselves through the `/teams` page
- Team names must be unique
- Passwords are automatically hashed using bcrypt
- Teams can have multiple members

## 🏗️ Production Deployment

### Option 1: Traditional VPS/Server Deployment

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone and setup application
git clone <your-repository-url> /opt/ctf-dashboard
cd /opt/ctf-dashboard
npm install
npm run build

# 4. Create systemd service
sudo nano /etc/systemd/system/ctf-dashboard.service
```

**Systemd Service Configuration:**

```ini
[Unit]
Description=CTF Dashboard Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/ctf-dashboard
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 5. Start and enable service
sudo systemctl daemon-reload
sudo systemctl enable ctf-dashboard
sudo systemctl start ctf-dashboard

# 6. Setup reverse proxy (Nginx)
sudo apt install nginx
sudo nano /etc/nginx/sites-available/ctf-dashboard
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
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

```bash
# Enable site and restart nginx
sudo ln -s /etc/nginx/sites-available/ctf-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Create data directory for SQLite
RUN mkdir -p /app/data

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  ctf-dashboard:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=/app/data/ctf.db
    volumes:
      - ./data:/app/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - ctf-dashboard
    restart: unless-stopped
```

Deploy with Docker:

```bash
# Build and start containers
docker-compose up -d

# Initialize database (first time only)
docker-compose exec ctf-dashboard npm run db:init

# View logs
docker-compose logs -f ctf-dashboard
```

### Option 3: Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Configure environment variables in Vercel dashboard
# - Add all variables from .env.local
# - Configure custom domain if needed
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | SQLite database path | `./data/ctf.db` | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `NEXT_AUTH_SECRET` | NextAuth secret | - | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` | Yes |
| `CTF_EVENT_NAME` | Event display name | `Campus Security Breach CTF` | No |
| `CTF_EVENT_DESCRIPTION` | Event description | - | No |
| `DEFAULT_ADMIN_PASSWORD` | Admin default password | `SecureAdmin2025!` | No |
| `DEFAULT_STAFF_PASSWORD` | Staff default password | `StaffPass123!` | No |

### Database Configuration

The application uses SQLite by default. For production deployments:

1. **Backup Strategy:** Regularly backup the `data/ctf.db` file
2. **Permissions:** Ensure the application has read/write access to the database directory
3. **Migration:** Use `npm run db:migrate` for schema updates

## 🛡️ Security Considerations

### 1. Change Default Passwords

```bash
# After deployment, immediately change default passwords through the admin panel
# Or use the API to update credentials
```

### 2. SSL/TLS Configuration

```bash
# Use Let's Encrypt for free SSL certificates
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. Firewall Configuration

```bash
# Configure UFW (Ubuntu)
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 4. Database Security

- Ensure database files are not publicly accessible
- Regular backups to secure location
- Consider encryption at rest for sensitive data

## 📊 Monitoring and Maintenance

### 1. Application Logs

```bash
# View application logs
sudo journalctl -u ctf-dashboard -f

# Docker logs
docker-compose logs -f ctf-dashboard
```

### 2. Database Maintenance

```bash
# Backup database
cp data/ctf.db data/ctf-backup-$(date +%Y%m%d).db

# Check database integrity
sqlite3 data/ctf.db "PRAGMA integrity_check;"
```

### 3. Performance Monitoring

```bash
# Check system resources
htop
df -h
free -h

# Check application status
sudo systemctl status ctf-dashboard
```

## 🔄 Updates and Maintenance

### 1. Application Updates

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild application
npm run build

# Restart service
sudo systemctl restart ctf-dashboard
```

### 2. Database Migrations

```bash
# Run any pending migrations
npm run db:migrate

# Backup before major updates
cp data/ctf.db data/ctf-backup-before-update.db
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**

   ```bash
   # Check database file permissions
   ls -la data/ctf.db
   
   # Ensure directory exists
   mkdir -p data
   ```

2. **Port Already in Use**

   ```bash
   # Find process using port 3000
   sudo netstat -tlnp | grep :3000
   
   # Kill process if needed
   sudo kill -9 <PID>
   ```

3. **Authentication Issues**

   ```bash
   # Reset admin password via database
   sqlite3 data/ctf.db "UPDATE users SET password_hash = '<new-hash>' WHERE username = 'ctf_admin';"
   ```

4. **Permission Denied**

   ```bash
   # Fix file permissions
   sudo chown -R www-data:www-data /opt/ctf-dashboard
   sudo chmod -R 755 /opt/ctf-dashboard
   ```

## 📞 Support

For deployment issues or questions:

1. Check the application logs first
2. Verify all environment variables are set correctly
3. Ensure database permissions are correct
4. Test network connectivity and firewall rules

## 🔗 Useful Commands

```bash
# Check application status
npm run status

# View real-time logs
npm run logs

# Backup database
npm run backup

# Reset to clean state (WARNING: Deletes all data)
npm run reset

# Health check
curl http://localhost:3000/api/health
```

This deployment guide should help you successfully deploy the CTF Dashboard in any environment while maintaining security and performance best practices.
