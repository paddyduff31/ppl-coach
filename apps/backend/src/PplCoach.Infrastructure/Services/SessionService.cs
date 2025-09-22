using AutoMapper;
using Microsoft.EntityFrameworkCore;
using PplCoach.Application.DTOs;
using PplCoach.Application.Services;
using PplCoach.Domain.Entities;
using PplCoach.Domain.Repositories;
using PplCoach.Infrastructure.Data;

namespace PplCoach.Infrastructure.Services;

public class SessionService(IUnitOfWork unitOfWork, IMapper mapper, PplCoachDbContext context)
    : ISessionService
{
    public async Task<WorkoutSessionDto> CreateSessionAsync(CreateSessionDto dto)
    {
        var session = mapper.Map<WorkoutSession>(dto);
        session.Id = Guid.NewGuid();

        await unitOfWork.WorkoutSessions.AddAsync(session);
        await unitOfWork.SaveChangesAsync();

        return mapper.Map<WorkoutSessionDto>(session);
    }

    public async Task<WorkoutSessionDto?> GetSessionAsync(Guid sessionId)
    {
        var session = await context.WorkoutSessions
            .Include(s => s.SetLogs)
            .ThenInclude(sl => sl.Movement)
            .FirstOrDefaultAsync(s => s.Id == sessionId);

        return session != null ? mapper.Map<WorkoutSessionDto>(session) : null;
    }

    public async Task<List<WorkoutSessionDto>> GetUserSessionsAsync(Guid userId, DateOnly? startDate = null, DateOnly? endDate = null)
    {
        var query = context.WorkoutSessions
            .Include(s => s.SetLogs)
            .ThenInclude(sl => sl.Movement)
            .Where(s => s.UserId == userId);

        if (startDate.HasValue)
            query = query.Where(s => s.Date >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(s => s.Date <= endDate.Value);

        var sessions = await query.OrderByDescending(s => s.Date).ToListAsync();
        return mapper.Map<List<WorkoutSessionDto>>(sessions);
    }

    public async Task<SetLogDto> LogSetAsync(CreateSetLogDto dto)
    {
        var setLog = mapper.Map<SetLog>(dto);
        setLog.Id = Guid.NewGuid();

        await unitOfWork.SetLogs.AddAsync(setLog);
        await unitOfWork.SaveChangesAsync();

        var setLogWithMovement = await context.SetLogs
            .Include(sl => sl.Movement)
            .FirstAsync(sl => sl.Id == setLog.Id);

        return mapper.Map<SetLogDto>(setLogWithMovement);
    }

    public async Task DeleteSetAsync(Guid setId)
    {
        var setLog = await unitOfWork.SetLogs.GetByIdAsync(setId);
        if (setLog == null)
            throw new InvalidOperationException($"Set log with id {setId} not found");

        unitOfWork.SetLogs.Remove(setLog);
        await unitOfWork.SaveChangesAsync();
    }

    public async Task<WorkoutSessionDto> UpdateSessionAsync(Guid sessionId, UpdateSessionRequest request)
    {
        var session = await unitOfWork.WorkoutSessions.GetByIdAsync(sessionId);
        if (session == null)
            throw new InvalidOperationException($"Session with id {sessionId} not found");

        if (request.Date.HasValue)
            session.Date = request.Date.Value;
        if (request.DayType.HasValue)
            session.DayType = request.DayType.Value;
        if (request.Notes != null)
            session.Notes = request.Notes;

        unitOfWork.WorkoutSessions.Update(session);
        await unitOfWork.SaveChangesAsync();

        // Return updated session with all related data
        var updatedSession = await context.WorkoutSessions
            .Include(s => s.SetLogs)
            .ThenInclude(sl => sl.Movement)
            .FirstAsync(s => s.Id == sessionId);

        return mapper.Map<WorkoutSessionDto>(updatedSession);
    }
}
