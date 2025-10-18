# 24-urenloop Realtime Board

Een realtime dashboard voor het beheren van lopers tijdens een 24-urenloop, volledig gesynchroniseerd via LAN (zonder internet).

⚙️ Vereisten
------------------------------------------------------------
1. Windows 10 of hoger
2. Download [Git](https://git-scm.com/download/win)
3. Download [Node.js (LTS)](https://nodejs.org/en/download)
2. Download [Redis (.msi file)](https://github.com/tporadowski/redis/releases)
4. Beide computers verbonden via een ethernetkabel

🖥️ Computer 1 — Server + Client
------------------------------------------------------------
Deze computer draait de server (data-opslag) én de client (website).

1. Open een terminal als administrator (Win+X → Command Prompt (Admin))
2. Voer uit:
   ```console
   git clone https://github.com/tuur12345/24-urenloop-board.git
   cd 24-urenloop-board
   .\setup_server.bat
3. Wacht tot het script klaar is. De website opent automatisch (standaard op http://10.45.228.10:5173/)

Het kan zijn de Node.js eerst nog toegang nodig heeft van Windows Firewall, na dit te accepteren moet je opnieuw .\setup_server.bat runnen.

setup_server.bat stelt een statisch IP in, controleert Node, Git en Redis, vult client/.env met het server-IP, installeert dependencies, start server en een client en opent de browser naar het serveradres.

💻 Computer 2 — Client
------------------------------------------------------------
1. Open een terminal als administrator (Win+X → Command Prompt (Admin))
2. Voer uit:
   ```console
   git clone https://github.com/tuur12345/24-urenloop-board.git
   cd 24-urenloop-board
   .\setup_client.bat
3. De browser opent automatisch naar de serverpagina en toont dezelfde data in realtime.

setup_client.bat stelt een statisch IP in, controleert Node, Git en Redis, vult client/.env met het server-IP, installeert dependencies, start een client en opent de browser naar het serveradres.

🌐 Architectuur
------------------------------------------------------------
Client 1 ─────┐
              |
              ├──> Socket.IO ──> Server ──> Redis (persistent)
              |                    |
Client 2 ─────┘                    │
                                   |
                                   └──> Broadcast to all clients

Server draait op Computer 1  
Clients zijn alle andere apparaten op hetzelfde LAN (browser-only)

🧩 Development
------------------------------------------------------------
Server: Express + Socket.IO + Redis  
Client: React + Socket.IO  
Sync: Server is single source of truth; clients resync bij conflicts

Aannames:
- LAN latency < 50 ms
- Servertijd = referentie
- Max ~100 gelijktijdige lopers
