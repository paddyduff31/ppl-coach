using PplCoach.Application.DTOs;

namespace PplCoach.Application.Services;

public interface ISessionService
{
    Task<WorkoutSessionDto> CreateSessionAsync(CreateSessionDto dto);
    Task<WorkoutSessionDto?> GetSessionAsync(Guid sessionId);
    Task<List<WorkoutSessionDto>> GetUserSessionsAsync(Guid userId, DateOnly? startDate = null, DateOnly? endDate = null);
    Task<SetLogDto> LogSetAsync(CreateSetLogDto dto);
    Task DeleteSetAsync(Guid setId);
}