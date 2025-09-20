#!/bin/bash

# PPL Coach Concurrent Development Script
# Uses concurrently for better process management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting PPL Coach Monorepo with Concurrently${NC}"

# Check if concurrently is available
if ! command -v npx >/dev/null 2>&1; then
    echo -e "${RED}❌ npx is required but not installed${NC}"
    exit 1
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}📋 Creating .env file from template...${NC}"
    cp .env.example .env
fi

# Start PostgreSQL database
echo -e "${YELLOW}🐘 Starting PostgreSQL database...${NC}"
docker compose up -d db

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
fi

echo -e "${GREEN}🎯 Starting all services with concurrently...${NC}"

# Use concurrently to run both frontend and backend
npx concurrently \
  --names "🔧API,⚛️WEB" \
  --prefix-colors "cyan,green" \
  --kill-others-on-fail \
  "cd backend && dotnet run --project src/PplCoach.Api/PplCoach.Api.csproj" \
  "cd frontend && npm run dev"
