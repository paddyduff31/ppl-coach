# PPL Coach - AI Instructions (Backend & Frontend)

## Architecture Overview

This codebase follows Clean Architecture principles with the following layers:
- **Domain**: Entities, Enums, Domain logic
- **Application**: Services, DTOs, Interfaces
- **Infrastructure**: Data access, External services
- **API**: Controllers/Endpoints, Configuration

---

# Backend Architecture

## Repository Pattern Implementation

**IMPORTANT**: This codebase uses the **Unit of Work + Generic Repository** pattern, NOT individual repository implementations.

### How it Works:
1. **UnitOfWork** (`Infrastructure/Repositories/UnitOfWork.cs`) provides access to all repositories
2. **Generic Repository** (`IRepository<T>`) handles CRUD operations for any entity
3. **Services** inject `IUnitOfWork` and access repositories like `_unitOfWork.WorkoutSessions`

### DON'T Create:
- Individual repository interfaces like `ISessionRepository`, `IMovementRepository`
- Separate repository implementations
- Direct DbContext injection in services

### DO Use:
```csharp
public class SessionService : ISessionService
{
    private readonly IUnitOfWork _unitOfWork;

    public SessionService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<SessionDto>> GetUserSessionsAsync(Guid userId)
    {
        var sessions = await _unitOfWork.WorkoutSessions
            .GetQueryable()
            .Include(s => s.SetLogs)
            .Where(s => s.UserId == userId)
            .ToListAsync();
        
        return sessions.Select(MapToDto).ToList();
    }
}
```

## Entity Framework Configuration

- **DbContext**: `PplCoachDbContext` in `Infrastructure/Data/`
- **Entities**: Located in `Domain/Entities/`
- **Migrations**: Auto-generated, use EF Core CLI tools

## Service Registration

Services are registered in `Program.cs`:
```csharp
// Core pattern - only register UnitOfWork and Services
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<ISessionService, SessionService>();
// DON'T register individual repositories
```

## API Endpoint Pattern

Endpoints are organized in separate files under `Api/Endpoints/`:
- Use minimal APIs with extension methods
- Group related endpoints together
- Return consistent response format: `{ data: ... }`

## Existing Entities

Available through UnitOfWork:
- `UserProfiles` - User accounts and profiles
- `Movements` - Exercise definitions
- `WorkoutSessions` - Workout instances
- `SetLogs` - Individual set records
- `BodyMetrics` - Body measurements
- `EquipmentItems` - Available equipment
- `WorkoutTemplates` - Workout templates
- `WorkoutTemplateItems` - Template items

## Common Patterns

### Adding New Features:
1. Create/modify entities in `Domain/Entities/`
2. Update `PplCoachDbContext` if needed
3. Add service interface and implementation in `Application/Services/`
4. Create DTOs in `Application/DTOs/`
5. Add endpoints in `Api/Endpoints/`
6. Register services in `Program.cs`
7. Map endpoints in `Program.cs`

### Querying Data:
```csharp
// Use GetQueryable() for complex queries with LINQ
var results = await _unitOfWork.EntityName
    .GetQueryable()
    .Include(x => x.RelatedEntity)
    .Where(x => x.Condition)
    .ToListAsync();

// Use direct methods for simple operations
var entity = await _unitOfWork.EntityName.GetByIdAsync(id);
await _unitOfWork.EntityName.AddAsync(entity);
await _unitOfWork.SaveChangesAsync();
```

## Frontend Integration

- API base URL: Configured in frontend `api/http.ts`
- CORS: Already configured for `localhost:5173` and `localhost:5174`
- Response format: `{ data: T }` for successful responses

## Health Integrations

For Apple Health/watch features, extend the existing pattern:
- Add health-related entities if needed
- Use UnitOfWork pattern for data access
- Consider external API integrations in Infrastructure layer

## Testing

