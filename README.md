# 24-urenloop Realtime Board

Een realtime dashboard voor het beheren van lopers tijdens een 24-urenloop, volledig gesynchroniseerd via LAN (zonder internet).

------------------------------------------------------------
⚙️ Vereisten
------------------------------------------------------------
1. Windows 10 of hoger
2. Download [Git](https://git-scm.com/download/win)
   → Tijdens installatie: vink “Add Git to PATH” aan.
3. Download [Node.js (LTS)](https://nodejs.org/en/download)
   → Controleer installatie:
      Win+R, type cmd
      ```console
      node -v
      npm -v
4. Download [Redis (.msi file)](https://github.com/tporadowski/redis/releases)
5. Verbind beide computers via een ethernetkabel
------------------------------------------------------------
🖥️ Computer 1 — Server + Client
------------------------------------------------------------
Deze computer draait de server (data-opslag) én de client (website).

1. Open een terminal als administrator (Win+X → Command Prompt (Admin) of PowerShell (Admin))
2. Voer uit:
   ```console
   git clone https://github.com/tuur12345/24-urenloop-board.git
   cd 24-urenloop-board
   setup_server.bat
3. Wacht tot het script klaar is. De website opent automatisch (standaard op http://10.45.228.10:5173/)

Kort: setup_server.bat stelt een statisch IP in, controleert Node/Git, installeert dependencies, vult client/.env met het server-IP, en start server + client.

------------------------------------------------------------
💻 Computer 2 — Client
------------------------------------------------------------
1. Open een terminal als administrator (Win+X → Command Prompt (Admin) of PowerShell (Admin))
2. Voer uit:
   ```console
   git clone https://github.com/tuur12345/24-urenloop-board.git
   cd 24-urenloop-board
   setup_client.bat
3. De browser opent automatisch naar de serverpagina en toont dezelfde data in realtime.

Kort: setup_client.bat stelt een statisch IP in en opent de browser naar het serveradres.

------------------------------------------------------------
🌐 Architectuur
------------------------------------------------------------
Client 1 ─────┐
              ├──> Socket.IO ──> Server ──> Redis (persistent)
Client 2 ─────┘                    │
                                   └──> Broadcast to all clients

Server draait op Computer 1  
Clients zijn alle andere apparaten op hetzelfde LAN (browser-only)

------------------------------------------------------------
🏃 Runner Statussen
------------------------------------------------------------
warming  → Loper is aan het opwarmen  
queue    → Loper wacht om te starten  
done     → Loper heeft gelopen  

------------------------------------------------------------
🧩 Development
------------------------------------------------------------
Server: Express + Socket.IO + Redis  
Client: React + Socket.IO  
Sync: Server is single source of truth; clients resync bij conflicts

Aannames:
- LAN latency < 50 ms
- Servertijd = referentie
- Max ~100 gelijktijdige lopers
