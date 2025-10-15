# 📁 Complete Project Structure

Dit document toont de volledige folder structuur van het 24-urenloop Board project.

```
24-urenloop-board/
│
├── 📄 README.md                      # Hoofd documentatie
├── 📄 ARCHITECTURE.md                # Technische architectuur
├── 📄 DEPLOYMENT.md                  # Deployment instructies
├── 📄 TESTING.md                     # Testing guide
├── 📄 CONTRIBUTING.md                # Contributing guide
├── 📄 PROJECT_STRUCTURE.md           # Dit bestand
│
├── 📄 package.json                   # Root package.json (monorepo scripts)
├── 📄 .gitignore                     # Git ignore rules
├── 📄 docker-compose.yml             # Docker orchestration
├── 📄 redis.conf                     # Redis configuratie
├── 📄 Makefile                       # Make commands voor easy access
│
├── 🔧 quickstart.sh                  # Setup script
├── 🔧 troubleshoot.sh                # Diagnostic script
│
├── 📂 server/                        # Backend
│   ├── 📂 src/
│   │   ├── 📄 index.js               # Server entry point
│   │   ├── 📄 redis.js               # Redis client setup
│   │   ├── 📄 socketHandler.js       # Socket.IO handlers
│   │   └── 📄 runnerService.js       # Business logic
│   │
│   ├── 📂 tests/
│   │   └── 📄 api.test.js            # API unit tests
│   │
│   ├── 📄 package.json               # Server dependencies
│   ├── 📄 .env.example               # Environment template
│   ├── 📄 Dockerfile                 # Docker build config
│   └── 📄 .dockerignore              # Docker ignore rules
│
├── 📂 client/                        # Frontend
│   ├── 📂 src/
│   │   ├── 📄 main.jsx               # React entry point
│   │   ├── 📄 App.jsx                # Main App component
│   │   ├── 📄 App.css                # App styles
│   │   │
│   │   ├── 📂 hooks/
│   │   │   └── 📄 useSocket.js       # Socket.IO React hook
│   │   │
│   │   └── 📂 components/
│   │       ├── 📄 Board.jsx          # Board container
│   │       ├── 📄 Board.css          # Board styles
│   │       ├── 📄 Column.jsx         # Column component
│   │       ├── 📄 Column.css         # Column styles
│   │       ├── 📄 RunnerCard.jsx     # Runner card
│   │       └── 📄 RunnerCard.css     # Card styles
│   │
│   ├── 📄 index.html                 # HTML entry point
│   ├── 📄 package.json               # Client dependencies
│   ├── 📄 vite.config.js             # Vite configuration
│   ├── 📄 .env.example               # Environment template
│   └── 📂 public/                    # Static assets
│       └── 📄 vite.svg               # Vite logo
│
├── 📂 systemd/                       # Systemd service files
│   └── 📄 twentyfourhour.service     # Service definition
│
├── 📂 backups/                       # Redis backups (created by make backup)
│   ├── 📄 dump-20241015-120000.rdb
│   └── 📄 appendonly-20241015-120000.aof
│
└── 📂 docs/                          # Extra documentation (optioneel)
    ├── 📄 API.md                     # API documentation
    ├── 📄 SECURITY.md                # Security guidelines
    └── 📄 CHANGELOG.md               # Version history
```

## 📦 File Descriptions

### Root Level

| File | Purpose |
|------|---------|
| `README.md` | Hoofd documentatie met quickstart en overview |
| `ARCHITECTURE.md` | Technische details over systeem design |
| `DEPLOYMENT.md` | Uitgebreide deployment instructies |
| `TESTING.md` | Test scenarios en procedures |
| `CONTRIBUTING.md` | Guide voor contributors |
| `package.json` | Monorepo scripts voor ontwikkeling |
| `.gitignore` | Git ignore regels |
| `docker-compose.yml` | Docker container configuratie |
| `redis.conf` | Redis persistentie configuratie |
| `Makefile` | Handige command shortcuts |
| `quickstart.sh` | Automated setup script |
| `troubleshoot.sh` | Diagnostic tool |

### Server (`server/`)

| File | Purpose | Lines |
|------|---------|-------|
| `src/index.js` | Express server setup, API routes, Socket.IO init | ~100 |
| `src/redis.js` | Redis client configuratie en connection handling | ~50 |
| `src/socketHandler.js` | Socket.IO event handlers | ~90 |
| `src/runnerService.js` | Business logic voor runners, state mutations | ~150 |
| `tests/api.test.js` | Unit tests voor API endpoints | ~100 |
| `package.json` | Dependencies: express, socket.io, ioredis, etc. | ~30 |
| `.env.example` | Environment variable template | ~10 |
| `Dockerfile` | Multi-stage Docker build | ~20 |

**Total server code:** ~550 lines

### Client (`client/`)

