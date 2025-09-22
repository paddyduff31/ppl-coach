#!/bin/bash

# PPL Coach Monorepo Development Script
# This script starts all services needed for local development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting PPL Coach Monorepo Development Environment${NC}"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is required but not installed${NC}"
    exit 1
fi

if ! command_exists dotnet; then
    echo -e "${RED}❌ .NET SDK is required but not installed${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is required but not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is required but not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites are installed${NC}"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}📋 Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
fi

# Start PostgreSQL database
echo -e "${YELLOW}🐘 Starting PostgreSQL database...${NC}"
docker compose up -d db
sleep 3

# Install frontend dependencies if needed
if [ ! -d "apps/web/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing web dependencies...${NC}"
    cd apps/web && npm install && cd ../..
    echo -e "${GREEN}✅ Web dependencies installed${NC}"
fi

# Install mobile dependencies if needed
if [ ! -d "apps/mobile/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing mobile dependencies...${NC}"
    cd apps/mobile && pnpm install && cd ../..
    echo -e "${GREEN}✅ Mobile dependencies installed${NC}"
fi

# Create a function to cleanup processes on exit
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up processes...${NC}"
    # Kill all background processes in this process group
    kill 0
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

echo -e "${GREEN}🎯 Starting all services...${NC}"

# Start backend in background
echo -e "${BLUE}🔧 Starting .NET Backend (http://localhost:5179)...${NC}"
cd apps/backend
dotnet run --project src/PplCoach.Api/PplCoach.Api.csproj &
BACKEND_PID=$!
cd ../..

# Wait a moment for backend to start
sleep 5

# Start web frontend in background
echo -e "${BLUE}⚛️  Starting React Web App (http://localhost:5173)...${NC}"
cd apps/web
npm run dev &
FRONTEND_PID=$!
cd ../..

echo -e "${GREEN}"
echo "========================================="
echo "🎉 PPL Coach Development Environment Ready!"
echo "========================================="
echo -e "${NC}"
echo -e "${BLUE}📱 Web App: ${NC}http://localhost:5173"
echo -e "${BLUE}🔧 Backend API: ${NC}http://localhost:5179"
echo -e "${BLUE}📚 API Swagger: ${NC}http://localhost:5179/swagger"
echo -e "${BLUE}🐘 PostgreSQL: ${NC}localhost:5432"
echo ""
echo -e "${YELLOW}💡 Press Ctrl+C to stop all services${NC}"

# Wait for all background processes
wait
