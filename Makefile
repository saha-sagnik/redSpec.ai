# redSpec.AI Automation Makefile
# Comprehensive build and deployment automation for the redSpec.AI project

.PHONY: help setup install build dev prod test clean logs docker-build docker-run

# Default target
help:
	@echo "🚀 redSpec.AI Automation Commands"
	@echo "=================================="
	@echo ""
	@echo "Development:"
	@echo "  make setup          - Complete project setup (Python + Node.js)"
	@echo "  make install         - Install all dependencies"
	@echo "  make build           - Build the project"
	@echo "  make dev             - Run development server"
	@echo "  make prod            - Run production server"
	@echo "  make test            - Run tests"
	@echo "  make logs            - Show application logs"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean           - Clean build artifacts and caches"
	@echo "  make update          - Update all dependencies"
	@echo "  make check-env       - Check environment configuration"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build    - Build Docker image"
	@echo "  make docker-run      - Run with Docker"
	@echo ""
	@echo "Quick start:"
	@echo "  make setup && make dev"

# Setup targets
setup: check-env install verify
	@echo "✅ Project setup completed!"

install: install-python install-nodejs
	@echo "✅ All dependencies installed!"

install-python:
	@echo "🐍 Setting up Python environment..."
	@./build-and-run.sh --build-only || (echo "❌ Python setup failed"; exit 1)

install-nodejs:
	@echo "📦 Installing Node.js dependencies..."
	@npm install

# Build targets
build:
	@echo "🔨 Building project..."
	@npm run build

# Run targets
dev:
	@echo "🚀 Starting development server..."
	@./build-and-run.sh

prod:
	@echo "🚀 Starting production server..."
	@./build-and-run.sh --prod

# Test targets
test: test-python test-nodejs
	@echo "✅ All tests passed!"

test-python:
	@echo "🐍 Running Python tests..."
	@python3.11 -c "from agents import *; print('✅ Python agents import test passed')" || python3.10 -c "from agents import *; print('✅ Python agents import test passed')"

test-nodejs:
	@echo "📦 Running Node.js tests..."
	@npm run lint

# Verification targets
verify: verify-agents verify-env
	@echo "✅ Project verification completed!"

verify-agents:
	@echo "🤖 Verifying agents..."
	@python3.11 -c "from agents import conversational_prd_agent; print('✅ Conversational agent ready')" 2>/dev/null || python3.10 -c "from agents import conversational_prd_agent; print('✅ Conversational agent ready')" 2>/dev/null || (echo "❌ Agent verification failed"; exit 1)

verify-env:
	@echo "🔧 Verifying environment..."
	@if [ ! -f ".env" ]; then echo "❌ .env file missing"; exit 1; fi
	@if grep -q "your_api_key_here" .env; then echo "⚠️  GOOGLE_API_KEY not configured"; else echo "✅ Environment looks good"; fi

# Environment targets
check-env:
	@echo "🔧 Checking environment configuration..."
	@if [ ! -f ".env" ]; then \
		echo "📝 Creating .env template..."; \
		echo "# Google Gemini API Configuration" > .env; \
		echo "GOOGLE_API_KEY=your_api_key_here" >> .env; \
		echo "GOOGLE_GENAI_USE_VERTEXAI=0" >> .env; \
		echo "⚠️  Please edit .env and add your GOOGLE_API_KEY"; \
		echo "   Get your API key from: https://makersuite.google.com/app/apikey"; \
	fi

# Maintenance targets
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf .next node_modules/.cache .pytest_cache __pycache__
	@find . -name "*.pyc" -delete
	@find . -name "*.pyo" -delete
	@find . -name "*.pyd" -delete
	@find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	@echo "✅ Clean completed!"

update:
	@echo "⬆️  Updating dependencies..."
	@python3.11 -m pip install --user --upgrade -r requirements.txt 2>/dev/null || python3.10 -m pip install --user --upgrade -r requirements.txt 2>/dev/null || echo "⚠️  Python update may have failed"
	@npm update
	@echo "✅ Dependencies updated!"

# Log targets
logs:
	@echo "📋 Application logs:"
	@echo "==================="
	@if pgrep -f "next dev" > /dev/null; then \
		echo "✅ Development server is running"; \
	else \
		echo "❌ Development server not running"; \
	fi
	@echo ""
	@echo "To view live logs, run:"
	@echo "  make dev"
	@echo ""
	@echo "Or check specific logs:"
	@echo "  tail -f .next/development.log 2>/dev/null || echo 'No development logs found'"

# Docker targets
docker-build:
	@echo "🐳 Building Docker image..."
	@if [ ! -f "Dockerfile" ]; then \
		echo "📝 Creating Dockerfile..."; \
		echo "FROM node:18-alpine" > Dockerfile; \
		echo "WORKDIR /app" >> Dockerfile; \
		echo "COPY package*.json ./" >> Dockerfile; \
		echo "RUN npm install" >> Dockerfile; \
		echo "COPY . ." >> Dockerfile; \
		echo "EXPOSE 3000" >> Dockerfile; \
		echo "CMD [\"npm\", \"run\", \"dev\"]" >> Dockerfile; \
	fi
	@docker build -t redspec-ai .
	@echo "✅ Docker image built!"

docker-run:
	@echo "🐳 Running with Docker..."
	@docker run -p 3000:3000 --env-file .env redspec-ai

# Quick start target
quickstart: setup dev
