# PplCoach Monorepo Setup Guide

This guide shows you how to set up a .NET Web API + React/Vite + PostgreSQL project in JetBrains Rider, structured as a traditional monorepo with separate `server` and `client` folders.

## Project Structure
```
ppl-coach/
├── PplCoach.sln              # Root solution file (open this in Rider)
├── server/                   # .NET Web API (maps to backend/ folder)
│   ├── src/
│   │   ├── PplCoach.Api/
│   │   ├── PplCoach.Domain/
│   │   ├── PplCoach.Application/
│   │   └── PplCoach.Infrastructure/
│   └── tests/
├── client/                   # React + Vite frontend (maps to frontend/ folder)
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
├── docker-compose.yml        # PostgreSQL setup
├── dev-monorepo.sh          # Development commands
└── README.md
```

## Getting Started

### 1. Initial Setup
```bash
# Install dependencies for both projects
./dev-monorepo.sh setup
```

### 2. Start Development
```bash
# Run both server and client simultaneously
./dev-monorepo.sh full

# Or run them separately:
./dev-monorepo.sh server     # Just the .NET API
./dev-monorepo.sh client     # Just the React app
```

### 3. Database Setup (PostgreSQL)
```bash
# Start PostgreSQL using Docker
docker-compose up -d

# Run migrations (from backend folder)
cd backend
dotnet ef database update
```

## Opening in JetBrains Rider

1. **Open Rider**
2. **Open the root `PplCoach.sln` file** (not the one in backend/)
3. You'll see both projects organized under "server" and "client" folders
4. Both .NET and JavaScript/TypeScript files will have full IntelliSense

## Development Workflow

### Running the Stack
- **API**: Runs on `http://localhost:5000` (or configured port)
- **Frontend**: Runs on `http://localhost:3000` with Vite dev server
- **Database**: PostgreSQL on `localhost:5432`

### Key Features
- ✅ Hot reload for both frontend and backend
- ✅ Automatic proxy from Vite to .NET API 
- ✅ PostgreSQL with Entity Framework
- ✅ Unified solution in Rider
- ✅ Independent deployment capability

### CORS Configuration
The .NET API is configured to allow requests from the Vite dev server during development.

### API Proxy
Vite is configured to proxy API requests to the .NET backend, so you can call `/api/*` endpoints directly from your React app.

## Available Commands

```bash
./dev-monorepo.sh setup      # Install dependencies
./dev-monorepo.sh full       # Run both server and client
./dev-monorepo.sh server     # Run .NET API only
./dev-monorepo.sh client     # Run React app only
./dev-monorepo.sh build      # Build both projects
./dev-monorepo.sh test       # Run all tests
./dev-monorepo.sh clean      # Clean build artifacts
```

## Production Deployment

Both projects can be deployed independently:
- **Server**: Standard .NET Web API deployment
- **Client**: Static files from `npm run build`

Or together using the provided Docker setup.
