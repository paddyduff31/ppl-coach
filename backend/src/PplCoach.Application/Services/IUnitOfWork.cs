using PplCoach.Domain.Entities;

namespace PplCoach.Application.Services;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> FindAsync(System.Linq.Expressions.Expression<Func<T, bool>> predicate);
    Task AddAsync(T entity);
    void Update(T entity);
    void Remove(T entity);
    IQueryable<T> GetQueryable();
}

public interface IUnitOfWork : IDisposable
{
    IRepository<WorkoutSession> WorkoutSessions { get; }
    IRepository<SetLog> SetLogs { get; }
    IRepository<Movement> Movements { get; }
    
    Task<int> SaveChangesAsync();
}
