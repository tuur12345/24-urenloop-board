# Complete Installation Guide

Dit document bevat gedetailleerde installatie-instructies voor alle deployment scenarios.

## 📋 Prerequisites Checklist

### Minimum Vereisten

- [ ] **OS:** Ubuntu 20.04+ / macOS 11+ / Windows 10+ met WSL2
- [ ] **RAM:** 2GB minimum, 4GB aanbevolen
- [ ] **Disk:** 2GB vrije ruimte
- [ ] **Network:** LAN netwerk met statische IP voor server

### Software Vereisten

**Voor Docker deployment (aanbevolen):**
- [ ] Docker 20.10+
- [ ] Docker Compose 2.0+

**Voor manual deployment:**
- [ ] Node.js 18+
- [ ] npm 9+
- [ ] Redis 6+
- [ ] Git

## 🚀 Quick Install (5 minuten)

### Voor Gevorderden

```bash
# 1. Clone
git clone <repo-url> 24-urenloop-board
cd 24-urenloop-board

# 2. Setup
chmod +x quickstart.sh
./quickstart.sh

# 3. Start client
cd client && npm run dev

# 4. Open browser
# http://localhost:5173
```

✅ Klaar!

## 📦 Methode 1: Docker Deployment (Aanbevolen)

### Stap 1: Installeer Docker

**Ubuntu/Debian:**
```bash
# Remove oude versies
sudo apt remove docker docker-engine docker.io containerd runc

# Install dependencies
sudo apt update
sudo apt install ca-certificates curl gnupg lsb-release

# Add Docker GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify
docker --version
docker compose version
```

**macOS:**
```bash
# Download Docker Desktop from https://www.docker.com/products/docker-desktop
# Or via Homebrew:
brew install --cask docker

# Start Docker Desktop
open /Applications/Docker.app

# Verify
docker --version
docker compose version
```

**Windows (WSL2):**
1. Install WSL2: `wsl --install`
2. Download Docker Desktop from https://www.docker.com/products/docker-desktop
3. Enable WSL2 backend in Docker Desktop settings
4. Verify in WSL2 terminal: `docker --version`

### Stap 2: Clone Repository

```bash
git clone <repo-url> 24-urenloop-board
cd 24-urenloop-board
```

### Stap 3: Configureer Environment

```bash
# Server config
cp server/.env.example server/.env
nano server/.env  # Edit if needed

# Client config (optioneel voor nu)
cp client/.env.example client/.env
```

### Stap 4: Start Docker Containers

```bash
docker compose up -d
```

**Verify containers:**
```bash
docker compose ps
# Should show redis and server as "Up"
```

**Check health:**
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":...}
```

### Stap 5: Installeer Client Dependencies

```bash
cd client
npm install
```

### Stap 6: Start Client

```bash
npm run dev
```

**Output:**
```
VITE v4.4.5  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.50:5173/
```

### Stap 7: Test

Open browser naar `http://localhost:5173` en verifieer:
- ✅ Connectie status toont "● Verbonden"
- ✅ Kan naam toevoegen
- ✅ Timer loopt

## 🔧 Methode 2: Manual Installation

### Stap 1: Installeer Node.js

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version  # Should be v18.x+
npm --version   # Should be 9.x+
```

**macOS:**
```bash
brew install node@18

# Verify
node --version
npm --version
```

**Windows:**
Download from https://nodejs.org/en/download/

### Stap 2: Installeer Redis

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify
redis-cli ping  # Should return "PONG"
```

**macOS:**
```bash
brew install redis

# Start Redis
brew services start redis

# Verify
redis-cli ping
```

**Windows:**
Use WSL2 or Docker for Redis (no native Windows support)

### Stap 3: Configureer Redis voor AOF

```bash
sudo nano /etc/redis/redis.conf
```

Voeg toe/wijzig:
```conf
appendonly yes
appendfsync everysec
```

Restart Redis:
```bash
sudo systemctl restart redis-server  # Linux
# of
brew services restart redis  # macOS
```

### Stap 4: Clone en Setup Project

```bash
git clone <repo-url> 24-urenloop-board
cd 24-urenloop-board

# Install dependencies
npm run install:all
# or manually:
cd server && npm install
cd ../client && npm install
```

### Stap 5: Configureer Environment

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env indien nodig (defaults should work)

# Client
cp client/.env.example client/.env
# Edit client/.env indien nodig
```

### Stap 6: Start Server

**Terminal 1:**
```bash
cd server
npm start
```

**Output:**
```
✓ Redis connected
✓ Socket.IO handlers configured

🚀 Server running on port 3001
   HTTP API: http://localhost:3001/api/state
   Socket.IO: ws://localhost:3001

   Ready for connections!
```

### Stap 7: Start Client

**Terminal 2:**
```bash
cd client
npm run dev
```

### Stap 8: Test

Browser → `http://localhost:5173`

## 🐧 Methode 3: Systemd Service (Production Linux)

