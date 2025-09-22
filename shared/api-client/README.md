# API Client with React Query

This package contains the auto-generated, fully-typed API client for the PplCoach application. It's generated from your backend's OpenAPI/Swagger specification using [Orval](https://orval.dev/) and optimized for **React Query** to provide the best data fetching experience.

## Features

- 🔥 **Fully typed React Query hooks** - All API endpoints generate `useQuery` and `useMutation` hooks
- ⚡ **Automatic caching & background refetching** - Smart cache management with stale-while-revalidate
- 🚀 **Shared across platforms** - Same hooks work in both React Native (mobile) and React (web)
- 🔄 **Optimistic updates** - Instant UI updates with automatic rollback on errors
- 🔒 **Authentication ready** - Built-in token management and interceptors
- 🎯 **Smart retry logic** - Configurable retry policies for different error types
- 📱 **Mobile optimized** - Pull-to-refresh, offline support, and React Native patterns

## Usage

### Installation & Setup

This package is automatically linked in your monorepo workspace. Set up React Query in your app:

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient, configureApiClient } from '@ppl-coach/api-client';

// Configure the API client
configureApiClient(process.env.VITE_API_URL || 'http://localhost:5000');

// Create the query client with optimized defaults
const queryClient = createQueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourAppComponents />
    </QueryClientProvider>
  );
}
```

### Generated React Query Hooks

Orval automatically generates React Query hooks for all your API endpoints:

```typescript
// Query hooks (for GET requests)
const { data, isLoading, error, refetch } = useGetUser({ userId: '123' });
const { data: workouts } = useGetUserWorkouts({ userId: '123' });

// Mutation hooks (for POST, PUT, DELETE requests)  
const createWorkout = useCreateWorkout({
  onSuccess: (data) => {
    // Invalidate related queries to refetch fresh data
    queryClient.invalidateQueries({ queryKey: ['getUserWorkouts'] });
  }
});

// Use the mutation
createWorkout.mutate({
  name: 'Push Day',
  exercises: [...]
});
```

### Advanced Patterns

#### Optimistic Updates
```typescript
const deleteWorkout = useDeleteWorkout({
  onMutate: async (variables) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['workouts'] });
    
    // Optimistically update the UI
    const previousWorkouts = queryClient.getQueryData(['workouts']);
    queryClient.setQueryData(['workouts'], (old) => 
      old?.filter(w => w.id !== variables.workoutId)
    );
    
    return { previousWorkouts };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['workouts'], context?.previousWorkouts);
  },
  onSettled: () => {
    // Refetch to ensure consistency
    queryClient.invalidateQueries({ queryKey: ['workouts'] });
  },
});
```

#### Conditional Queries
```typescript
const { data: user } = useGetUser(
  { userId },
  {
    enabled: !!userId, // Only run if userId exists
    staleTime: 1000 * 60 * 5, // Consider fresh for 5 minutes
    retry: 3,
  }
);
```

#### Infinite Queries (for pagination)
```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteGetWorkouts(
  { limit: 10 },
  {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  }
);
```

### Platform-Specific Features

#### React Native
- **Pull-to-refresh**: Built into the generated hooks
- **Native alerts**: Automatic error and success notifications
- **AsyncStorage**: Token persistence across app restarts

#### React Web  
- **React Query DevTools**: Built-in debugging support
- **Browser storage**: LocalStorage token management
- **Window focus refetching**: Automatic data refresh

### Authentication

```typescript
import { useAuth } from '@ppl-coach/api-client';

const { login, logout, isLoggingIn, loginError } = useAuth();

// Login
await login('user@example.com', 'password');

// The client automatically:
// - Stores the auth token
// - Adds it to all subsequent requests  
// - Invalidates and refetches protected queries
```

## Development

### Regenerating the Client

When your backend API changes, regenerate the client:

```bash
# From the root of the monorepo
npm run api:generate

# This will:
# 1. Fetch the latest OpenAPI spec from your backend
# 2. Generate new React Query hooks and TypeScript types
# 3. Build the package for consumption
```

### Available Scripts

- `npm run generate` - Generate client from OpenAPI spec
- `npm run build` - Build the TypeScript package
- `npm run dev` - Watch mode for development

## Generated Hook Patterns

Orval generates these hook patterns from your API:

| HTTP Method | Generated Hook | Example |
|-------------|----------------|---------|
| GET | `useGetResource` | `useGetUser`, `useGetWorkouts` |
| POST | `useCreateResource` | `useCreateWorkout`, `useCreateExercise` |
| PUT/PATCH | `useUpdateResource` | `useUpdateWorkout`, `useUpdateProfile` |
| DELETE | `useDeleteResource` | `useDeleteWorkout`, `useDeleteExercise` |

All hooks include:
- ✅ Full TypeScript support
- ✅ Loading states (`isLoading`, `isPending`)  
- ✅ Error handling with typed errors
- ✅ Success callbacks with typed responses
- ✅ Automatic retries with smart policies
- ✅ Request cancellation support

## Configuration

The query client comes with production-ready defaults:
- **Stale time**: 5 minutes (queries considered fresh)
- **Cache time**: 30 minutes (data kept in memory)
- **Retry logic**: 3 retries for network errors, no retries for 4xx client errors
- **Background refetch**: Disabled on window focus (can be enabled per query)
