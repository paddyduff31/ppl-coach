// Example usage with centralized utilities - React Native Mobile App
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import {
  // Centralized provider and utilities
  APIProvider,
  getQueryClient,
  // Generated hooks (available after API generation)
  useGetUser,
  useGetUserSessions,
  useInfiniteGetUserSessions,
  // Centralized utilities from both web and mobile
  invalidateQueries,
  queryOptions,
  errorHandlers,
  normalizePages,
  getNextPageParam,
  // Types
  User,
  WorkoutSession,
  PaginateQuery,
} from '@ppl-coach/api-client';

// Configure API client for mobile
import { configureApiClient } from '@ppl-coach/api-client';
configureApiClient(process.env.REACT_NATIVE_API_URL || 'http://localhost:5000');

// Main app with centralized API provider (mobile-optimized)
export const App: React.FC = () => {
  return (
    <APIProvider>
      <View style={{ flex: 1 }}>
        <UserDashboardScreen userId="123" />
      </View>
    </APIProvider>
  );
};

// Enhanced mobile component using centralized patterns
export const UserDashboardScreen: React.FC<{ userId: string }> = ({ userId }) => {
  const queryClient = getQueryClient();

  // User data with mobile-optimized caching
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser
  } = useGetUser(
    { userId },
    {
      ...queryOptions.userProfile,
      enabled: !!userId,
    }
  );

  // Infinite scroll sessions for mobile performance
  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    error: sessionsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchSessions
  } = useInfiniteGetUserSessions(
    { userId, limit: 10 },
    {
      ...queryOptions.sessions,
      getNextPageParam,
    }
  );

  // Flatten paginated results using centralized utility
  const sessions = normalizePages(sessionsData?.pages);

  const handleCreateWorkout = () => {
    Alert.alert(
      '🏋️ Create Workout',
      'This would open the workout creation screen',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: () => {
            // After workout creation, invalidate related queries
            invalidateQueries.sessions(queryClient, userId);
            invalidateQueries.progress(queryClient, userId);
            Alert.alert('Success', 'Workout created!');
          }
        }
      ]
    );
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchUser(), refetchSessions()]);
    } catch (error) {
      Alert.alert('Error', errorHandlers.network(error));
    }
  };

  if (userLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  if (userError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>
          {errorHandlers.network(userError)}
        </Text>
        <TouchableOpacity
          onPress={() => refetchUser()}
          style={{ backgroundColor: '#007AFF', padding: 10, borderRadius: 5 }}
        >
          <Text style={{ color: 'white' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>User not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, padding: 20 }}
      refreshing={userLoading || sessionsLoading}
      onRefresh={handleRefresh}
    >
      {/* User Header */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 5 }}>
          Welcome back, {user.name}! 👋
        </Text>
        <Text style={{ fontSize: 16, color: '#666' }}>
          {user.email}
        </Text>
      </View>

      {/* Quick Actions */}
      <TouchableOpacity
        onPress={handleCreateWorkout}
        style={{
          backgroundColor: '#007AFF',
          padding: 16,
          borderRadius: 12,
          alignItems: 'center',
          marginBottom: 30
        }}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          🏋️ Create New Workout
        </Text>
      </TouchableOpacity>

      {/* Sessions List */}
      <View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>
          Recent Sessions
        </Text>

        {sessionsLoading && sessions.length === 0 ? (
          <Text>Loading sessions...</Text>
        ) : sessionsError ? (
          <View style={{ padding: 15, backgroundColor: '#ffebee', borderRadius: 8 }}>
            <Text style={{ color: 'red' }}>
              {errorHandlers.generic(sessionsError)}
            </Text>
          </View>
        ) : (
          <View>
            {sessions.map((session: WorkoutSession) => (
              <View
                key={session.id}
                style={{
                  backgroundColor: 'white',
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                  {session.name}
                </Text>
                <Text style={{ fontSize: 14, color: '#666' }}>
                  {new Date(session.date).toLocaleDateString()}
                </Text>
                <Text style={{ fontSize: 14, color: '#333', marginTop: 4 }}>
                  {session.notes || 'No notes'}
                </Text>
              </View>
            ))}

            {/* Load More Button for Infinite Scroll */}
            {hasNextPage && (
              <TouchableOpacity
                onPress={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                style={{
                  backgroundColor: '#f0f0f0',
                  padding: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginTop: 10
                }}
              >
                <Text style={{ color: '#007AFF' }}>
                  {isFetchingNextPage ? 'Loading more...' : 'Load More Sessions'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};
