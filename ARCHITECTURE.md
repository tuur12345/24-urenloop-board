# Architecture - 24-urenloop Board

## 🏗️ Systeem Overzicht

```
┌─────────────────────────────────────────────────────────────┐
│                         LAN Network                          │
│  ┌──────────────┐              ┌──────────────┐            │
│  │  Client 1    │              │  Client 2    │            │
│  │  (Browser)   │              │  (Browser)   │            │
│  └──────┬───────┘              └──────┬───────┘            │
│         │ Socket.IO                   │ Socket.IO          │
│         │ (WebSocket)                 │ (WebSocket)        │
│         └──────────────┬──────────────┘                    │
│                        │                                     │
│              ┌─────────▼─────────┐                          │
│              │   Node.js Server  │                          │
│              │   (Express +      │                          │
│              │    Socket.IO)     │                          │
│              └─────────┬─────────┘                          │
│                        │                                     │
│                        │ ioredis                            │
│                        │                                     │
│              ┌─────────▼─────────┐                          │
│              │      Redis        │                          │
│              │   (AOF enabled)   │                          │
│              └───────────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Design Principles

### 1. Server-Authoritative Architecture

**Waarom:** Voorkomt race conditions en zorgt voor consistente state over alle clients.

**Implementatie:**
- Server is single source of truth
- Alle state mutations gaan via server
- Timestamps worden door server gezet
- Clients tonen alleen data, voeren geen business logic uit

### 2. Event-Driven Communication

**Socket.IO Events:**

**Client → Server:**
- `request:state` - Vraag volledige state op
- `runner:add` - Voeg nieuwe runner toe
- `runner:move` - Verplaats runner tussen kolommen
- `runner:remove` - Verwijder runner

**Server → Client:**
- `state` - Volledige state dump (bij connect/resync)
- `runner:added` - Nieuwe runner toegevoegd
- `runner:moved` - Runner verplaatst
- `runner:removed` - Runner verwijderd
- `error` - Error met optionele resync flag

### 3. Optimistic UI met Rollback

**Flow:**
```
User Action → Optimistic Update → Send to Server → 
  ↓ Success: Keep update
  ↓ Error: Rollback + Resync
```

**Implementatie:**
- Client stuurt actie naar server
- Server valideert en past state aan in Redis
- Server broadcast naar alle clients (inclusief afzender)
- Bij error: client ontvangt `error` event + fresh `state`

## 📊 Data Model

### Runner Object

```typescript
interface Runner {
  id: string;              // UUID v4
  name: string;            // Runner naam
  status: 'warming' | 'queue' | 'done';
  start_ts: number;        // Unix timestamp (ms) - wanneer toegevoegd
  queue_ts: number | null; // Unix timestamp (ms) - wanneer naar queue
  end_ts: number | null;   // Unix timestamp (ms) - wanneer naar done
  created_by: string;      // Socket ID of 'api' of 'system'
  last_modified_by: string;
}
```

### Event Log Entry

```typescript
interface EventLogEntry {
  event_id: string;        // UUID v4
  type: 'add' | 'move' | 'remove';
  runner_id: string;
  from?: string;           // Voor 'move' events
  to?: string;             // Voor 'move' events
  ts: number;              // Unix timestamp (ms)
  actor: string;           // Socket ID of 'api' of 'system'
  data?: any;              // Extra metadata
}
```

### Redis Keys

```
runners:state    → JSON string van { runners: { [id]: Runner } }
runners:events   → List (LPUSH) van EventLogEntry JSON strings
```

## 🔄 State Management Flow

### Add Runner

```
Client              Server              Redis
  │                   │                   │
  ├─runner:add────────>│                   │
  │                   ├─Validate name     │
  │                   ├─Generate UUID     │
  │                   ├─Create runner     │
  │                   ├─state + event─────>│
  │                   │                   ├─PERSIST
  │<──runner:added────┤<──────────────────┤
  │                   │                   │
  └─Update UI         └─Broadcast to all │
```

### Move Runner

```
Client              Server              Redis
  │                   │                   │
  ├─runner:move───────>│                   │
  │                   ├─Get state─────────>│
  │                   │<──────────────────┤
  │                   ├─Validate runner   │
  │                   ├─Update status     │
  │                   ├─Set timestamp     │
  │                   ├─state + event─────>│
  │                   │                   ├─PERSIST
  │<──runner:moved────┤<──────────────────┤
  │                   │                   │
  └─Update UI         └─Broadcast to all │
```

### Error Handling

```
Client              Server              Redis
  │                   │                   │
  ├─runner:move───────>│                   │
  │   (stale state)   ├─Get state─────────>│
  │                   │<──────────────────┤
  │                   ├─Validate FAIL     │
  │<──error+state─────┤                   │
  │                   │                   │
  └─Resync state      │                   │
```

## ⏱️ Timer Synchronization

**Probleem:** Client clocks kunnen verschillen, maar timers moeten synchroon lopen.

**Oplossing:** Server-side timestamps

```javascript
// Server sets timestamp when adding
runner.start_ts = Date.now();

