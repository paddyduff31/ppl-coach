using PplCoach.Application.DTOs;
using PplCoach.Domain.Entities;
using PplCoach.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace PplCoach.Application.Services;

public interface ISessionService
{
    Task<List<SessionDto>> GetUserSessionsAsync(Guid userId);
    Task<SessionDto?> GetSessionByIdAsync(Guid sessionId);
    Task<Guid> CreateSessionAsync(CreateSessionRequest request);
    Task UpdateSessionAsync(Guid sessionId, UpdateSessionRequest request);
    Task DeleteSessionAsync(Guid sessionId);
    Task<Guid> LogSetAsync(CreateSetLogRequest request);
    Task DeleteSetAsync(Guid setId);
    Task CompleteSessionAsync(Guid sessionId);
    Task<List<MovementDto>> ShuffleMovementsAsync(ShuffleMovementsRequest request);
}

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
                .ThenInclude(sl => sl.Movement)
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.Date)
            .ToListAsync();
        
        return sessions.Select(MapToDto).ToList();
    }

    public async Task<SessionDto?> GetSessionByIdAsync(Guid sessionId)
    {
        var session = await _unitOfWork.WorkoutSessions
            .GetQueryable()
            .Include(s => s.SetLogs)
                .ThenInclude(sl => sl.Movement)
            .FirstOrDefaultAsync(s => s.Id == sessionId);
        
        return session != null ? MapToDto(session) : null;
    }

    public async Task<Guid> CreateSessionAsync(CreateSessionRequest request)
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
        return session.Id;
    }

    public async Task UpdateSessionAsync(Guid sessionId, UpdateSessionRequest request)
    {
        var session = await _unitOfWork.WorkoutSessions.GetByIdAsync(sessionId);
        if (session == null) throw new InvalidOperationException("Session not found");

        if (request.Notes != null) session.Notes = request.Notes;
        if (request.StartTime.HasValue) session.StartTime = request.StartTime;
        if (request.EndTime.HasValue) session.EndTime = request.EndTime;
        if (request.Duration.HasValue) session.Duration = request.Duration;
        if (request.IsCompleted.HasValue) session.IsCompleted = request.IsCompleted.Value;

        _unitOfWork.WorkoutSessions.Update(session);
        await _unitOfWork.SaveChangesAsync();
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

    public async Task<Guid> LogSetAsync(CreateSetLogRequest request)
    {
        var setLog = new SetLog
        {
            Id = Guid.NewGuid(),
            SessionId = request.SessionId,
            MovementId = request.MovementId,
            SetIndex = request.SetIndex,
            WeightKg = request.WeightKg,
            Reps = request.Reps,
            RPE = request.Rpe,
            Tempo = request.Tempo,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.SetLogs.AddAsync(setLog);
        await _unitOfWork.SaveChangesAsync();
        return setLog.Id;
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

    public async Task CompleteSessionAsync(Guid sessionId)
    {
        var session = await _unitOfWork.WorkoutSessions.GetByIdAsync(sessionId);
        if (session == null) throw new InvalidOperationException("Session not found");

        session.IsCompleted = true;
        session.EndTime = DateTime.UtcNow;
        
        if (session.StartTime.HasValue && session.EndTime.HasValue)
        {
            session.Duration = (int)(session.EndTime.Value - session.StartTime.Value).TotalMinutes;
        }

        _unitOfWork.WorkoutSessions.Update(session);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<List<MovementDto>> ShuffleMovementsAsync(ShuffleMovementsRequest request)
    {
        var availableMovements = await _unitOfWork.Movements
            .GetQueryable()
            .Where(m => request.AvailableEquipment == null || 
                       request.AvailableEquipment.Any(eq => ((int)m.EquipmentType & eq) != 0))
            .ToListAsync();

        // Shuffle and take requested count
        var random = new Random();
        var shuffled = availableMovements
            .OrderBy(x => random.Next())
            .Take(request.Count ?? 6)
            .ToList();

        return shuffled.Select(m => new MovementDto(
            m.Id,
            m.Name,
            m.MuscleGroups?.ToList() ?? new List<string>(),
            m.IsCompound,
            m.Instructions,
            m.ImageUrl
        )).ToList();
    }

    private SessionDto MapToDto(WorkoutSession session)
    {
        return new SessionDto(
            session.Id,
            session.UserId,
            session.Date,
            session.DayType,
            session.Notes,
            session.StartTime,
            session.EndTime,
            session.Duration,
            session.IsCompleted,
            session.TotalVolume,
            session.AverageRpe,
            session.SetLogs.Select(s => new SetLogDto(
                s.Id,
                s.SessionId,
                s.MovementId,
                s.SetIndex,
                s.WeightKg,
                s.Reps,
                s.RPE,
                s.Tempo,
                s.Notes,
                s.CreatedAt,
                s.Movement?.Name
            )).ToList()
        );
    }
}
