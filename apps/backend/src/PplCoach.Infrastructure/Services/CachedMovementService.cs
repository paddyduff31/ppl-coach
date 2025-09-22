using Microsoft.Extensions.Caching.Memory;
using PplCoach.Domain.Entities;
using PplCoach.Domain.Repositories;

namespace PplCoach.Infrastructure.Services;

public class CachedMovementService : IMovementService
{
    private readonly IMovementService _baseService;
    private readonly IMemoryCache _cache;
    private readonly ILogger<CachedMovementService> _logger;
    private readonly TimeSpan _cacheExpiry = TimeSpan.FromHours(1);

    public CachedMovementService(
        IMovementService baseService,
        IMemoryCache cache,
        ILogger<CachedMovementService> logger)
    {
        _baseService = baseService;
        _cache = cache;
        _logger = logger;
    }

    public async Task<IEnumerable<Movement>> GetAllMovementsAsync()
    {
        const string cacheKey = "all_movements";

        if (_cache.TryGetValue(cacheKey, out IEnumerable<Movement>? cachedMovements))
        {
            _logger.LogDebug("Returning cached movements");
            return cachedMovements!;
        }

        var movements = await _baseService.GetAllMovementsAsync();

        _cache.Set(cacheKey, movements, _cacheExpiry);
        _logger.LogDebug("Cached {Count} movements for {Expiry}",
            movements.Count(), _cacheExpiry);

        return movements;
    }

    public async Task<IEnumerable<Movement>> GetMovementsByMuscleGroupAsync(string muscleGroup)
    {
        var cacheKey = $"movements_muscle_{muscleGroup}";

        if (_cache.TryGetValue(cacheKey, out IEnumerable<Movement>? cachedMovements))
        {
            return cachedMovements!;
        }

        var movements = await _baseService.GetMovementsByMuscleGroupAsync(muscleGroup);
        _cache.Set(cacheKey, movements, _cacheExpiry);

        return movements;
    }

    public async Task<Movement?> GetMovementByIdAsync(int id)
    {
        var cacheKey = $"movement_{id}";

        if (_cache.TryGetValue(cacheKey, out Movement? cachedMovement))
        {
            return cachedMovement;
        }

        var movement = await _baseService.GetMovementByIdAsync(id);
        if (movement != null)
        {
            _cache.Set(cacheKey, movement, _cacheExpiry);
        }

        return movement;
    }

    public async Task<Movement> CreateMovementAsync(Movement movement)
    {
        var result = await _baseService.CreateMovementAsync(movement);

        // Invalidate relevant caches
        _cache.Remove("all_movements");
        _cache.Remove($"movements_muscle_{movement.PrimaryMuscleGroup}");
        if (!string.IsNullOrEmpty(movement.SecondaryMuscleGroup))
        {
            _cache.Remove($"movements_muscle_{movement.SecondaryMuscleGroup}");
        }

        return result;
    }

    public async Task<Movement> UpdateMovementAsync(Movement movement)
    {
        var result = await _baseService.UpdateMovementAsync(movement);

        // Invalidate caches
        _cache.Remove("all_movements");
        _cache.Remove($"movement_{movement.Id}");
        _cache.Remove($"movements_muscle_{movement.PrimaryMuscleGroup}");
        if (!string.IsNullOrEmpty(movement.SecondaryMuscleGroup))
        {
            _cache.Remove($"movements_muscle_{movement.SecondaryMuscleGroup}");
        }

        return result;
    }

    public async Task DeleteMovementAsync(int id)
    {
        // Get movement first to know which caches to invalidate
        var movement = await GetMovementByIdAsync(id);

        await _baseService.DeleteMovementAsync(id);

        // Invalidate caches
        _cache.Remove("all_movements");
        _cache.Remove($"movement_{id}");
        if (movement != null)
        {
            _cache.Remove($"movements_muscle_{movement.PrimaryMuscleGroup}");
            if (!string.IsNullOrEmpty(movement.SecondaryMuscleGroup))
            {
                _cache.Remove($"movements_muscle_{movement.SecondaryMuscleGroup}");
            }
        }
    }
}
