#!/bin/bash

# Enhanced development script for PPL Coach with API generation
# This script coordinates backend startup, API generation, and frontend development

set -e  # Exit on any error

echo "🚀 Starting PPL Coach development environment with API generation..."

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down development servers..."
    # Kill all background jobs
    jobs -p | xargs -r kill
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Start database if not running
echo "🗄️  Starting database..."
docker compose up -d db

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 3

# Start backend in background
echo "🔧 Starting backend API server..."
cd apps/backend
dotnet run --project src/PplCoach.Api/PplCoach.Api.csproj &
BACKEND_PID=$!
cd ../..

# Wait for backend to be ready and generate API client
echo "⏳ Waiting for backend API to be ready..."
npx wait-on http://localhost:5000/health -t 30000

echo "🔄 Generating API client from OpenAPI spec..."
npm run api:generate

# Start frontend applications
echo "🌐 Starting web frontend..."
cd apps/web
npm run dev &
WEB_PID=$!
cd ../..

echo "📱 Starting mobile development server..."
cd apps/mobile
pnpm dev &
MOBILE_PID=$!
cd ../..

# Keep script running and show status
echo "✅ All services started successfully!"
echo ""
echo "🔗 Available services:"
echo "   🔧 Backend API:     http://localhost:5000"
echo "   🌐 Web Frontend:    http://localhost:5173"
echo "   📱 Mobile:          Follow Expo CLI instructions above"
echo "   📊 Swagger UI:      http://localhost:5000/swagger"
echo ""
echo "📋 Useful commands:"
echo "   🔄 Regenerate API:  npm run api:generate"
echo "   🧹 Clean & rebuild: npm run reset"
echo "   🐛 View logs:       docker compose logs -f"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for all background processes
wait
