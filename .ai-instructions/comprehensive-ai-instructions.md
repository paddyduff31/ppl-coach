# PPL Coach - Comprehensive AI Assistant Instructions

## Project Overview

PPL Coach is a full-stack fitness coaching application built as a monorepo with multiple applications and shared packages. The application helps users track workouts, monitor progress, and follow structured training programs.

### Architecture Overview

```
ppl-coach/
├── apps/
│   ├── backend/          # ASP.NET Core 8 Web API (Clean Architecture)
│   ├── web/              # React 19 + Vite + TypeScript web application  
│   └── mobile/           # Expo React Native mobile application
├── shared/               # Shared packages
│   ├── api-client/       # Auto-generated API client with React Query
│   ├── ui/              # Shared UI components
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── constants/       # Application constants
│   ├── logger/          # Logging utilities
│   └── config/          # Shared configuration
└── tests/
    └── e2e/             # End-to-end tests with Playwright
```

## Technology Stack

### Monorepo Management
- **Build System**: Turborepo for task orchestration and caching
- **Package Management**: npm workspaces for web/shared, pnpm for mobile
- **Scripts**: Comprehensive dev, build, test, and deployment scripts

### Backend (ASP.NET Core 8)
- **Framework**: ASP.NET Core 8 with Minimal APIs
- **Database**: PostgreSQL with Entity Framework Core
- **Architecture**: Clean Architecture (Domain, Application, Infrastructure, API)
- **Validation**: FluentValidation
- **Logging**: Serilog with structured logging
- **Mapping**: AutoMapper for DTOs
- **Documentation**: Swagger/OpenAPI with comprehensive spec generation

### Frontend Web (React 19)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **Routing**: TanStack Router with file-based routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Radix UI primitives + Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Testing**: Vitest for unit tests
- **Icons**: Phosphor Icons
- **Code Quality**: ESLint + Prettier + TypeScript strict mode

### Mobile (React Native with Expo)
- **Framework**: Expo SDK with React Native
- **Navigation**: Expo Router with file-based routing
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: TanStack Query for consistent data layer
- **Package Manager**: pnpm for faster installs
- **Environment Management**: Multi-environment support (development/staging/production)
- **Build System**: EAS Build for native compilation
- **App Configuration**: Dynamic app.config.ts with environment-based settings

### Shared Infrastructure
- **API Client**: Auto-generated with Orval from live OpenAPI spec
- **Type Generation**: Full TypeScript types from backend schema
- **React Query Integration**: Automatic hooks generation for all endpoints
- **Error Handling**: Consistent error handling across platforms
- **Custom Mutator**: Shared Axios configuration with interceptors

## Domain Model (Fitness Application)

### Core Entities
- **UserProfile**: User information, body metrics, preferences
- **WorkoutSession**: Individual workout sessions with timing and completion tracking
- **Movement**: Exercise movements with equipment and muscle group info
- **SetLog**: Individual sets with weight, reps, RPE tracking
- **WorkoutTemplate**: Predefined workout templates
- **WorkoutTemplateItem**: Items within workout templates
- **BodyMetric**: Body measurements and progress tracking
- **EquipmentItem**: Gym equipment and availability

### Key Enums
- **DayType**: Push, Pull, Legs (PPL split)
- **Sex**: User gender for calculations
- **Various fitness-related enums for equipment, muscle groups, etc.

## Development Guidelines

### Monorepo Development Patterns

#### Turborepo Usage
- Use `turbo dev` for parallel development of all apps
- Leverage build caching for faster development cycles
- Understand task dependencies and execution order
- Use `turbo build --filter=<app>` for selective builds

#### Package Management
- Web and shared packages use npm workspaces
- Mobile app uses pnpm for performance
- Cross-reference shared packages using workspace protocols
- Maintain consistent dependency versions across apps

#### Environment Configuration
- Use `.env.example` as the template for local development
- Mobile app supports APP_ENV variable for different builds
- Backend uses environment variables for database and external services
- Web app uses Vite environment variable prefixing

### API-First Development Workflow

#### Orval Configuration
- API client auto-generates from `http://localhost:5179/swagger/v1/swagger.json`
- Uses "split" mode for organized file structure
- Generates React Query hooks automatically
- Custom instance configuration for shared Axios setup
- Prettier formatting applied to generated code

