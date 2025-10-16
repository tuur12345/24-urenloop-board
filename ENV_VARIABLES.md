# Environment Variables Reference

Complete documentatie van alle environment variables gebruikt in het 24-urenloop Board project.

## 📋 Server Environment Variables

**File:** `server/.env`

### Required Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `PORT` | number | `3001` | Port waarop de server draait |
| `REDIS_HOST` | string | `localhost` | Redis server hostname/IP |
| `REDIS_PORT` | number | `6379` | Redis server port |

### Optional Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `CORS_ORIGIN` | string | `*` | Allowed CORS origins (comma-separated) |
| `ADMIN_PIN` | string | _(empty)_ | PIN voor delete operaties (leeg = geen PIN) |
| `NODE_ENV` | string | `development` | Environment (development/production) |
| `LOG_LEVEL` | string | `info` | Logging level (error/warn/info/debug) |

### Example Configuration

**Development:**
```bash
PORT=3001
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=*
ADMIN_PIN=
NODE_ENV=development
```

**Production:**
```bash
PORT=3001
REDIS_HOST=redis
REDIS_PORT=6379
CORS_ORIGIN=http://192.168.1.100:5173,http://192.168.1.101:5173
ADMIN_PIN=your-secure-pin-here
NODE_ENV=production
LOG_LEVEL=warn
```

**Docker Compose:**
```bash
PORT=3001
REDIS_HOST=redis
REDIS_PORT=6379
CORS_ORIGIN=*
ADMIN_PIN=
NODE_ENV=production
```

## 📋 Client Environment Variables

**File:** `client/.env`

### Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_SERVER_URL` | string | `http://localhost:3001` | URL van de backend server |

### Example Configuration

**Development (local):**
```bash
VITE_SERVER_URL=http://localhost:3001
```

**Development (LAN):**
```bash
VITE_SERVER_URL=http://192.168.1.50:3001
```

**Production:**
```bash
VITE_SERVER_URL=http://your-server-domain.com:3001
# of met nginx reverse proxy:
VITE_SERVER_URL=http://your-server-domain.com
```

## 🔐 Security Considerations

### CORS_ORIGIN

**⚠️ WARNING:** `CORS_ORIGIN=*` is alleen veilig in een vertrouwd LAN netwerk.

**Best Practices:**

```bash
# Development - alles toestaan
CORS_ORIGIN=*

# Production - specifieke origins
CORS_ORIGIN=http://192.168.1.100:5173,http://192.168.1.101:5173

# Met nginx reverse proxy
CORS_ORIGIN=https://your-domain.com
```

### ADMIN_PIN

**Wanneer gebruiken:**
- Productie environments
- Wanneer meerdere gebruikers toegang hebben
- Om accidentele deletes te voorkomen

**Best Practices:**
```bash
# Geen PIN (alleen voor development/trusted environment)
ADMIN_PIN=

# Simpele PIN voor interne events
ADMIN_PIN=1234

# Veiligere PIN
ADMIN_PIN=secure-pin-2024
```

**⚠️ NOTE:** Dit is geen sterke authenticatie. Voor echte beveiliging, implementeer proper authentication.

## 🐳 Docker-Specific Variables

**In `docker-compose.yml`:**

```yaml
services:
  server:
    environment:
      - PORT=3001
      - REDIS_HOST=redis  # Container naam, niet localhost!
      - REDIS_PORT=6379
      - CORS_ORIGIN=${CORS_ORIGIN:-*}
      - ADMIN_PIN=${ADMIN_PIN:-}
```

**Override met `.env` in root:**
```bash
# In project root: .env
CORS_ORIGIN=http://192.168.1.100:5173
ADMIN_PIN=my-pin
```

## 🔧 Redis Configuration

**Via `redis.conf`:**

```conf
# Persistence
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec

# Memory
maxmemory 256mb
maxmemory-policy allkeys-lru

# Network
bind 0.0.0.0
port 6379
```

