using Microsoft.EntityFrameworkCore.Storage;
using PplCoach.Domain.Repositories;
using PplCoach.Domain.Entities;
using PplCoach.Infrastructure.Data;

namespace PplCoach.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly PplCoachDbContext _context;
    private IDbContextTransaction? _transaction;
    private bool _disposed;

    private IRepository<UserProfile>? _userProfiles;
    private IRepository<Movement>? _movements;
    private IRepository<WorkoutSession>? _workoutSessions;
    private IRepository<SetLog>? _setLogs;

    public UnitOfWork(PplCoachDbContext context)
    {
        _context = context;
    }

    public IRepository<UserProfile> UserProfiles =>
        _userProfiles ??= new Repository<UserProfile>(_context);

    public IRepository<Movement> Movements =>
        _movements ??= new Repository<Movement>(_context);

    public IRepository<WorkoutSession> WorkoutSessions =>
        _workoutSessions ??= new Repository<WorkoutSession>(_context);

    public IRepository<SetLog> SetLogs =>
        _setLogs ??= new Repository<SetLog>(_context);


    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed && disposing)
        {
            _transaction?.Dispose();
            _context.Dispose();
        }
        _disposed = true;
    }
}