#### Development Cycle
1. **Backend Changes**: Update domain entities, services, and endpoints
2. **Schema Update**: Ensure Swagger documentation is accurate
3. **Client Generation**: Run `npm run api:generate` to update client
4. **Frontend Implementation**: Use generated hooks in React components
5. **Mobile Sync**: Generated client works across both web and mobile
6. **Testing**: Validate changes across all consuming applications

### Backend Development (C#/.NET)

#### Architecture Patterns
- Follow Clean Architecture principles
- Use CQRS pattern where appropriate
- Implement Repository pattern with Unit of Work
- Use Dependency Injection throughout

#### API Design
- Use Minimal APIs for endpoints
- Generate comprehensive OpenAPI documentation
- Implement proper HTTP status codes
- Use DTOs for request/response objects
- Validate all inputs with FluentValidation

#### Database
- Use Entity Framework Core with Code First approach
- Apply proper database migrations
- Use PostgreSQL-specific features where beneficial
- Implement proper indexing for performance

#### Error Handling
- Use structured logging with Serilog
- Implement global exception handling
- Return consistent error responses
- Log appropriate information for debugging

### Frontend Development (React/TypeScript)

#### Code Organization
- Use feature-based folder structure
- Implement proper separation of concerns
- Create reusable components in shared/ui
- Use custom hooks for business logic

#### State Management
- Use TanStack Query for server state
- Minimize client-side state
- Implement proper caching strategies
- Handle loading and error states consistently

#### UI/UX Guidelines
- Follow Radix UI patterns for accessibility
- Use Tailwind CSS for consistent styling
- Implement responsive design
- Create consistent loading states and error handling
- Use proper TypeScript types throughout

#### Performance
- Implement code splitting where appropriate
- Use React.memo for expensive components
- Optimize bundle size
- Implement proper error boundaries

### Mobile Development (React Native/Expo)

#### Environment Management
- **APP_ENV**: Controls app configuration (development/staging/production)
- **Dynamic App Config**: app.config.ts adjusts based on environment
- **App Icon Badging**: Development and staging builds show environment badges
- **Scheme Management**: Different URL schemes per environment

#### Build Configurations
- **Development**: Local development with Expo Go
- **Staging**: Internal testing builds with staging API
- **Production**: App Store/Play Store ready builds
- **EAS Build**: Native compilation in the cloud

#### Performance Optimizations
- **Bundle Splitting**: Optimize for mobile bundle sizes
- **Native Navigation**: Expo Router for performant navigation
- **Offline Support**: Consider offline-first patterns where appropriate
- **Memory Management**: Proper cleanup of listeners and subscriptions

### Shared Package Guidelines

#### API Client
- Auto-generate from OpenAPI spec using Orval
- Maintain type safety across frontend and mobile
- Implement proper error handling
- Use React Query integration

#### UI Components
- Create platform-agnostic components where possible
- Maintain consistency between web and mobile
- Use proper TypeScript props interfaces
- Document component APIs

## Testing Strategy

### Unit Testing
- Test business logic thoroughly
- Use proper mocking strategies
- Maintain high code coverage for critical paths
- Test error scenarios

### Integration Testing
- Test API endpoints with real database
- Test database operations
- Test authentication flows
- Validate data transformations

### E2E Testing
- Test critical user journeys
- Test across different devices/browsers
- Automate deployment verification
- Test mobile app functionality

## Development Workflows

### Local Development Setup
```bash
# Initial setup
cp .env.example .env
npm install
npm run setup

# Start all services in parallel
npm run dev:all

# Individual service development
npm run dev:backend    # ASP.NET Core API (port 5179)
npm run dev:web       # React web app (port 5173)
npm run dev:mobile    # Expo mobile app
npm run dev:db        # PostgreSQL database (port 5432)
```

### API Development Workflow
```bash
# 1. Make backend changes
cd apps/backend && dotnet run

# 2. Verify Swagger documentation at http://localhost:5179/swagger

# 3. Generate updated API client
npm run api:generate

# 4. Build shared API client package
npm run api:build

# 5. Use updated types/hooks in frontend/mobile
# Generated hooks are available immediately
```

### Database Management
```bash
# Create new migration
cd apps/backend
dotnet ef migrations add <MigrationName> --project src/PplCoach.Infrastructure

# Apply migrations
dotnet ef database update --project src/PplCoach.Infrastructure

# Reset database for development
npm run reset  # Stops containers and clears volumes
```

