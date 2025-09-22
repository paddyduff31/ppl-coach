using PplCoach.Application.DTOs;

namespace PplCoach.Application.Services;

public interface ISessionService
{
    Task<WorkoutSessionDto> CreateSessionAsync(CreateSessionDto dto);
    Task<WorkoutSessionDto?> GetSessionAsync(Guid sessionId);
    Task<WorkoutSessionDto> UpdateSessionAsync(Guid sessionId, CreateSessionDto request);
    Task<List<WorkoutSessionDto>> GetUserSessionsAsync(Guid userId, DateOnly? startDate = null, DateOnly? endDate = null);
    Task<object> GetUserSessionStatsAsync(Guid userId); // TODO: Replace with proper stats DTO
    Task<SetLogDto> LogSetAsync(CreateSetLogDto dto);
    Task DeleteSetAsync(Guid setId);
}
