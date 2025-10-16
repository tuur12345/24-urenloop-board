.PHONY: help install dev start stop restart logs test clean setup docker-build

help: ## Toon deze help message
	@echo "24-urenloop Board - Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

setup: ## Eerste keer setup (run quickstart.sh)
	@chmod +x quickstart.sh
	@./quickstart.sh

install: ## Installeer alle dependencies
	@echo "📦 Installing dependencies..."
	@npm install
	@cd server && npm install
	@cd client && npm install
	@echo "✅ Dependencies installed!"

dev: ## Start development (server + client)
	@echo "🚀 Starting development servers..."
	@npm run dev

dev-server: ## Start alleen server (development)
	@cd server && npm run dev

dev-client: ## Start alleen client (development)
	@cd client && npm run dev

start: ## Start productie server
	@cd server && npm start

build: ## Build client voor productie
	@cd client && npm run build

test: ## Run tests
	@echo "🧪 Running tests..."
	@cd server && npm test

docker-build: ## Build Docker images
	@docker-compose build

docker-up: ## Start Docker containers
	@echo "🐳 Starting Docker containers..."
	@docker-compose up -d
	@echo "✅ Containers started!"
	@make docker-status

docker-down: ## Stop Docker containers
	@echo "🛑 Stopping Docker containers..."
	@docker-compose down
	@echo "✅ Containers stopped!"

docker-restart: ## Restart Docker containers
	@make docker-down
	@make docker-up

docker-logs: ## Toon Docker logs
	@docker-compose logs -f

docker-status: ## Toon Docker status
	@echo ""
	@echo "📊 Container status:"
	@docker-compose ps
	@echo ""
	@echo "🔍 Health checks:"
	@echo -n "Server: "
	@curl -sf http://localhost:3001/health > /dev/null && echo "✅ Healthy" || echo "❌ Unhealthy"
	@echo -n "Redis:  "
	@docker exec twentyfourhour-redis redis-cli ping > /dev/null 2>&1 && echo "✅ Healthy" || echo "❌ Unhealthy"

logs: ## Toon logs (Docker of systemd)
	@if [ -f /etc/systemd/system/twentyfourhour.service ]; then \
		sudo journalctl -u twentyfourhour -f; \
	else \
		docker-compose logs -f; \
	fi

clean: ## Verwijder node_modules en build artifacts
	@echo "🧹 Cleaning..."
	@rm -rf node_modules server/node_modules client/node_modules
	@rm -rf client/dist
	@echo "✅ Cleaned!"

reset: ## Reset Redis data (DESTRUCTIVE!)
	@echo "⚠️  WARNING: This will delete all data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker exec twentyfourhour-redis redis-cli FLUSHALL; \
		echo "✅ Redis data cleared!"; \
	fi

backup: ## Backup Redis data
	@mkdir -p backups
	@docker exec twentyfourhour-redis redis-cli BGSAVE
	@sleep 2
	@docker cp twentyfourhour-redis:/data/dump.rdb backups/dump-$$(date +%Y%m%d-%H%M%S).rdb
	@docker cp twentyfourhour-redis:/data/appendonly.aof backups/appendonly-$$(date +%Y%m%d-%H%M%S).aof
	@echo "✅ Backup created in backups/"

restore: ## Restore Redis data (specify FILE=backup.rdb)
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Please specify FILE=path/to/backup.rdb"; \
		exit 1; \
	fi
	@docker-compose down
	@docker cp $(FILE) twentyfourhour-redis:/data/dump.rdb
	@docker-compose up -d
	@echo "✅ Backup restored!"

info: ## Toon systeem informatie
	@echo "📊 24-urenloop Board - System Info"
	@echo "====================================="
	@echo ""
	@echo "Node.js:       $$(node -v 2>/dev/null || echo 'Not installed')"
	@echo "npm:           $$(npm -v 2>/dev/null || echo 'Not installed')"
	@echo "Docker:        $$(docker -v 2>/dev/null | cut -d' ' -f3 | tr -d ',' || echo 'Not installed')"
	@echo "Docker Compose: $$(docker-compose -v 2>/dev/null | cut -d' ' -f3 | tr -d ',' || echo 'Not installed')"
	@echo ""
	@echo "LAN IP:        $$(hostname -I 2>/dev/null | awk '{print $$1}' || ipconfig getifaddr en0 2>/dev/null || echo 'Unknown')"
	@echo ""
	@if [ -f server/.env ]; then \
		echo "Server config: ✅ server/.env exists"; \
	else \
		echo "Server config: ❌ server/.env missing"; \
	fi
	@if [ -f client/.env ]; then \
		echo "Client config: ✅ client/.env exists"; \
	else \
		echo "Client config: ❌ client/.env missing"; \
	fi