### Mobile Development Workflow
```bash
# Development build
cd apps/mobile
pnpm start

# Environment-specific builds
pnpm start:staging
pnpm start:production

# Native builds
pnpm build:development:ios
pnpm build:staging:android
pnpm build:production:ios
```

## Code Standards

### TypeScript Configuration
- **Strict Mode**: All projects use TypeScript strict mode
- **Path Mapping**: Use absolute imports with path mapping
- **Type Safety**: No `any` types, prefer proper type definitions
- **Shared Types**: Common types in `shared/types` package

### API Client Standards
- **Generated Code**: Never manually edit generated API client code
- **Custom Instance**: Use shared Axios configuration for all requests
- **Error Handling**: Consistent error responses and handling patterns
- **Type Safety**: Full TypeScript coverage from backend to frontend

### Component Standards
- **Props Interface**: Always define TypeScript interfaces for component props
- **Default Props**: Use default parameter values instead of defaultProps
- **Ref Forwarding**: Implement ref forwarding for reusable components
- **Performance**: Use React.memo judiciously for expensive components

## Performance Considerations

### Backend
- Implement proper database indexing
- Use pagination for large datasets
- Implement caching where appropriate
- Optimize database queries
- Use async operations throughout

### Frontend
- Implement virtual scrolling for large lists
- Use proper memoization
- Optimize bundle size
- Implement proper loading states
- Cache API responses appropriately

## Security Guidelines

### Authentication & Authorization
- Implement proper JWT handling
- Use secure password hashing
- Implement rate limiting
- Validate all inputs
- Use HTTPS in production

### Data Protection
- Encrypt sensitive data
- Implement proper CORS policies
- Use environment variables for secrets
- Follow OWASP security guidelines
- Implement proper logging without exposing sensitive data

## Deployment & Infrastructure

### Development
- Use Docker for local database
- Support hot reloading for all applications
- Implement proper environment configuration

### Production
- Use proper CI/CD pipelines
- Implement database backup strategies
- Monitor application performance
- Use proper logging and monitoring
- Implement health checks

## Fitness Domain Expertise

### Workout Programming Concepts
- **Progressive Overload**: Gradual increase in training stimulus over time
- **Volume Calculation**: Sets × Reps × Weight for tracking training load
- **Intensity Metrics**: RPE (Rate of Perceived Exertion) and percentage-based loading
- **Periodization**: Planned variation in training variables
- **Recovery Tracking**: Rest periods, sleep, and subjective wellness

### PPL Training System
- **Push Days**: Chest, shoulders, triceps (pressing movements)
- **Pull Days**: Back, biceps, rear delts (pulling movements)  
- **Leg Days**: Quadriceps, hamstrings, glutes, calves (lower body)
- **Frequency**: Typically 3-6 days per week with 2x per week muscle frequency
- **Exercise Selection**: Compound movements prioritized, accessories for balance

### Data Analytics for Fitness
- **Strength Progression**: Track 1RM estimates and strength gains over time
- **Volume Progression**: Monitor training load and recovery capacity
- **Body Composition**: Weight, measurements, and progress photos
- **Performance Metrics**: Workout duration, rest periods, session RPE
- **Injury Prevention**: Load management and movement quality tracking

## Testing and Quality Assurance

### Automated Testing Strategy
- **Unit Tests**: Domain logic and utility functions
- **Integration Tests**: API endpoints with database
- **Component Tests**: React components in isolation
- **E2E Tests**: Critical user workflows with Playwright
- **Mobile Testing**: Device-specific testing on iOS and Android

### Code Quality Gates
- **Type Checking**: TypeScript compilation must pass
- **Linting**: ESLint rules enforced in CI/CD
- **Formatting**: Prettier for consistent code style
- **Test Coverage**: Minimum coverage thresholds for critical paths
- **Performance**: Bundle size monitoring and performance budgets

## AI Assistant Guidelines

When working on this codebase:

1. **Monorepo Awareness**: Understand the impact of changes across multiple applications
2. **API-First Approach**: Always consider the API contract when making backend changes
3. **Type Safety**: Leverage the full TypeScript ecosystem from backend to frontend
4. **Cross-Platform Consistency**: Ensure changes work on both web and mobile
5. **Performance Impact**: Consider mobile performance implications
6. **Fitness Domain**: Understand basic exercise science and training principles
7. **User Experience**: Focus on the needs of fitness enthusiasts and coaches
8. **Code Generation**: Respect the auto-generated code boundaries
9. **Environment Awareness**: Consider different deployment environments
10. **Testing**: Include appropriate tests for new functionality

