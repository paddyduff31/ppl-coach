using PplCoach.Application.DTOs;
using PplCoach.Domain.Entities;
using PplCoach.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace PplCoach.Application.Services;

public class SessionService : ISessionService
{
    private readonly IUnitOfWork _unitOfWork;

    public SessionService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<WorkoutSessionDto>> GetUserSessionsAsync(Guid userId, DateOnly? startDate = null, DateOnly? endDate = null)
    {
        var query = _unitOfWork.WorkoutSessions
            .GetQueryable()
            .Include(s => s.SetLogs)
                .ThenInclude(sl => sl.Movement)
            .Where(s => s.UserId == userId);

        if (startDate.HasValue)
            query = query.Where(s => s.Date >= startDate.Value);
        
        if (endDate.HasValue)
            query = query.Where(s => s.Date <= endDate.Value);

        var sessions = await query
            .OrderByDescending(s => s.Date)
            .ToListAsync();
        
        return sessions.Select(MapToWorkoutSessionDto).ToList();
    }

    public async Task<WorkoutSessionDto?> GetSessionAsync(Guid sessionId)
    {
        var session = await _unitOfWork.WorkoutSessions
            .GetQueryable()
            .Include(s => s.SetLogs)
                .ThenInclude(sl => sl.Movement)
            .FirstOrDefaultAsync(s => s.Id == sessionId);
        
        return session != null ? MapToWorkoutSessionDto(session) : null;
    }

    public async Task<WorkoutSessionDto> CreateSessionAsync(CreateSessionDto request)
    {
        var session = new WorkoutSession
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Date = request.Date,
            DayType = request.DayType,
            Notes = request.Notes,
            StartTime = DateTime.UtcNow,
            IsCompleted = false
        };

        await _unitOfWork.WorkoutSessions.AddAsync(session);
        await _unitOfWork.SaveChangesAsync();
        
        return MapToWorkoutSessionDto(session);
    }

    public async Task<WorkoutSessionDto> UpdateSessionAsync(Guid sessionId, UpdateSessionRequest request)
    {
        var session = await _unitOfWork.WorkoutSessions.GetByIdAsync(sessionId);
        if (session == null) throw new InvalidOperationException("Session not found");

        if (request.Date.HasValue) session.Date = request.Date.Value;
        if (request.DayType.HasValue) session.DayType = request.DayType.Value;
        if (request.Notes != null) session.Notes = request.Notes;

        _unitOfWork.WorkoutSessions.Update(session);
        await _unitOfWork.SaveChangesAsync();
        
        return MapToWorkoutSessionDto(session);
    }

    public async Task DeleteSessionAsync(Guid sessionId)
    {
        var session = await _unitOfWork.WorkoutSessions.GetByIdAsync(sessionId);
        if (session != null)
        {
            _unitOfWork.WorkoutSessions.Remove(session);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    public async Task<SetLogDto> LogSetAsync(CreateSetLogDto request)
    {
        var setLog = new SetLog
        {
            Id = Guid.NewGuid(),
            SessionId = request.SessionId,
            MovementId = request.MovementId,
            SetIndex = request.SetIndex,
            WeightKg = request.WeightKg,
            Reps = request.Reps,
            RPE = request.RPE,
            Tempo = request.Tempo,
            Notes = request.Notes
        };

        await _unitOfWork.SetLogs.AddAsync(setLog);
        await _unitOfWork.SaveChangesAsync();
        
        // Get the movement name for the DTO
        var movement = await _unitOfWork.Movements.GetByIdAsync(request.MovementId);
        var createdAt = DateTime.UtcNow;
        
        return new SetLogDto(
            setLog.Id,
            setLog.SessionId,
            setLog.MovementId,
            setLog.SetIndex,
            setLog.WeightKg,
            setLog.Reps,
            setLog.RPE,
            setLog.Tempo,
            setLog.Notes,
            createdAt,
            movement?.Name
        );
    }

    public async Task DeleteSetAsync(Guid setId)
    {
        var setLog = await _unitOfWork.SetLogs.GetByIdAsync(setId);
        if (setLog != null)
        {
            _unitOfWork.SetLogs.Remove(setLog);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    private WorkoutSessionDto MapToWorkoutSessionDto(WorkoutSession session)
    {
        return new WorkoutSessionDto
        {
            Id = session.Id,
            UserId = session.UserId,
            Date = session.Date,
            DayType = session.DayType,
            Notes = session.Notes,
            SetLogs = session.SetLogs.Select(s => new SetLogDto(
                s.Id,
                s.SessionId,
                s.MovementId,
                s.SetIndex,
                s.WeightKg,
                s.Reps,
                s.RPE,
                s.Tempo,
                s.Notes,
                DateTime.UtcNow, // Use current time since CreatedAt doesn't exist on the entity
                s.Movement?.Name
            )).ToList()
        };
    }
}
