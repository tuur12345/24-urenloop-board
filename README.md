# 24-urenloop Realtime Board

Een realtime dashboard voor het beheren van lopers tijdens een 24-urenloop, gesynchroniseerd via LAN.

## 📁 Repository Structuur

```
24-urenloop-board/
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── index.js       # Server entry point
│   │   ├── redis.js       # Redis client configuratie
│   │   ├── socketHandler.js  # Socket.IO event handlers
│   │   └── runnerService.js   # Business logica
│   ├── tests/
│   │   └── api.test.js    # Unit tests
│   ├── package.json
│   └── .env.example
├── client/                # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main component
│   │   ├── components/
│   │   │   ├── Board.jsx
│   │   │   ├── Column.jsx
│   │   │   └── RunnerCard.jsx
│   │   ├── hooks/
│   │   │   └── useSocket.js
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── systemd/
│   └── twentyfourhour.service
└── README.md
```

## 🚀 Snelle Start met Docker

### Vereisten
- Docker & Docker Compose
- Node.js 18+ (voor lokale development)

### Installatie

1. **Clone de repository**
```bash
git clone <repo-url>
cd 24-urenloop-board
```

2. **Start met Docker Compose**
```bash
docker-compose up -d
```

Dit start:
- Redis (poort 6379) met AOF persistence
- Server (poort 3001)

3. **Start de client (development)**
```bash
cd client
npm install
npm run dev
```

De client draait op `http://localhost:5173`

4. **Open op tweede locatie**
   - Op een andere computer in hetzelfde LAN:
   - Navigeer naar `http://<server-ip>:5173`

## 🔧 Handmatige Installatie

### Redis Setup

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server
```

**Redis configuratie** (`/etc/redis/redis.conf`):
```conf
appendonly yes
appendfsync everysec
```

Herstart Redis:
```bash
sudo systemctl restart redis-server
```

### Server Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env met jouw configuratie
npm start
```

**Environment variabelen** (`.env`):
```env
PORT=3001
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=*
ADMIN_PIN=  # Optioneel: PIN voor delete acties
```

### Client Setup

```bash
cd client
npm install
# Edit src/config.js om server URL aan te passen indien nodig
npm run dev      # Development
npm run build    # Production build
npm run preview  # Preview production build
```

## 🐧 Systemd Service (optioneel)

Voor productie-deployment op Linux:

```bash
sudo cp systemd/twentyfourhour.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable twentyfourhour
sudo systemctl start twentyfourhour
```

**Let op:** Pas paths aan in `twentyfourhour.service` naar jouw installatie locatie.

## 🧪 Testing

### Server Unit Tests
```bash
cd server
npm test
```

### E2E Test (handmatig)

1. Open twee browser tabs: `http://<server-ip>:5173`
2. **Tab 1:** Voeg "Alice" toe → verschijnt in "aan het opwarmen"
3. **Tab 2:** Verifieer dat "Alice" zichtbaar is
4. **Tab 1:** Sleep "Alice" naar "in de wachtrij"
5. **Tab 2:** Verifieer dat beweging zichtbaar is binnen 200ms
6. **Tab 2:** Sleep "Alice" naar "heeft gelopen"
7. **Tab 1:** Verifieer status en klik op rood kruisje om te verwijderen
8. **Tab 2:** Verifieer dat "Alice" verdwenen is

Timer accuracy test:
- Voeg runner toe en laat 1+ minuten lopen
- Refresh beide tabs → timers moeten identiek zijn (server-authoritative)

## 📊 Architectuur

### Data Flow
```
Client 1 ─────┐
              ├──> Socket.IO ──> Server ──> Redis (AOF)
Client 2 ─────┘                    │
                                   └──> Broadcast to all clients
```

### Redis Keys
- `runners:state` - JSON object met alle runners
- `runners:events` - List met event log (LPUSH/LTRIM)

### Runner States
1. **warming** - Opwarmen (start_ts gezet)
2. **queue** - Wachtrij (queue_ts gezet)
3. **done** - Heeft gelopen (end_ts gezet)

### API Endpoints
- `GET /api/state` - Huidige state ophalen
- `POST /api/add` - Nieuwe runner toevoegen
- `POST /api/move` - Runner verplaatsen
- `POST /api/remove/:id` - Runner verwijderen

**Let op:** Realtime updates gaan via Socket.IO, niet via polling.

## 🔐 Security

- CORS: Standaard `*` (alle origins). Voor productie: pas `CORS_ORIGIN` aan naar specifieke IPs.
- Admin PIN: Optioneel via `ADMIN_PIN` environment variable voor delete acties.
- LAN-only: Deploy de server op een lokaal netwerk, niet publiek toegankelijk.

## 🐛 Troubleshooting

### "Cannot connect to server"
- Controleer of server draait: `curl http://localhost:3001/api/state`
- Controleer firewall: `sudo ufw allow 3001`
- Controleer client config in `src/config.js`

### "Redis connection failed"
- Controleer Redis status: `sudo systemctl status redis-server`
- Test connectie: `redis-cli ping` (moet "PONG" teruggeven)

### "Timers lopen niet synchroon"
- Dit zou niet mogen gebeuren (server-authoritative)
- Check browser console voor errors
- Verifieer server tijd: `curl http://localhost:3001/api/state` en check timestamps

### State verdwijnt na server restart
- Controleer Redis AOF: `redis-cli CONFIG GET appendonly` (moet "yes" zijn)
- Check Redis logs: `sudo journalctl -u redis-server -n 50`

## 🤝 Development

### Code Structure
- **Server**: Express routes + Socket.IO handlers → Business logic → Redis
- **Client**: React components met Socket.IO hooks → Optimistic UI updates
- **State sync**: Server is single source of truth, client wordt resync'd bij conflicts

### Aannames
- LAN heeft stabiele latency (<50ms)
- Server tijd is referentie voor alle timestamps
- Redis is single instance (geen cluster nodig voor dit gebruik)
- Max ~100 gelijktijdige runners (schaalbaar tot 1000+)

## 📝 Licentie

MIT License - Vrij te gebruiken voor je 24-urenloop event!

## 🆘 Support

Bij problemen: check de issues in deze repository of open een nieuwe.