**Relevante environment variables (als je Redis draait zonder config file):**

```bash
REDIS_APPENDONLY=yes
REDIS_APPENDFSYNC=everysec
REDIS_MAXMEMORY=256mb
```

## 📱 Client Build-time Variables

**Vite injects environment variables at BUILD time.**

```bash
# Build with custom server URL
VITE_SERVER_URL=http://production-server.com:3001 npm run build
```

**⚠️ IMPORTANT:** 
- Vite variables MUST start with `VITE_`
- Client `.env` is read at BUILD time, not runtime
- To change server URL after build, you must rebuild

## 🧪 Testing Environment Variables

**Voor tests:**

```bash
# server/tests/setup.js
process.env.NODE_ENV = 'test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6380'; // Different port
```

## 📊 Variable Validation

**Server startup validatie:**

```javascript
// server/src/config.js (optioneel te maken)
const requiredEnvVars = ['PORT', 'REDIS_HOST', 'REDIS_PORT'];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});
```

## 🔄 Runtime vs Build-time

### Server (Runtime)

Server environment variables worden gelezen bij **server start**:

```bash
PORT=3002 npm start  # Werkt!
```

### Client (Build-time)

Client environment variables worden gelezen bij **build**:

```bash
VITE_SERVER_URL=http://new-server.com npm run build  # Baked into bundle
```

Voor runtime changes in production, gebruik config file of API call:

```javascript
// client/src/config.js
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 
                          window.CONFIG?.SERVER_URL || 
                          'http://localhost:3001';
```

## 🌍 Multi-Environment Setup

**Project structuur:**

```
server/
  .env.development
  .env.production
  .env.test
```

**Package.json scripts:**

```json
{
  "scripts": {
    "start:dev": "NODE_ENV=development node src/index.js",
    "start:prod": "NODE_ENV=production node src/index.js",
    "test": "NODE_ENV=test jest"
  }
}
```

**Met dotenv:**

```javascript
// server/src/index.js
import dotenv from 'dotenv';

const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envFile });
```

## 📝 Quick Reference

### Development Checklist

- [ ] `server/.env` exists
- [ ] `REDIS_HOST=localhost` (or Docker container name)
- [ ] `CORS_ORIGIN=*`
- [ ] `client/.env` exists
- [ ] `VITE_SERVER_URL` points to correct server

### Production Checklist

- [ ] `CORS_ORIGIN` limited to specific origins
- [ ] `ADMIN_PIN` set (if needed)
- [ ] `NODE_ENV=production`
- [ ] `VITE_SERVER_URL` points to production server
- [ ] No secrets in version control
- [ ] `.env` files in `.gitignore`

## 🆘 Troubleshooting

### "Cannot connect to Redis"

**Check:**
```bash
echo $REDIS_HOST  # Should be 'localhost' or container name
echo $REDIS_PORT  # Should be 6379
```

**Fix:**
```bash
# For Docker
REDIS_HOST=redis

# For local
REDIS_HOST=localhost
```

### "CORS error in browser"

**Check:**
```bash
echo $CORS_ORIGIN
```

**Fix:**
```bash
# Development
CORS_ORIGIN=*

# Production
CORS_ORIGIN=http://192.168.1.100:5173
```

### "Client connects to wrong server"

**Check:**
```bash
cat client/.env | grep VITE_SERVER_URL
```

**Fix:**
```bash
# Update client/.env
VITE_SERVER_URL=http://correct-server-ip:3001

# Rebuild
cd client && npm run build
```

### "Changes to .env not working"

**Server:** Restart server
```bash
docker-compose restart server
# or
npm start
```

**Client:** Rebuild
```bash
cd client && npm run build
```

## 📚 Further Reading

- [dotenv Documentation](https://github.com/motdotla/dotenv)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Docker Compose Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Twelve-Factor App Config](https://12factor.net/config)