using PplCoach.Domain.Entities;

namespace PplCoach.Domain.Repositories;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> FindAsync(System.Linq.Expressions.Expression<Func<T, bool>> predicate);
    Task<T?> FirstOrDefaultAsync(System.Linq.Expressions.Expression<Func<T, bool>> predicate);
    Task AddAsync(T entity);
    void Update(T entity);
    void Remove(T entity);
    IQueryable<T> GetQueryable();
}

public interface IUnitOfWork : IDisposable
{
    IRepository<UserProfile> UserProfiles { get; }
    IRepository<Movement> Movements { get; }
    IRepository<WorkoutSession> WorkoutSessions { get; }
    IRepository<SetLog> SetLogs { get; }

    Task<int> SaveChangesAsync();
}
