using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace PplCoach.Api.Hubs;

[Authorize]
public class WorkoutHub : Hub
{
    private readonly ILogger<WorkoutHub> _logger;

    public WorkoutHub(ILogger<WorkoutHub> logger)
    {
        _logger = logger;
    }

    // Join a workout session for real-time updates
    public async Task JoinWorkoutSession(string sessionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"workout-{sessionId}");
        _logger.LogInformation("User {UserId} joined workout session {SessionId}",
            Context.UserIdentifier, sessionId);
    }

    // Leave a workout session
    public async Task LeaveWorkoutSession(string sessionId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"workout-{sessionId}");
        _logger.LogInformation("User {UserId} left workout session {SessionId}",
            Context.UserIdentifier, sessionId);
    }

    // Real-time set completion updates
    public async Task CompleteSet(string sessionId, string exerciseId, int setNumber, int reps, decimal weight)
    {
        var setData = new
        {
            ExerciseId = exerciseId,
            SetNumber = setNumber,
            Reps = reps,
            Weight = weight,
            CompletedAt = DateTime.UtcNow,
            UserId = Context.UserIdentifier
        };

        await Clients.Group($"workout-{sessionId}")
            .SendAsync("SetCompleted", setData);
    }

    // Live workout progress updates
    public async Task UpdateWorkoutProgress(string sessionId, int completedSets, int totalSets)
    {
        var progressData = new
        {
            SessionId = sessionId,
            CompletedSets = completedSets,
            TotalSets = totalSets,
            PercentComplete = totalSets > 0 ? (completedSets * 100 / totalSets) : 0,
            UpdatedAt = DateTime.UtcNow
        };

        await Clients.Group($"workout-{sessionId}")
            .SendAsync("WorkoutProgressUpdated", progressData);
    }

    // Coach-athlete real-time communication
    public async Task SendCoachMessage(string athleteId, string message)
    {
        var messageData = new
        {
            FromUserId = Context.UserIdentifier,
            Message = message,
            SentAt = DateTime.UtcNow,
            Type = "coach-message"
        };

        await Clients.User(athleteId).SendAsync("CoachMessageReceived", messageData);
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("User {UserId} connected to WorkoutHub", Context.UserIdentifier);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("User {UserId} disconnected from WorkoutHub. Exception: {Exception}",
            Context.UserIdentifier, exception?.Message);
        await base.OnDisconnectedAsync(exception);
    }
}
