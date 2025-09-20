#!/bin/bash

echo "🚀 Starting PPL Coach Development Environment..."
echo "   - Database: PostgreSQL on port 5432"
echo "   - Backend: .NET API on port 5179"
echo "   - Frontend: React/Vite on port 5173"
echo ""

# Stop any existing containers
docker-compose down

# Build and start all services
docker-compose up --build

echo ""
echo "✅ Development environment stopped. Run './dev.sh' to start again."