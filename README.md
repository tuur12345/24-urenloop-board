# 24-urenloop Realtime Board

Een realtime dashboard voor het beheren van lopers tijdens een 24-urenloop, gesynchroniseerd via LAN.

Check INSTALLATION_GUIDE.md voor meer info over installatie voor elk besturingsysteem

## 📊 Architectuur

### Data Flow
```
Client 1 ─────┐
              ├──> Socket.IO ──> Server ──> Redis (AOF)
Client n ─────┘                    │
                                   └──> Broadcast to all clients
```

### Runner States
1. **warming** - Opwarmen (loper is aan het opwarmen)
2. **running** - Lopen (loper is aan het lopen, start tijd)
3. **done** - Heeft gelopen (loper is aangekomen, stop tijd)

## 🤝 Development

### Code Structure
- **Server**: Express routes + Socket.IO handlers → Business logic → Redis
- **Client**: React components met Socket.IO hooks → Optimistic UI updates
- **State sync**: Server is single source of truth, client wordt resync'd bij conflicts

### Aannames
- LAN heeft stabiele latency (<50ms)
- Server tijd is referentie voor alle timestamps
- Max ~100 gelijktijdige runners

## 🆘 Support

Bij problemen: check de issues in deze repository of open een nieuwe.
