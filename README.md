# 24-urenloop Realtime Board

Een realtime dashboard voor het beheren van lopers tijdens een 24-urenloop, gesynchroniseerd via LAN.

## Computer 1 (Server + Client)
1. Install Node.js LTS (from nodejs.org)
2. Connect an Ethernet cable between both computers
3. Run `setup_server.bat` as admin
4. The app should open automatically

## Computer 2 (Client)
1. Run `setup_client.bat` as admin
2. The app should open automatically


## Architectuur

### Data Flow
```
Client 1 ─────┐
              ├──> Socket.IO ──> Server ──> Redis (AOF)
Client 2 ─────┘                    │
                                   └──> Broadcast to all clients
```

### Runner States
1. **warming** - Opwarmen (loper is aan het opwarmen)
2. **queue** - Wachtrij (loper staat in de wachtrij om te lopen)
3. **done** - Heeft gelopen (loper is aangekomen)

## Development

### Code Structure
- **Server**: Express routes + Socket.IO handlers → Business logic → Redis
- **Client**: React components met Socket.IO hooks → Optimistic UI updates
- **State sync**: Server is single source of truth, client wordt resync'd bij conflicts

### Aannames
- LAN heeft stabiele latency (<50ms)
- Server tijd is referentie voor alle timestamps
- Max ~100 gelijktijdige runners

## Support

Bij problemen: check de issues in deze repository of open een nieuwe.

Gecreëerd met behulp van Claude.ai :)
