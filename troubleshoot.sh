#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  24-urenloop Board - Troubleshooting Diagnostic       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check command
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is NOT installed"
        return 1
    fi
}

# Function to check port
check_port() {
    if nc -z localhost $1 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Port $1 is open"
        return 0
    else
        echo -e "${RED}✗${NC} Port $1 is NOT open"
        return 1
    fi
}

# 1. Check prerequisites
echo -e "${YELLOW}[1/7]${NC} Checking prerequisites..."
check_command "node"
check_command "npm"
check_command "docker"
check_command "docker-compose"
check_command "redis-cli"
echo ""

# 2. Check Docker containers
echo -e "${YELLOW}[2/7]${NC} Checking Docker containers..."
if docker-compose ps | grep -q "twentyfourhour"; then
    docker-compose ps
    echo ""
    
    # Check if containers are running
    if docker-compose ps | grep "twentyfourhour-server" | grep -q "Up"; then
        echo -e "${GREEN}✓${NC} Server container is running"
    else
        echo -e "${RED}✗${NC} Server container is NOT running"
        echo "  Try: docker-compose up -d"
    fi
    
    if docker-compose ps | grep "twentyfourhour-redis" | grep -q "Up"; then
        echo -e "${GREEN}✓${NC} Redis container is running"
    else
        echo -e "${RED}✗${NC} Redis container is NOT running"
        echo "  Try: docker-compose up -d"
    fi
else
    echo -e "${RED}✗${NC} Docker containers not found"
    echo "  Try: docker-compose up -d"
fi
echo ""

# 3. Check network ports
echo -e "${YELLOW}[3/7]${NC} Checking network ports..."
check_port 3001 && echo "  Server API/Socket.IO" || echo "  Try: docker-compose restart server"
check_port 6379 && echo "  Redis" || echo "  Try: docker-compose restart redis"
check_port 5173 && echo "  Vite dev server (if running)" || echo "  Start with: cd client && npm run dev"
echo ""

# 4. Check server health
echo -e "${YELLOW}[4/7]${NC} Checking server health..."
if curl -sf http://localhost:3001/health > /dev/null 2>&1; then
    HEALTH=$(curl -s http://localhost:3001/health)
    echo -e "${GREEN}✓${NC} Server is healthy"
    echo "  Response: $HEALTH"
else
    echo -e "${RED}✗${NC} Server health check failed"
    echo "  Check logs: docker-compose logs server"
fi
echo ""

# 5. Check Redis
echo -e "${YELLOW}[5/7]${NC} Checking Redis..."
if docker exec twentyfourhour-redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Redis is responding"
    
    # Check AOF
    AOF=$(docker exec twentyfourhour-redis redis-cli CONFIG GET appendonly | tail -1)
    if [ "$AOF" = "yes" ]; then
        echo -e "${GREEN}✓${NC} AOF persistence is enabled"
    else
        echo -e "${RED}✗${NC} AOF persistence is DISABLED"
        echo "  Fix: Update redis.conf to set appendonly yes"
    fi
    
    # Check memory
    MEMORY=$(docker exec twentyfourhour-redis redis-cli INFO memory | grep used_memory_human | cut -d: -f2 | tr -d '\r')
    echo "  Memory used: $MEMORY"
    
    # Check keys
    STATE_EXISTS=$(docker exec twentyfourhour-redis redis-cli EXISTS runners:state)
    if [ "$STATE_EXISTS" = "1" ]; then
        echo -e "${GREEN}✓${NC} State data exists (runners:state)"
    else
        echo -e "${YELLOW}⚠${NC} No state data found (fresh install or data cleared)"
    fi
else
    echo -e "${RED}✗${NC} Redis is NOT responding"
    echo "  Check logs: docker-compose logs redis"
fi
echo ""

# 6. Check configuration files
echo -e "${YELLOW}[6/7]${NC} Checking configuration..."
if [ -f "server/.env" ]; then
    echo -e "${GREEN}✓${NC} server/.env exists"
    grep -v "^#" server/.env | grep -v "^$" | while read line; do
        echo "  $line"
    done
else
    echo -e "${RED}✗${NC} server/.env missing"
    echo "  Create: cp server/.env.example server/.env"
fi
echo ""

if [ -f "client/.env" ]; then
    echo -e "${GREEN}✓${NC} client/.env exists"
    grep -v "^#" client/.env | grep -v "^$" | while read line; do
        echo "  $line"
    done
else
    echo -e "${YELLOW}⚠${NC} client/.env missing (optional)"
    echo "  Create: cp client/.env.example client/.env"
fi
echo ""

# 7. Check recent logs
echo -e "${YELLOW}[7/7]${NC} Recent error logs..."
echo "Server logs (last 5 errors):"
docker-compose logs server 2>/dev/null | grep -i error | tail -5 || echo "  No errors found"
echo ""
echo "Redis logs (last 5 errors):"
docker-compose logs redis 2>/dev/null | grep -i error | tail -5 || echo "  No errors found"
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Diagnostic Summary                                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Common issues and solutions:"
echo ""
echo "1. ${YELLOW}Connection refused on port 3001${NC}"
echo "   → docker-compose up -d"
echo "   → Check firewall: sudo ufw allow 3001"
echo ""
echo "2. ${YELLOW}Redis connection failed${NC}"
echo "   → docker-compose restart redis"
echo "   → Check Redis logs: docker-compose logs redis"
echo ""
echo "3. ${YELLOW}Client can't connect to server${NC}"
echo "   → Verify VITE_SERVER_URL in client/.env"
echo "   → Check CORS_ORIGIN in server/.env"
echo "   → Open browser console for errors"
echo ""
echo "4. ${YELLOW}Data lost after restart${NC}"
echo "   → Check AOF is enabled (see above)"
echo "   → Verify Redis volume: docker volume ls"
echo ""
echo "5. ${YELLOW}Timers not synchronized${NC}"
echo "   → This should not happen (server-authoritative)"
echo "   → Check browser console for errors"
echo "   → Verify server time: curl http://localhost:3001/api/state"
echo ""
echo "For more help:"
echo "  - README.md"
echo "  - DEPLOYMENT.md"
echo "  - TESTING.md"
echo "  - Open an issue on GitHub"
echo ""