// Client calculates elapsed based on server timestamp
const elapsed = Date.now() - runner.start_ts;
```

**Voordelen:**
- Timers zijn gelijk op alle clients (binnen network latency)
- Timer blijft correct na page refresh
- Geen clock drift problemen

**Nadelen:**
- Network latency (~50-200ms) zorgt voor kleine verschillen
- Acceptabel voor dit gebruik (niet kritisch)

## 💾 Data Persistence Strategy

### Redis AOF (Append-Only File)

**Configuratie:**
```conf
appendonly yes
appendfsync everysec
```

**Hoe het werkt:**
1. Elke write operatie wordt gelogd naar AOF file
2. Bij server crash/restart: Redis replays AOF file
3. State wordt volledig hersteld

**Trade-offs:**
- ✅ Durability: Max 1 seconde data loss
- ✅ Performance: Async writes, geen blocking
- ⚠️ Disk space: AOF groeit over tijd (maar trim gebeurt automatisch)

### Event Log Trimming

```javascript
await redisClient.ltrim(KEYS.EVENTS, 0, 999);
```

Behoudt laatste 1000 events voor debugging/audit trail.

## 🔒 Security Considerations

### CORS Policy

**Development:** `CORS_ORIGIN=*`
**Production:** `CORS_ORIGIN=http://192.168.1.100:5173,http://192.168.1.101:5173`

### Admin PIN

Optioneel: Bescherm delete operaties met PIN.

```bash
ADMIN_PIN=1234
```

Client moet PIN meesturen bij remove requests.

### Network Security

**Aannames:**
- LAN is vertrouwde omgeving
- Geen publieke blootstelling
- Fysieke toegang tot netwerk is gecontroleerd

**Voor productie:**
- Voeg HTTPS toe (via nginx + Let's Encrypt)
- Implementeer rate limiting
- Voeg authenticatie toe indien nodig

## 📈 Scalability

### Current Limits

**Target:** 50-100 gelijktijdige runners, 2-10 clients

**Bottlenecks:**
1. Redis single instance (max ~50k ops/sec)
2. Socket.IO broadcast (lineair met aantal clients)
3. Browser rendering (DOM updates)

### Scaling Strategies

**Horizontale schaling (indien nodig):**

1. **Redis Cluster**
   - Shard data over meerdere nodes
   - Gebruik consistent hashing voor runner IDs

2. **Multiple Server Instances**
   - Load balancer voor Socket.IO (sticky sessions!)
   - Redis Pub/Sub voor cross-server communication

3. **Client-side Optimizations**
   - Virtual scrolling voor lange lijsten
   - Debounce/throttle updates
   - Pagination (indien >100 runners)

## 🐛 Error Recovery

### Scenarios

**1. Client disconnects**
- Socket.IO auto-reconnect (10 pogingen)
- Bij reconnect: `request:state` voor fresh data
- UI toont connectie status

**2. Server crash**
- Docker/systemd herstart server automatisch
- Redis AOF herstelt state
- Clients reconnecten automatisch

**3. Redis crash**
- Server kan niet starten zonder Redis
- Health checks falen
- Manual intervention vereist (zie troubleshooting)

**4. Network partition**
- Clients tonen "Disconnected" status
- Wachten op reconnect
- State wordt geresync'd bij reconnect

## 🔍 Monitoring & Debugging

### Logs

**Server logs:**
```bash
docker-compose logs -f server
# of
journalctl -u twentyfourhour -f
```

**Redis logs:**
```bash
docker-compose logs -f redis
# of
journalctl -u redis-server -f
```

**Client logs:**
Browser DevTools → Console

### Metrics to Watch

- **Latency:** Socket.IO message roundtrip (<200ms target)
- **Memory:** Redis memory usage (<256MB)
- **Connections:** Active Socket.IO connections
- **Errors:** Error rate in logs
- **State size:** Size of `runners:state` key

### Debug Mode

Voeg dit toe aan client voor extra logging:

```javascript
localStorage.setItem('debug', 'socket.io-client:*');
```

## 🧪 Testing Strategy

**Unit Tests:**
- Server API endpoints
- Business logic in `runnerService.js`
- Redis integration (mocked)

**E2E Tests:**
- Manual testing met twee browser tabs
- Automated met Playwright (toekomst)

**Performance Tests:**
- Load testing met `artillery` of `k6`
- Latency monitoring

## 📝 Code Organization

```
server/
├── src/
│   ├── index.js          # Entry point, Express setup
│   ├── redis.js          # Redis client configuratie
│   ├── socketHandler.js  # Socket.IO event handlers
│   └── runnerService.js  # Business logic & state mutations
└── tests/
    └── api.test.js       # Unit tests

client/
├── src/
│   ├── App.jsx           # Root component
│   ├── main.jsx          # Entry point
│   ├── hooks/
│   │   └── useSocket.js  # Socket.IO hook
│   └── components/
│       ├── Board.jsx     # Container voor kolommen
│       ├── Column.jsx    # Drag & drop kolom
│       └── RunnerCard.jsx # Individuele runner card
```

## 🚀 Future Enhancements

1. **Authentication:** Login systeem voor admins
2. **Analytics:** Dashboard met statistieken
3. **Notifications:** Sound/visual alerts bij events
4. **History:** Tijdlijn van alle events
5. **Export:** Download data als CSV/JSON
6. **Mobile App:** React Native versie
7. **Theming:** Dark mode, custom colors
8. **Multi-event:** Support voor meerdere events tegelijk