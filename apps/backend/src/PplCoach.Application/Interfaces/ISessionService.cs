using PplCoach.Application.Models;

namespace PplCoach.Application.Abstractions;

public interface ISessionService
{
    Task<WorkoutSessionModel> CreateSessionAsync(CreateSessionModel dto);
    Task<WorkoutSessionModel?> GetSessionAsync(Guid sessionId);
    Task<WorkoutSessionModel> UpdateSessionAsync(Guid sessionId, CreateSessionModel request);
    Task<List<WorkoutSessionModel>> GetUserSessionsAsync(Guid userId, DateOnly? startDate = null, DateOnly? endDate = null);
    Task<object> GetUserSessionStatsAsync(Guid userId); // TODO: Replace with proper stats model
    Task<SetLogModel> LogSetAsync(CreateSetLogModel dto);
    Task DeleteSetAsync(Guid setId);
}
