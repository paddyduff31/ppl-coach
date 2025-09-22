// Example usage with centralized utilities - React Web App
import React from 'react';
import {
  // Centralized provider and utilities
  APIProvider,
  getQueryClient,
  // Generated hooks (available after API generation)
  useGetUser,
  useCreateWorkout,
  useGetUserSessions,
  // Centralized utilities from both web and mobile
  invalidateQueries,
  queryOptions,
  errorHandlers,
  // Types
  User,
  WorkoutSession,
} from '@ppl-coach/api-client';

// Configure API client
import { configureApiClient } from '@ppl-coach/api-client';
configureApiClient(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');

// Main app with centralized API provider
export const App: React.FC = () => {
  return (
    <APIProvider showDevtools={true}>
      <div className="app">
        <UserDashboard userId="123" />
      </div>
    </APIProvider>
  );
};

// Enhanced component using centralized patterns
export const UserDashboard: React.FC<{ userId: string }> = ({ userId }) => {
  const queryClient = getQueryClient();

  // User data with optimized caching
  const {
    data: user,
    isLoading: userLoading,
    error: userError
  } = useGetUser(
    { userId },
    {
      ...queryOptions.userProfile, // Centralized cache settings
      enabled: !!userId,
    }
  );

  // Sessions with moderate caching
  const {
    data: sessions,
    isLoading: sessionsLoading,
    error: sessionsError
  } = useGetUserSessions(
    { userId },
    queryOptions.sessions // Centralized cache settings
  );

  // Enhanced mutation with centralized invalidation
  const createWorkout = useCreateWorkout({
    onSuccess: (data) => {
      console.log('✅ Workout created:', data);
      // Use centralized invalidation patterns
      invalidateQueries.sessions(queryClient, userId);
      invalidateQueries.progress(queryClient, userId);
    },
    onError: (error) => {
      const message = errorHandlers.generic(error);
      console.error('❌ Failed to create workout:', message);
      // You could show a toast notification here
    },
  });

  const handleCreateWorkout = () => {
    createWorkout.mutate({
      name: 'Push Day',
      description: 'Chest, shoulders, triceps',
      exercises: [
        { name: 'Bench Press', sets: 4, reps: 8, weight: 185 }
      ]
    });
  };

  if (userLoading) return <div>Loading user data...</div>;
  if (userError) return <div>Error: {errorHandlers.network(userError)}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="dashboard">
      <header>
        <h1>Welcome back, {user.name}!</h1>
        <p>{user.email}</p>
      </header>

      <section>
        <h2>Recent Sessions</h2>
        {sessionsLoading ? (
          <div>Loading sessions...</div>
        ) : sessionsError ? (
          <div>Error loading sessions: {errorHandlers.generic(sessionsError)}</div>
        ) : (
          <div>
            {sessions?.map((session: WorkoutSession) => (
              <div key={session.id} className="session-card">
                <h3>{session.name}</h3>
                <p>{new Date(session.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <button
          onClick={handleCreateWorkout}
          disabled={createWorkout.isPending}
          className="create-workout-btn"
        >
          {createWorkout.isPending ? 'Creating...' : '🏋️ Create New Workout'}
        </button>
      </section>
    </div>
  );
};
