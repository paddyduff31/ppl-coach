using AutoMapper;
using Microsoft.EntityFrameworkCore;
using PplCoach.Application.DTOs;
using PplCoach.Application.Services;
using PplCoach.Domain.Entities;
using PplCoach.Infrastructure.Data;
using IUnitOfWork = PplCoach.Infrastructure.Repositories.IUnitOfWork;

namespace PplCoach.Infrastructure.Services;

public class SessionService : ISessionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly PplCoachDbContext _context;

    public SessionService(IUnitOfWork unitOfWork, IMapper mapper, PplCoachDbContext context)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _context = context;
    }

    public async Task<WorkoutSessionDto> CreateSessionAsync(CreateSessionDto dto)
    {
        var session = _mapper.Map<WorkoutSession>(dto);
        session.Id = Guid.NewGuid();

        await _unitOfWork.WorkoutSessions.AddAsync(session);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<WorkoutSessionDto>(session);
    }

    public async Task<WorkoutSessionDto?> GetSessionAsync(Guid sessionId)
    {
        var session = await _context.WorkoutSessions
            .Include(s => s.SetLogs)
            .ThenInclude(sl => sl.Movement)
            .FirstOrDefaultAsync(s => s.Id == sessionId);

        return session != null ? _mapper.Map<WorkoutSessionDto>(session) : null;
    }

    public async Task<List<WorkoutSessionDto>> GetUserSessionsAsync(Guid userId, DateOnly? startDate = null, DateOnly? endDate = null)
    {
        var query = _context.WorkoutSessions
            .Include(s => s.SetLogs)
            .ThenInclude(sl => sl.Movement)
            .Where(s => s.UserId == userId);

        if (startDate.HasValue)
            query = query.Where(s => s.Date >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(s => s.Date <= endDate.Value);

        var sessions = await query.OrderByDescending(s => s.Date).ToListAsync();
        return _mapper.Map<List<WorkoutSessionDto>>(sessions);
    }

    public async Task<SetLogDto> LogSetAsync(CreateSetLogDto dto)
    {
        var setLog = _mapper.Map<SetLog>(dto);
        setLog.Id = Guid.NewGuid();

        await _unitOfWork.SetLogs.AddAsync(setLog);
        await _unitOfWork.SaveChangesAsync();

        var setLogWithMovement = await _context.SetLogs
            .Include(sl => sl.Movement)
            .FirstAsync(sl => sl.Id == setLog.Id);

        return _mapper.Map<SetLogDto>(setLogWithMovement);
    }

    public async Task DeleteSetAsync(Guid setId)
    {
        var setLog = await _unitOfWork.SetLogs.GetByIdAsync(setId);
        if (setLog == null)
            throw new InvalidOperationException($"Set log with id {setId} not found");

        _unitOfWork.SetLogs.Remove(setLog);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<WorkoutSessionDto> UpdateSessionAsync(Guid sessionId, UpdateSessionRequest request)
    {
        var session = await _unitOfWork.WorkoutSessions.GetByIdAsync(sessionId);
        if (session == null)
            throw new InvalidOperationException($"Session with id {sessionId} not found");

        if (request.Date.HasValue)
            session.Date = request.Date.Value;
        if (request.DayType.HasValue)
            session.DayType = request.DayType.Value;
        if (request.Notes != null)
            session.Notes = request.Notes;

        _unitOfWork.WorkoutSessions.Update(session);
        await _unitOfWork.SaveChangesAsync();

        // Return updated session with all related data
        var updatedSession = await _context.WorkoutSessions
            .Include(s => s.SetLogs)
            .ThenInclude(sl => sl.Movement)
            .FirstAsync(s => s.Id == sessionId);

        return _mapper.Map<WorkoutSessionDto>(updatedSession);
    }
}