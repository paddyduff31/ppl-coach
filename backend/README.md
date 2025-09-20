# PplCoach Backend

An ASP.NET Core 8 Web API for a Push/Pull/Legs workout tracking application, built with Clean Architecture.

## Features

- **Clean Architecture** (Onion/Ports-and-Adapters) with Domain, Application, Infrastructure, and API layers
- **Minimal APIs** with Swagger documentation
- **PostgreSQL** database with Entity Framework Core
- **FluentValidation** for request validation
- **AutoMapper** for object mapping
- **Serilog** for structured logging
- **Health checks** for monitoring
- **CORS** enabled for frontend integration
- **Unit tests** with xUnit and FluentAssertions

## Domain Model

### Core Entities
- **UserProfile**: User information (email, display name, body metrics)
- **Movement**: Exercise definitions with muscle groups and equipment requirements
- **WorkoutSession**: Individual workout sessions with set logs
- **SetLog**: Individual set records (weight, reps, RPE, tempo)
- **WorkoutTemplate**: Predefined workout plans
- **BodyMetric**: Body composition tracking
- **EquipmentItem**: Available equipment inventory

### Business Logic
- **Progress Tracking**: Personal records and estimated 1RM calculations using Epley formula
- **Effective Sets**: Weekly volume tracking with intelligent set counting heuristics
- **Movement Shuffling**: Equipment-aware workout generation with recent usage cooldown
- **PPL Organization**: Push/Pull/Legs split categorization

## API Endpoints

### Profiles
- `GET /api/profile/{id}` - Get user profile by ID
- `GET /api/profile/email/{email}` - Get user profile by email
- `POST /api/profile` - Create new user profile
- `PUT /api/profile/{id}` - Update user profile

### Sessions
- `POST /api/sessions` - Create workout session
- `GET /api/sessions/{id}` - Get session with set logs
- `GET /api/sessions/user/{userId}` - Get user's sessions (with date filtering)
- `POST /api/sessions/sets` - Log a set
- `DELETE /api/sessions/sets/{setId}` - Delete a set

### Movements
- `GET /api/movements` - Get all movements
- `GET /api/movements/{id}` - Get specific movement
- `GET /api/movements/equipment?equipmentTypes={types}` - Filter by equipment

### Progress
- `GET /api/progress/user/{userId}/personal-records` - Get PRs for all movements
- `GET /api/progress/user/{userId}/muscle-groups` - Get weekly effective sets by muscle group
- `GET /api/progress/user/{userId}/summary` - Get comprehensive progress summary

### Shuffle
- `POST /api/shuffle` - Get movement recommendations based on day type, equipment, and recent usage

## Quick Start

### Prerequisites
- .NET 8 SDK
- Docker and Docker Compose (for PostgreSQL)
- PostgreSQL client (optional, for direct DB access)

### Setup

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Start PostgreSQL**
   ```bash
   docker-compose up -d
   ```

3. **Set database connection** (optional - defaults to docker-compose settings)
   ```bash
   export DATABASE_URL="Host=localhost;Database=pplcoach;Username=postgres;Password=postgres"
   ```

4. **Run the application**
   ```bash
   dotnet run --project src/PplCoach.Api
   ```

5. **Access Swagger UI**
   ```
   http://localhost:5179/swagger
   ```

### Database Migrations

The application automatically applies migrations and seeds initial data in Development mode.

For manual migration management:
```bash
# Add migration
dotnet ef migrations add InitialCreate --project src/PplCoach.Infrastructure --startup-project src/PplCoach.Api

# Update database
dotnet ef database update --project src/PplCoach.Infrastructure --startup-project src/PplCoach.Api
```

### Running Tests

```bash
dotnet test
```

## Architecture

### Clean Architecture Layers

```
├── src/
│   ├── PplCoach.Api/              # Web API (Controllers, Endpoints, Middleware)
│   ├── PplCoach.Application/      # Use Cases (DTOs, Services, Validators, Mapping)
│   ├── PplCoach.Infrastructure/   # External Concerns (EF Core, Repositories, Services)
│   └── PplCoach.Domain/           # Business Logic (Entities, Enums, Value Objects)
└── tests/
    └── PplCoach.Tests/            # Unit Tests
```

### Key Patterns
- **Repository Pattern**: Generic repository with Unit of Work
- **Service Layer**: Application services encapsulate use cases
- **Dependency Injection**: All layers use DI for loose coupling
- **Validation**: FluentValidation with automatic registration
- **Mapping**: AutoMapper for DTO conversions

## Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `ASPNETCORE_ENVIRONMENT`: Environment (Development/Production)

### Default Configuration
- **Port**: 5179 (HTTP), 7079 (HTTPS)
- **Database**: localhost:5432/pplcoach
- **CORS**: Allows http://localhost:5173 (for frontend)

## Business Logic Examples

### Estimated 1RM Calculation
```csharp
Est1RM = (reps == 1) ? weight : weight * (1 + reps/30.0)
```

### Effective Sets Heuristic
```csharp
EffectiveSet = (reps >= 6 && (RPE >= 7 || reps >= 10)) ? 1.0 : 0.5
```

### Movement Shuffling Algorithm
1. Filter movements by day type (Push/Pull/Legs)
2. Filter by available equipment
3. Exclude movements used in last 48 hours
4. Prioritize compound movements
5. Return 6 randomized selections

## Sample Requests

### Create a workout session
```bash
curl -X POST http://localhost:5179/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-guid-here",
    "date": "2024-01-15",
    "dayType": 1,
    "notes": "Chest and shoulders focus"
  }'
```

### Log a set
```bash
curl -X POST http://localhost:5179/api/sessions/sets \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-guid-here",
    "movementId": "movement-guid-here",
    "setIndex": 1,
    "weightKg": 50.0,
    "reps": 10,
    "rpe": 8.0
  }'
```

### Shuffle movements for push day
```bash
curl -X POST http://localhost:5179/api/shuffle \
  -H "Content-Type: application/json" \
  -d '{
    "dayType": 1,
    "userId": "user-guid-here",
    "availableEquipment": [1, 2]
  }'
```

## Health Monitoring

- **Health Check**: `GET /health`
- **Swagger UI**: `/swagger`
- **Logging**: Structured logging with Serilog

## Development Notes

- Migrations and seeding occur automatically in Development
- Three PPL workout templates are pre-seeded
- 30+ movements are pre-seeded with equipment requirements
- All endpoints include OpenAPI documentation
- CORS is configured for frontend integration

## Technology Stack

- **.NET 8**: Runtime and framework
- **ASP.NET Core**: Web framework with minimal APIs
- **Entity Framework Core**: ORM with PostgreSQL provider
- **Npgsql**: PostgreSQL .NET data provider
- **FluentValidation**: Model validation
- **AutoMapper**: Object-to-object mapping
- **Serilog**: Structured logging
- **Swagger/OpenAPI**: API documentation
- **xUnit**: Unit testing framework
- **FluentAssertions**: Fluent assertion library