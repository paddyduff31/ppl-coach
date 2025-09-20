using Microsoft.EntityFrameworkCore.Storage;
using PplCoach.Domain.Entities;
using PplCoach.Infrastructure.Data;

namespace PplCoach.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly PplCoachDbContext _context;
    private IDbContextTransaction? _transaction;
    private bool _disposed;

    private IRepository<UserProfile>? _userProfiles;
    private IRepository<EquipmentItem>? _equipmentItems;
    private IRepository<Movement>? _movements;
    private IRepository<WorkoutTemplate>? _workoutTemplates;
    private IRepository<WorkoutTemplateItem>? _workoutTemplateItems;
    private IRepository<WorkoutSession>? _workoutSessions;
    private IRepository<SetLog>? _setLogs;
    private IRepository<BodyMetric>? _bodyMetrics;

    public UnitOfWork(PplCoachDbContext context)
    {
        _context = context;
    }

    public IRepository<UserProfile> UserProfiles =>
        _userProfiles ??= new Repository<UserProfile>(_context);

    public IRepository<EquipmentItem> EquipmentItems =>
        _equipmentItems ??= new Repository<EquipmentItem>(_context);

    public IRepository<Movement> Movements =>
        _movements ??= new Repository<Movement>(_context);

    public IRepository<WorkoutTemplate> WorkoutTemplates =>
        _workoutTemplates ??= new Repository<WorkoutTemplate>(_context);

    public IRepository<WorkoutTemplateItem> WorkoutTemplateItems =>
        _workoutTemplateItems ??= new Repository<WorkoutTemplateItem>(_context);

    public IRepository<WorkoutSession> WorkoutSessions =>
        _workoutSessions ??= new Repository<WorkoutSession>(_context);

    public IRepository<SetLog> SetLogs =>
        _setLogs ??= new Repository<SetLog>(_context);

    public IRepository<BodyMetric> BodyMetrics =>
        _bodyMetrics ??= new Repository<BodyMetric>(_context);

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