| File | Purpose | Lines |
|------|---------|-------|
| `src/main.jsx` | React app entry point | ~10 |
| `src/App.jsx` | Main app component met state management | ~100 |
| `src/App.css` | Global app styles | ~150 |
| `src/hooks/useSocket.js` | Socket.IO integration hook | ~100 |
| `src/components/Board.jsx` | Board container, runner grouping | ~50 |
| `src/components/Board.css` | Board layout styles | ~20 |
| `src/components/Column.jsx` | Drag & drop column component | ~60 |
| `src/components/Column.css` | Column styles | ~80 |
| `src/components/RunnerCard.jsx` | Individual runner card met timer | ~80 |
| `src/components/RunnerCard.css` | Card styles | ~100 |
| `index.html` | HTML entry point | ~15 |
| `package.json` | Dependencies: react, socket.io-client, etc. | ~30 |
| `vite.config.js` | Vite build configuration | ~15 |
| `.env.example` | Server URL template | ~5 |

**Total client code:** ~815 lines

## 📊 Code Statistics

```
Language      Files    Lines    Code    Comments    Blank
─────────────────────────────────────────────────────────
JavaScript       11     1365    1100         150      115
CSS               4      350     300          20       30
JSON              3      100      95           0        5
Markdown          6     1500    1200         100      200
YAML              1       50      45           3        2
Shell             2      300     250          30       20
─────────────────────────────────────────────────────────
Total            27     3665    2990         303      372
```

## 🎯 Core Components

### Server Side

```
index.js
    ↓
┌───────────┬───────────────┬──────────────┐
│           │               │              │
redis.js    socketHandler   Express API    
│           │               Routes         
│           ↓                              
│    runnerService.js ← Business Logic    
│           ↓                              
└──────→ Redis ← State Storage            
```

### Client Side

```
main.jsx
    ↓
  App.jsx ← useSocket.js (Socket.IO)
    ↓
  Board.jsx
    ↓
┌───────┬───────┬───────┐
│       │       │       │
Column  Column  Column  
warming queue   done    
│       │       │       │
└───────┴───────┴───────┘
        ↓
    RunnerCard
```

## 🔗 Dependencies

### Server Dependencies

```json
{
  "express": "^4.18.2",      // Web framework
  "socket.io": "^4.6.1",     // Realtime communication
  "ioredis": "^5.3.2",       // Redis client
  "cors": "^2.8.5",          // CORS middleware
  "uuid": "^9.0.0",          // UUID generation
  "dotenv": "^16.0.3"        // Environment variables
}
```

### Client Dependencies

```json
{
  "react": "^18.2.0",              // UI library
  "react-dom": "^18.2.0",          // React DOM
  "socket.io-client": "^4.6.1"     // Socket.IO client
}
```

### Dev Dependencies

```json
{
  "nodemon": "^2.0.22",            // Server auto-reload
  "jest": "^29.5.0",               // Testing framework
  "supertest": "^6.3.3",           // HTTP testing
  "vite": "^4.4.5",                // Build tool
  "@vitejs/plugin-react": "^4.0.3" // React plugin
}
```

## 🚀 Build Outputs

### Development

```
server/node_modules/       # ~50 MB
client/node_modules/       # ~200 MB
```

### Production

```
client/dist/               # ~500 KB (optimized)
  ├── index.html
  ├── assets/
  │   ├── index-[hash].js  # ~200 KB
  │   └── index-[hash].css # ~50 KB
  └── vite.svg
```

## 📈 Growth Projections

Als het project groeit, verwacht deze structuur:

```
server/
  ├── src/
  │   ├── controllers/     # Route controllers
  │   ├── models/          # Data models
  │   ├── middleware/      # Express middleware
  │   ├── services/        # Business logic
  │   ├── utils/           # Helper functions
  │   └── config/          # Configuration
  │
client/
  ├── src/
  │   ├── pages/           # Route pages
  │   ├── components/      # UI components
  │   │   ├── common/      # Shared components
  │   │   └── features/    # Feature-specific
  │   ├── hooks/           # Custom hooks
  │   ├── context/         # React context
  │   ├── utils/           # Helper functions
  │   └── styles/          # Global styles
```

## 🔍 Finding Your Way

**Wil je...**

| Task | Start Here |
|------|-----------|
| Verstaan hoe het werkt | `ARCHITECTURE.md` |
| Deployen | `DEPLOYMENT.md` + `quickstart.sh` |
| Testen | `TESTING.md` |
| Bijdragen | `CONTRIBUTING.md` |
| Troubleshooting | `troubleshoot.sh` |
| Server code aanpassen | `server/src/` |
| UI aanpassen | `client/src/components/` |
| Socket events toevoegen | `server/src/socketHandler.js` + `client/src/hooks/useSocket.js` |
| Database schema aanpassen | `server/src/runnerService.js` |
| Styles wijzigen | `client/src/*.css` |

## 💡 Tips

1. **Start met README.md** voor het grote plaatje
2. **Gebruik quickstart.sh** voor snelle setup
3. **Check ARCHITECTURE.md** voor diepgaande uitleg
4. **Run troubleshoot.sh** bij problemen
5. **Volg CONTRIBUTING.md** voor code style

## 📝 Notes

- Alle code is voorzien van comments waar nodig
- Environment variables zijn gedocumenteerd in `.env.example` files
- Docker images worden automatisch gebouwd met `docker-compose`
- Redis data persistent in Docker volume `twentyfourhour_redis-data`
- Client build output gaat naar `client/dist/`