## Common Development Patterns

### Adding New Features End-to-End
1. **Domain Modeling**: Add entities and business logic to Domain layer
2. **Data Layer**: Create repositories and database configurations
3. **Application Layer**: Implement services and DTOs
4. **API Layer**: Create endpoints with proper validation
5. **Documentation**: Ensure OpenAPI spec is updated
6. **Client Generation**: Run API generation to update client
7. **Frontend Implementation**: Use generated hooks in UI components
8. **Mobile Implementation**: Ensure feature works on mobile platform
9. **Testing**: Add tests at all layers
10. **Documentation**: Update relevant documentation

### Working with Generated API Client
```typescript
// Use generated hooks in React components
import { useGetWorkoutSessions } from '@ppl-coach/api-client';

function WorkoutHistory() {
  const { data, isLoading, error } = useGetWorkoutSessions({
    userId: currentUser.id
  });
  
  // Component implementation
}

// Generated types are automatically available
import type { WorkoutSessionDto } from '@ppl-coach/api-client';
```

### Shared Component Development
```typescript
// Create in shared/ui for cross-platform use
export interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
  onPress: () => void;
}

// Component works on both web and mobile with NativeWind
export const Button: React.FC<ButtonProps> = ({ variant, size, onPress }) => {
  return (
    <Pressable 
      className={`btn-${variant} btn-${size}`}
      onPress={onPress}
    >
      {/* Component content */}
    </Pressable>
  );
};
```

Remember: This application serves fitness enthusiasts who need reliable, accurate workout tracking and progress monitoring. Every change should enhance the user's ability to achieve their fitness goals effectively while maintaining the high-quality, type-safe, and performant codebase.

## Troubleshooting Common Issues

### NuGet Restore Issues in JetBrains Rider

#### Problem: Read-only file system errors during NuGet restore
```
Read-only file system : '/[uuid].tmp'
System.IO.IOException: Read-only file system : '/[uuid].tmp'
```

#### Solutions (try in order):

1. **Clear NuGet Cache**:
```bash
# Clear all NuGet caches
dotnet nuget locals all --clear

# Alternative: Clear specific caches
dotnet nuget locals global-packages --clear
dotnet nuget locals temp --clear
dotnet nuget locals plugins-cache --clear
```

2. **Clean and Restore Solution**:
```bash
# From project root
cd apps/backend
dotnet clean
dotnet restore --force
```

3. **Fix Rider NuGet Settings**:
   - Open Rider → Preferences → Build, Execution, Deployment → NuGet
   - Change "NuGet tool version" to "Bundled (Recommended)"
   - Uncheck "Use NuGet.exe from PATH"
   - Clear "Package Sources" and re-add default source: https://api.nuget.org/v3/index.json

4. **Reset Rider NuGet Cache**:
```bash
# Close Rider completely, then:
rm -rf ~/Library/Caches/JetBrains/Rider*/
rm -rf ~/.nuget/packages/
dotnet nuget locals all --clear
```

5. **Fix Temporary Directory Permissions**:
```bash
# Check temp directory permissions
sudo chmod 755 /tmp
sudo chown $(whoami) /tmp

# Alternative: Set TMPDIR environment variable
export TMPDIR=$HOME/tmp
mkdir -p $TMPDIR
```

6. **Use Command Line Instead**:
```bash
# If Rider continues to fail, use terminal:
cd apps/backend
dotnet restore --verbosity detailed
dotnet build
```

#### Prevention:
- Keep Rider updated to the latest version
- Regularly clear NuGet caches during development
- Use the bundled NuGet tools rather than system-installed ones
- Ensure proper file system permissions on macOS

### Other Common Issues

#### Database Connection Issues
```bash
# Reset database completely
docker compose down -v
docker compose up -d db
cd apps/backend
dotnet ef database update --project src/PplCoach.Infrastructure
```

#### API Client Generation Issues
```bash
# Clean and regenerate API client
npm run api:clean
# Start backend first, then:
npm run api:generate
```

#### Mobile Build Issues
```bash
# Clear Expo and React Native caches
cd apps/mobile
pnpm cache clean
expo r -c
rm -rf node_modules
pnpm install
```

#### Workspace Package Resolution Issues
```bash
# Reset entire monorepo
npm run reset
npm install
```