Voor permanent deployment op een Linux server.

### Stap 1: Install op Server Locatie

```bash
sudo mkdir -p /opt/24-urenloop-board
sudo git clone <repo-url> /opt/24-urenloop-board
cd /opt/24-urenloop-board
```

### Stap 2: Install Dependencies

```bash
cd /opt/24-urenloop-board/server
sudo npm install --production
```

### Stap 3: Configure

```bash
sudo cp server/.env.example server/.env
sudo nano server/.env
```

Stel productie values in:
```bash
PORT=3001
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://192.168.1.50:5173
ADMIN_PIN=your-secure-pin
NODE_ENV=production
```

### Stap 4: Create Service User

```bash
sudo useradd -r -s /bin/false twentyfourhour
sudo chown -R twentyfourhour:twentyfourhour /opt/24-urenloop-board
```

### Stap 5: Install Systemd Service

```bash
sudo cp systemd/twentyfourhour.service /etc/systemd/system/
sudo nano /etc/systemd/system/twentyfourhour.service
```

Verify paths zijn correct:
```ini
WorkingDirectory=/opt/24-urenloop-board/server
ExecStart=/usr/bin/node src/index.js
```

### Stap 6: Enable en Start Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable twentyfourhour
sudo systemctl start twentyfourhour

# Check status
sudo systemctl status twentyfourhour

# View logs
sudo journalctl -u twentyfourhour -f
```

### Stap 7: Build en Deploy Client

**Optie A: Nginx hosting**

```bash
# Build client
cd /opt/24-urenloop-board/client
sudo npm install
sudo npm run build

# Install nginx
sudo apt install nginx

# Configure nginx
sudo nano /etc/nginx/sites-available/twentyfourhour
```

Nginx config:
```nginx
server {
    listen 80;
    server_name your-server-ip;

    root /opt/24-urenloop-board/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/twentyfourhour /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Optie B: Simple HTTP server**

```bash
cd /opt/24-urenloop-board/client
sudo npm install -g serve
serve -s dist -l 5173
```

## 🌐 LAN Setup (Twee Locaties)

### Scenario: Board op twee schermen op verschillende locaties

**Hardware:**
- Computer A: 192.168.1.50 (server + client 1)
- Computer B: 192.168.1.51 (client 2)

### Setup Computer A (Server)

```bash
# Start server (zie methode hierboven)
docker compose up -d
# of manual install

# Get IP
hostname -I  # Output: 192.168.1.50

# Configure firewall
sudo ufw allow 3001/tcp
sudo ufw enable
```

### Setup Computer B (Client)

```bash
git clone <repo-url> 24-urenloop-board
cd 24-urenloop-board/client
npm install

# Configure server URL
cp .env.example .env
nano .env
```

In `.env`:
```bash
VITE_SERVER_URL=http://192.168.1.50:3001
```

Start client:
```bash
npm run dev -- --host 0.0.0.0
```

Access op Computer B:
```
http://localhost:5173
```

### Verify Sync

1. Computer A: Voeg "Test" toe
2. Computer B: Moet "Test" zien binnen 200ms
3. Computer B: Sleep "Test" naar "queue"
4. Computer A: Moet beweging zien

## 🎯 Production Deployment Checklist

- [ ] Redis AOF persistence enabled
- [ ] Server draait als systemd service
- [ ] Firewall configured (ports 3001, 80)
- [ ] CORS_ORIGIN limited to specific IPs
- [ ] ADMIN_PIN set
- [ ] Client built for production (`npm run build`)
- [ ] Nginx configured als reverse proxy
- [ ] HTTPS enabled (via Let's Encrypt)
- [ ] Backups configured
- [ ] Monitoring enabled (logs, health checks)
- [ ] Documentation updated met server IP

## 🔍 Verification Steps

Na elke installatie:

1. **Server health:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Redis connection:**
   ```bash
   redis-cli ping
   ```

3. **Client access:**
   Browser → server URL → Check connectie status

4. **Realtime sync:**
   Open twee tabs → Add runner in tab 1 → Verify in tab 2

5. **Persistence:**
   ```bash
   # Add data
   # Restart server
   docker compose restart server
   # Verify data still there
   ```

## 🆘 Common Installation Issues

### "Cannot connect to Redis"

```bash
# Check Redis running
systemctl status redis-server

# Test connection
redis-cli ping

# Check Redis host in .env
cat server/.env | grep REDIS_HOST
```

### "npm install fails"

```bash
# Clear cache
npm cache clean --force

# Try again
rm -rf node_modules package-lock.json
npm install
```

### "Port 3001 already in use"

```bash
# Find process
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in server/.env
PORT=3002
```

### "Docker permission denied"

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again
```

## 📞 Support

Als je vast loopt:
1. Run `./troubleshoot.sh`
2. Check logs: `docker compose logs` or `journalctl -u twentyfourhour`
3. Verify environment variables
4. Check firewall settings
5. Open een GitHub issue met logs

## 🎓 Next Steps