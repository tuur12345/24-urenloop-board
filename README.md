# 24-urenloop Realtime Board

Een realtime dashboard voor het beheren van lopers tijdens een 24-urenloop, gesynchroniseerd via LAN.

## Vereisten
1. Windows 10 of hoger
2. Install [Git](https://git-scm.com/downloads/win) 
3. Install [Node.js LTS](https://nodejs.org/en/download)
4. Connect an Ethernet cable between both computers

## Computer 1 (Server + Client)
1. Install Git and Node.js
2. 1. Open a terminal as admin (Win+X, select Command Prompt (Admin))
3. Voer uit
   ```console
   git clone https://github.com/tuur12345/24-urenloop-board.git
   cd 24-urenloop-board
   setup_server.bat
   ``
4. The app should open automatically

## Computer 2 (Client)
1. Install Git and Node.js
2. 1. Open a terminal as admin (Win+X, select Command Prompt (Admin))
3. Voer uit
   ```console
   git clone https://github.com/tuur12345/24-urenloop-board.git
   cd 24-urenloop-board
   setup_client.bat
   ``
4. The app should open automatically


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
