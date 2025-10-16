# Deployment Guide - 24-urenloop Board

Dit document beschrijft hoe je de applicatie deployed in verschillende scenario's.

## 🐳 Optie 1: Docker Deployment (Aanbevolen)

### Vereisten
- Docker 20.10+
- Docker Compose 2.0+

### Stappen

1. **Clone en configureer**
```bash
git clone <repo-url>
cd 24-urenloop-board
cp server/.env.example server/.env
# Bewerk server/.env indien nodig
```

2. **Start de services**
```bash
docker-compose up -d
```

3. **Controleer status**
```bash
docker-compose ps
docker-compose logs -f server
```

4. **Test de server**
```bash
curl http://localhost:3001/health
# Moet {"status":"ok","timestamp":...} teruggeven
```

5. **Start client (lokaal)**
```bash
cd client
npm install
cp .env.example .env
# Bewerk .env: VITE_SERVER_URL=http://<server-lan-ip>:3001
npm run dev
```

De client is nu beschikbaar op `http://localhost:5173`

### Client toegankelijk maken op LAN

Om de client op andere computers beschikbaar te maken:

**Optie A: Vite dev server**
```bash
cd client
npm run dev -- --host 0.0.0.0
```
Nu toegankelijk op `http://<jouw-lan-ip>:5173`

**Optie B: Production build + nginx**
```bash
cd client
npm run build
# Serve dist/ folder met nginx of andere webserver
```

### Stoppen
```bash
docker-compose down
# of met data cleanup:
docker-compose down -v
```

## 🔧 Optie 2: Manual Installation

### Server Setup

1. **Installeer Redis**
```bash
sudo apt update
sudo apt install redis-server
```

2. **Configureer Redis voor AOF**
```bash
sudo nano /etc/redis/redis.conf
# Voeg toe/wijzig:
appendonly yes
appendfsync everysec
```

```bash
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

3. **Installeer Node.js 18+**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

4. **Setup server**
```bash
cd server
npm install
cp .env.example .env
# Bewerk .env
npm start
```

### Client Setup

```bash
cd client
npm install
cp .env.example .env
# Bewerk .env met server URL
npm run dev
```

### Production build van client

```bash
cd client
npm run build
# Serve dist/ folder
npx serve -s dist -l 5173
```

## 🐧 Optie 3: Systemd Service (Production)

### Voorbereiding

1. **Installeer applicatie**
```bash
sudo mkdir -p /opt/24-urenloop-board
sudo cp -r server /opt/24-urenloop-board/
cd /opt/24-urenloop-board/server
sudo npm install --production
```

2. **Maak gebruiker**
```bash
sudo useradd -r -s /bin/false twentyfourhour
sudo chown -R twentyfourhour:twentyfourhour /opt/24-urenloop-board
```

3. **Installeer systemd service**
```bash
sudo cp systemd/twentyfourhour.service /etc/systemd/system/
sudo nano /etc/systemd/system/twentyfourhour.service
# Pas paths en environment variabelen aan
sudo systemctl daemon-reload
```

### Start service

```bash
sudo systemctl enable twentyfourhour
sudo systemctl start twentyfourhour
sudo systemctl status twentyfourhour
```

### Logs bekijken

```bash
sudo journalctl -u twentyfourhour -f
```

## 🌐 Nginx Reverse Proxy (Optioneel)

Voor productie kan je nginx gebruiken als reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Client (React app)
    location / {
        root /var/www/24-urenloop/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 🔥 Firewall Configuratie

**Ubuntu/Debian:**
```bash
sudo ufw allow 3001/tcp    # Server API + Socket.IO
sudo ufw allow 5173/tcp    # Client (development)
sudo ufw allow 80/tcp      # Nginx (production)
sudo ufw enable
```

## 🔐 Security Checklist

- [ ] Wijzig `CORS_ORIGIN` naar specifieke IPs in productie
- [ ] Stel `ADMIN_PIN` in voor delete operaties
- [ ] Gebruik HTTPS in productie (via nginx + Let's Encrypt)
- [ ] Beperk Redis toegang tot localhost of trusted IPs
- [ ] Run services als niet-root gebruiker
- [ ] Configureer firewall rules
- [ ] Backup Redis AOF files regelmatig

## 📊 Monitoring

### Health checks

**Server:**
```bash
curl http://localhost:3001/health
```

**Redis:**
```bash
redis-cli ping
redis-cli INFO persistence
```

### Resource gebruik

```bash
# Docker
docker stats

# System
htop
journalctl -u twentyfourhour --since today
```

## 🆘 Troubleshooting

### Server start niet

```bash
# Check logs
docker-compose logs server
# of
sudo journalctl -u twentyfourhour -n 50

# Check Redis
redis-cli ping
```

### Client kan niet verbinden

1. Check server draait: `curl http://<server-ip>:3001/health`
2. Check firewall: `sudo ufw status`
3. Check `.env` in client heeft correct `VITE_SERVER_URL`
4. Check browser console voor CORS errors

### Data verloren na restart

1. Controleer Redis AOF: `redis-cli CONFIG GET appendonly`
2. Check AOF bestand: `ls -lh /var/lib/redis/appendonly.aof`
3. Herstel van backup indien nodig

### Performance issues

1. Check Redis memory: `redis-cli INFO memory`
2. Check server resources: `htop`
3. Verhoog `maxmemory` in redis.conf indien nodig
4. Optimaliseer event log trimming in `runnerService.js`

## 🔄 Updates

```bash
cd 24-urenloop-board
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

Of zonder Docker:
```bash
cd server && npm install && sudo systemctl restart twentyfourhour
cd ../client && npm install && npm run build
```