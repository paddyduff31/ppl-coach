using AutoMapper;
using Microsoft.EntityFrameworkCore;
using PplCoach.Application.Abstractions;
using PplCoach.Application.Models;
using PplCoach.Domain.Entities;
using PplCoach.Domain.Repositories;

namespace PplCoach.Infrastructure.Services;

public class SessionService : ISessionService
{
    private readonly IUnitOfWork unitOfWork;
    private readonly IMapper mapper;

    public SessionService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        this.unitOfWork = unitOfWork;
        this.mapper = mapper;
    }

    public async Task<WorkoutSessionModel> CreateSessionAsync(CreateSessionModel dto)
    {
        var session = mapper.Map<WorkoutSession>(dto);
        session.Id = Guid.NewGuid();

        await unitOfWork.WorkoutSessions.AddAsync(session);
        await unitOfWork.SaveChangesAsync();

        return mapper.Map<WorkoutSessionModel>(session);
    }

    public async Task<WorkoutSessionModel?> GetSessionAsync(Guid sessionId)
    {
        var session = await unitOfWork.WorkoutSessions.GetByIdAsync(sessionId);
        return session == null ? null : mapper.Map<WorkoutSessionModel>(session);
    }

    public async Task<WorkoutSessionModel> UpdateSessionAsync(Guid sessionId, CreateSessionModel request)
    {
        var session = await unitOfWork.WorkoutSessions.GetByIdAsync(sessionId);
        if (session == null)
            throw new KeyNotFoundException($"Session with ID {sessionId} not found");

        mapper.Map(request, session);
        unitOfWork.WorkoutSessions.Update(session);
        await unitOfWork.SaveChangesAsync();

        return mapper.Map<WorkoutSessionModel>(session);
    }

    public async Task<List<WorkoutSessionModel>> GetUserSessionsAsync(Guid userId, DateOnly? startDate = null, DateOnly? endDate = null)
    {
        var query = unitOfWork.WorkoutSessions.GetQueryable()
            .Where(s => s.UserId == userId);

        if (startDate.HasValue)
            query = query.Where(s => s.Date >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(s => s.Date <= endDate.Value);

        var sessions = await query
            .Include(s => s.SetLogs)
            .ThenInclude(sl => sl.Movement)
            .ToListAsync();

        return mapper.Map<List<WorkoutSessionModel>>(sessions);
    }

    public async Task<object> GetUserSessionStatsAsync(Guid userId)
    {
        var sessions = await unitOfWork.WorkoutSessions.GetQueryable()
            .Include(s => s.SetLogs)
            .Where(s => s.UserId == userId)
            .ToListAsync();

        var now = DateTime.UtcNow;
        var oneWeekAgo = DateOnly.FromDateTime(now.AddDays(-7));
        var thisWeekSessions = sessions.Count(s => s.Date >= oneWeekAgo);

        var totalVolume = sessions.Sum(s => s.TotalVolume);
        var workoutStreak = CalculateWorkoutStreak(sessions);

        return new
        {
            totalSessions = sessions.Count,
            thisWeekSessions,
            totalVolume,
            workoutStreak
        };
    }

    public async Task<SetLogModel> LogSetAsync(CreateSetLogModel dto)
    {
        var setLog = mapper.Map<SetLog>(dto);
        setLog.Id = Guid.NewGuid();

        await unitOfWork.SetLogs.AddAsync(setLog);
        await unitOfWork.SaveChangesAsync();

        // Load with movement name
        var setLogWithMovement = await unitOfWork.SetLogs.GetQueryable()
            .Include(sl => sl.Movement)
            .FirstAsync(sl => sl.Id == setLog.Id);

        return mapper.Map<SetLogModel>(setLogWithMovement);
    }

    public async Task DeleteSetAsync(Guid setId)
    {
        var setLog = await unitOfWork.SetLogs.GetByIdAsync(setId);
        if (setLog == null)
            throw new KeyNotFoundException($"Set log with ID {setId} not found");

        unitOfWork.SetLogs.Remove(setLog);
        await unitOfWork.SaveChangesAsync();
    }

    private int CalculateWorkoutStreak(List<WorkoutSession> sessions)
    {
        if (!sessions.Any()) return 0;

        var orderedSessions = sessions
            .OrderByDescending(s => s.Date)
            .ToList();

        var streak = 0;
        var currentDate = DateOnly.FromDateTime(DateTime.UtcNow);

        foreach (var session in orderedSessions)
        {
            var daysDiff = currentDate.DayNumber - session.Date.DayNumber;

            if (daysDiff <= 1) // Today or yesterday
            {
                streak++;
                currentDate = session.Date;
            }
            else if (daysDiff > 2) // Gap in workouts
            {
                break;
            }
        }

        return streak;
    }
}
