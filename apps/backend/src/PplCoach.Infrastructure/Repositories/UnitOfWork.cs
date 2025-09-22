using Microsoft.EntityFrameworkCore.Storage;
using PplCoach.Domain.Repositories;
using PplCoach.Domain.Entities;
using PplCoach.Infrastructure.Data;

namespace PplCoach.Infrastructure.Repositories;

public class UnitOfWork(PplCoachDbContext context) : IUnitOfWork
{
    private IDbContextTransaction? _transaction;
    private bool _disposed;

    private IRepository<UserProfile>? _userProfiles;
    private IRepository<Movement>? _movements;
    private IRepository<WorkoutSession>? _workoutSessions;
    private IRepository<SetLog>? _setLogs;
    private IRepository<ThirdPartyIntegration>? _thirdPartyIntegrations;
    private IRepository<IntegrationSyncLog>? _integrationSyncLogs;
    private IRepository<ExternalWorkout>? _externalWorkouts;

    public IRepository<UserProfile> UserProfiles =>
        _userProfiles ??= new Repository<UserProfile>(context);

    public IRepository<Movement> Movements =>
        _movements ??= new Repository<Movement>(context);

    public IRepository<WorkoutSession> WorkoutSessions =>
        _workoutSessions ??= new Repository<WorkoutSession>(context);

    public IRepository<SetLog> SetLogs =>
        _setLogs ??= new Repository<SetLog>(context);

    public IRepository<ThirdPartyIntegration> ThirdPartyIntegrations =>
        _thirdPartyIntegrations ??= new Repository<ThirdPartyIntegration>(context);

    public IRepository<IntegrationSyncLog> IntegrationSyncLogs =>
        _integrationSyncLogs ??= new Repository<IntegrationSyncLog>(context);

    public IRepository<ExternalWorkout> ExternalWorkouts =>
        _externalWorkouts ??= new Repository<ExternalWorkout>(context);


    public async Task<int> SaveChangesAsync()
    {
        return await context.SaveChangesAsync();
    }

    public async Task BeginTransactionAsync()
    {
        _transaction = await context.Database.BeginTransactionAsync();
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
            context.Dispose();
        }
        _disposed = true;
    }
}