- Use the existing UnitOfWork for mocking in tests
- Mock `IUnitOfWork` rather than individual repositories
- Test services, not repositories (they're generic)

---

# Frontend Architecture

## Technology Stack
- **React 18** with TypeScript
- **TanStack Router** for routing
- **TanStack Query** for API state management
- **Tailwind CSS** for styling
- **Phosphor Icons** for iconography
- **Vite** for build tooling

## Project Structure
```
frontend/src/
├── api/           # API client and schemas
├── app/           # App-level configuration (router, providers)
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── pages/         # Route components
├── styles/        # Global styles
├── test/          # Test files
└── utils/         # Utility functions
```

## API Integration Pattern

### API Client Configuration
- **Base URL**: Configured in `api/http.ts`
- **Response Format**: `{ data: T }` for successful responses
- **Error Handling**: Centralized in HTTP client

### Using TanStack Query (React Query)
```typescript
// Custom hook pattern
export function useSession(id: string) {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => getSession(id),
    enabled: !!id
  })
}

// Mutation pattern
export function useLogSet() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: logSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    }
  })
}
```

## Component Organization

### UI Components
- Located in `components/ui/` - basic building blocks (Button, Input, etc.)
- Follow consistent API patterns with proper TypeScript interfaces

### Feature Components
- Located in `components/` - feature-specific components
- Should be composable and reusable
- Use proper props interfaces with TypeScript

### Page Components
- Located in `pages/` - full route components
- Handle data fetching and state management
- Compose smaller components

## Routing Pattern

### TanStack Router Usage
```typescript
// Route definition in app/router.tsx
const sessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/log/$id',
  component: LogSession,
})

// Navigation in components
const navigate = useNavigate()
navigate({ to: '/sessions/$id', params: { id: sessionId } })
```

## State Management

### Server State
- **Use TanStack Query** for all server state
- Create custom hooks for each API endpoint
- Handle loading, error, and success states

### Local State
- **Use React useState/useReducer** for component-local state
- **Use Context** sparingly for app-wide state (theme, auth)
- **Avoid prop drilling** - use composition patterns

## Styling Guidelines

### Tailwind CSS Patterns
```typescript
// Use cn() utility for conditional classes
import { cn } from '../utils/utils'

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === 'primary' && "primary-classes"
)} />
```

### Component Styling
- Use Tailwind utility classes primarily
- Create component-specific styles when needed
- Follow consistent spacing and color patterns

## Data Fetching Patterns

### Loading States
```typescript
const { data: sessions, isLoading, error } = useSessions()

if (isLoading) return <LoadingState />
if (error) return <ErrorState error={error} />
if (!sessions) return <EmptyState />

return <SessionsList sessions={sessions} />
```

### Error Handling
- Use React Query's error boundaries
- Provide user-friendly error messages
- Include retry functionality where appropriate

## Form Handling

### Form Components
- Use controlled components with React Hook Form (if installed)
- Validate on client side with proper TypeScript types
- Handle submission loading and error states

### Input Components
- Keep forms simple and fast (as per workout input requirements)
- Use proper accessibility attributes
- Handle keyboard navigation

## Performance Considerations

### Code Splitting
- Use React.lazy() for page-level components
- Implement proper loading boundaries

### Query Optimization
- Use appropriate staleTime and cacheTime for React Query
- Implement optimistic updates for mutations
- Use proper query invalidation strategies

## Navigation & UX

### Keyboard Shortcuts
- Implement using `useKeyboardShortcuts` hook
- Follow system conventions (⌘K for search, etc.)
- Provide visual indicators for shortcuts

### Mobile Responsiveness
- Use Tailwind responsive classes (`sm:`, `md:`, `lg:`)
- Implement touch-friendly interactions
- Consider mobile-first design approach

## Component Patterns

### Compound Components
```typescript
// Good pattern for complex components
<Navigation>
  <Navigation.Logo />
  <Navigation.Menu>
    <Navigation.Item>Dashboard</Navigation.Item>
    <Navigation.Item>Workouts</Navigation.Item>
  </Navigation.Menu>
</Navigation>
```

### Render Props / Children Functions
```typescript
// For flexible components
<DataProvider>
  {({ data, loading }) => (
    loading ? <Spinner /> : <DataView data={data} />
  )}
</DataProvider>
```

## Testing Guidelines

### Component Testing
- Use React Testing Library
- Test user interactions, not implementation details
- Mock API calls with MSW (Mock Service Worker)

### Integration Testing
- Test complete user flows
- Mock external dependencies
- Use proper test data setup

## Common Anti-Patterns to Avoid

### DON'T:
- Create separate API clients for each endpoint
- Use useState for server state
- Prop drill through many components
- Create overly complex component hierarchies
- Mix business logic with UI components

### DO:
- Use TanStack Query for all server state
- Create custom hooks for API interactions
- Use proper TypeScript interfaces
- Follow component composition patterns
- Keep components focused and single-purpose

## Integration with Backend

### API Endpoints
All backend endpoints follow the pattern:
```
GET /api/sessions/user/{userId} -> { data: Session[] }
POST /api/sessions -> { data: Session }
PUT /api/sessions/{id} -> { data: Session }
DELETE /api/sessions/{id} -> 204 No Content
```

### Type Safety
- Import types from `api/schemas.ts`
- Use proper TypeScript interfaces for all API interactions
- Validate API responses where necessary

---

# Development Workflow

## Adding New Features

### Backend:
1. Create/modify entities in `Domain/Entities/`
2. Update `PplCoachDbContext` if needed
3. Add service interface and implementation in `Application/Services/`
4. Create DTOs in `Application/DTOs/`
5. Add endpoints in `Api/Endpoints/`
6. Register services in `Program.cs`
7. Map endpoints in `Program.cs`

### Frontend:
1. Add API functions in `api/` with proper types
2. Create custom hooks for the API in `hooks/`
3. Create/update components as needed
4. Add routes in `app/router.tsx`
5. Update navigation if needed
6. Test the complete user flow

## Database Changes
1. Update entities in Domain layer
2. Run `dotnet ef migrations add MigrationName`
3. Run `dotnet ef database update`
4. Update corresponding TypeScript types in frontend
