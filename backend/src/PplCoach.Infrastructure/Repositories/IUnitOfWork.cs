using PplCoach.Domain.Entities;

namespace PplCoach.Infrastructure.Repositories;

public interface IUnitOfWork : IDisposable
{
    IRepository<UserProfile> UserProfiles { get; }
    IRepository<EquipmentItem> EquipmentItems { get; }
    IRepository<Movement> Movements { get; }
    IRepository<WorkoutTemplate> WorkoutTemplates { get; }
    IRepository<WorkoutTemplateItem> WorkoutTemplateItems { get; }
    IRepository<WorkoutSession> WorkoutSessions { get; }
    IRepository<SetLog> SetLogs { get; }
    IRepository<BodyMetric> BodyMetrics { get; }

    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}