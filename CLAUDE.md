# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PPL Coach is a Push/Pull/Legs workout tracking application with ASP.NET Core 8 Web API backend and React 19 + Vite + TypeScript frontend.

## Architecture

### Backend (ASP.NET Core 8)
Clean Architecture implementation with four layers:
- **PplCoach.Api**: Web API endpoints, minimal APIs, middleware
- **PplCoach.Application**: Use cases, DTOs, services, validators, AutoMapper profiles
- **PplCoach.Infrastructure**: Entity Framework Core, repositories, external services
- **PplCoach.Domain**: Business entities, enums, value objects

### Frontend (React 19 + Vite)
- React 19 with TypeScript and Vite build system
- TanStack Router for routing, TanStack Query for server state
- React Hook Form + Zod for form validation
- Tailwind CSS for styling
- Vitest for testing

### Database
PostgreSQL with Entity Framework Core migrations. Automatic migration and seeding in Development mode.

## Development Commands

### Quick Start
```bash
./dev.sh                    # Start full Docker environment (all services)
```

### Database Only
```bash
docker compose up -d db     # Start PostgreSQL only
```

### Backend Development
```bash
cd backend
dotnet run --project src/PplCoach.Api                          # Run API server (port 5179)
dotnet test                                                     # Run unit tests
dotnet ef migrations add MigrationName --project src/PplCoach.Infrastructure --startup-project src/PplCoach.Api
dotnet ef database update --project src/PplCoach.Infrastructure --startup-project src/PplCoach.Api
```

### Frontend Development
```bash
cd frontend/ppl-coach-web
npm install                 # Install dependencies
npm run dev                 # Start dev server (port 5173)
npm run build              # Production build
npm run test               # Run Vitest tests
npm run test:ui            # Interactive test UI
npm run lint               # ESLint
npm run lint:fix           # Auto-fix ESLint issues
npm run format             # Prettier formatting
```

## Key Business Logic

### Domain Entities
- **UserProfile**: User info with body metrics
- **Movement**: Exercise definitions with muscle groups and equipment
- **WorkoutSession**: Individual workout sessions
- **SetLog**: Individual set records (weight, reps, RPE, tempo)
- **WorkoutTemplate**: Predefined workout plans

### Core Features
- **Progress Tracking**: Personal records and estimated 1RM using Epley formula
- **Effective Sets**: Weekly volume tracking with intelligent heuristics
- **Movement Shuffling**: Equipment-aware workout generation with cooldown logic
- **PPL Split**: Push/Pull/Legs categorization system

## API Structure

Base URL: `http://localhost:5179`
- `/api/profile/*` - User profile management
- `/api/sessions/*` - Workout session and set logging
- `/api/movements/*` - Exercise database and filtering
- `/api/progress/*` - Personal records and volume tracking
- `/api/shuffle` - Movement recommendation engine
- `/swagger` - API documentation

## Environment Configuration

### Required Environment Variables
Copy `.env.example` to `.env` and configure:
- `DATABASE_URL`: PostgreSQL connection string
- `POSTGRES_*`: Database credentials
- `JWT_*`: Authentication configuration
- `CORS_ORIGIN`: Frontend URL for CORS
- `VITE_API_BASE_URL`: Backend URL for frontend

### Development Ports
- Backend API: 5179
- Frontend: 5173
- PostgreSQL: 5432

## Testing Strategy

### Backend Tests
- xUnit with FluentAssertions
- Unit tests for domain logic and services
- Located in `tests/PplCoach.Tests/`

### Frontend Tests
- Vitest with Testing Library
- Component and integration tests
- Mock API responses for isolated testing

## Entity Framework Patterns

### Migration Workflow
1. Make entity changes in Domain layer
2. Add migration: `dotnet ef migrations add <Name>`
3. Review generated migration
4. Apply: `dotnet ef database update`

### Database Seeding
Automatic seeding in Development includes:
- 30+ exercise movements with equipment requirements
- Three PPL workout templates
- Sample body metrics and equipment inventory

## Key Architectural Decisions

### Clean Architecture Layers
- Domain entities are framework-agnostic
- Application layer handles use cases and validation
- Infrastructure implements repository pattern with EF Core
- API layer uses minimal APIs with automatic validation

### State Management (Frontend)
- TanStack Query for server state caching
- React Hook Form for form state
- Local component state for UI interactions

### Authentication Flow
JWT-based authentication with configurable issuer/audience for different environments.