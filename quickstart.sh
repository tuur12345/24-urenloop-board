#!/bin/bash
set -e

echo "🏃 24-urenloop Board - Quickstart Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is niet geïnstalleerd${NC}"
    echo "Installeer Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is niet geïnstalleerd${NC}"
    echo "Installeer Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker gevonden${NC}"

# Setup server .env
if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}⚠ server/.env niet gevonden, kopiëren van .env.example${NC}"
    cp server/.env.example server/.env
    echo -e "${GREEN}✓ server/.env aangemaakt${NC}"
else
    echo -e "${GREEN}✓ server/.env bestaat al${NC}"
fi

# Get LAN IP
echo ""
echo "📡 Detecteren van LAN IP adres..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    LAN_IP=$(hostname -I | awk '{print $1}')
elif [[ "$OSTYPE" == "darwin"* ]]; then
    LAN_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)
else
    LAN_IP="localhost"
fi

echo -e "${GREEN}✓ LAN IP: $LAN_IP${NC}"

# Setup client .env
if [ ! -f "client/.env" ]; then
    echo -e "${YELLOW}⚠ client/.env niet gevonden, aanmaken...${NC}"
    echo "VITE_SERVER_URL=http://$LAN_IP:3001" > client/.env
    echo -e "${GREEN}✓ client/.env aangemaakt met server URL: http://$LAN_IP:3001${NC}"
else
    echo -e "${GREEN}✓ client/.env bestaat al${NC}"
    echo -e "${YELLOW}  Huidige VITE_SERVER_URL:${NC}"
    grep VITE_SERVER_URL client/.env || echo "  (niet gevonden)"
fi

# Start Docker services
echo ""
echo "🐳 Starten van Docker containers..."
docker-compose up -d

# Wait for services
echo ""
echo "⏳ Wachten op services..."
sleep 5

# Check health
echo ""
echo "🔍 Controleren van service status..."

if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓ Docker containers draaien${NC}"
else
    echo -e "${RED}❌ Docker containers niet actief${NC}"
    docker-compose logs
    exit 1
fi

# Check server health
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Server is gezond${NC}"
else
    echo -e "${RED}❌ Server health check gefaald${NC}"
    echo "Logs:"
    docker-compose logs server
    exit 1
fi

# Check Redis
if docker exec twentyfourhour-redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis is actief${NC}"
else
    echo -e "${RED}❌ Redis niet bereikbaar${NC}"
    exit 1
fi

# Install client dependencies if needed
echo ""
if [ ! -d "client/node_modules" ]; then
    echo "📦 Installeren van client dependencies..."
    cd client
    npm install
    cd ..
    echo -e "${GREEN}✓ Client dependencies geïnstalleerd${NC}"
else
    echo -e "${GREEN}✓ Client dependencies aanwezig${NC}"
fi

# Done
echo ""
echo -e "${GREEN}✅ Setup compleet!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 24-urenloop Board is klaar voor gebruik!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Server:  http://$LAN_IP:3001"
echo "📍 Redis:   localhost:6379"
echo ""
echo "Om de client te starten:"
echo "  cd client"
echo "  npm run dev"
echo ""
echo "Client zal beschikbaar zijn op:"
echo "  http://localhost:5173"
echo "  http://$LAN_IP:5173"
echo ""
echo "Om logs te bekijken:"
echo "  docker-compose logs -f"
echo ""
echo "Om te stoppen:"
echo "  docker-compose down"
echo ""
echo -e "${YELLOW}💡 Tip: Open twee browser tabs om realtime sync te testen!${NC}"
echo ""