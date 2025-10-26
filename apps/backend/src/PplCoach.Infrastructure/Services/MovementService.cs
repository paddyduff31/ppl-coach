using AutoMapper;
using Microsoft.EntityFrameworkCore;
using PplCoach.Application.Models;
using PplCoach.Application.Abstractions;
using PplCoach.Domain.Entities;
using PplCoach.Domain.Enums;
using PplCoach.Infrastructure.Data;

namespace PplCoach.Infrastructure.Services;

public class MovementService(PplCoachDbContext context, IMapper mapper, TimeProvider timeProvider)
    : IMovementService
{
    public async Task<List<MovementModel>> GetAllAsync()
    {
        var movements = await context.Movements
            .AsNoTracking()
            .ToListAsync();
        return mapper.Map<List<MovementModel>>(movements);
    }

    public async Task<List<MovementModel>> GetByEquipmentAsync(EquipmentType availableEquipment)
    {
        var movements = await context.Movements
            .AsNoTracking()
            .Where(m => (m.Requires & availableEquipment) == m.Requires)
            .ToListAsync();
        return mapper.Map<List<MovementModel>>(movements);
    }

    public async Task<MovementModel?> GetByIdAsync(Guid id)
    {
        var movement = await context.Movements.FindAsync(id);
        return movement != null ? mapper.Map<MovementModel>(movement) : null;
    }

    public async Task<List<MovementModel>> ShuffleMovementsAsync(ShuffleRequestModel request)
    {
        var availableEquipment = request.AvailableEquipment.Aggregate(EquipmentType.None, (current, eq) => current | eq);

        var query = context.Movements
            .Where(m => (m.Requires & availableEquipment) == m.Requires);

        query = request.DayType switch
        {
            DayType.Push => query.Where(m => m.MuscleGroup == MuscleGroup.Chest ||
                                           m.MuscleGroup == MuscleGroup.Shoulders ||
                                           m.MuscleGroup == MuscleGroup.Triceps),
            DayType.Pull => query.Where(m => m.MuscleGroup == MuscleGroup.Back ||
                                           m.MuscleGroup == MuscleGroup.Biceps ||
                                           m.MuscleGroup == MuscleGroup.RearDelts),
            DayType.Legs => query.Where(m => m.MuscleGroup == MuscleGroup.Quads ||
                                           m.MuscleGroup == MuscleGroup.Hamstrings ||
                                           m.MuscleGroup == MuscleGroup.Glutes ||
                                           m.MuscleGroup == MuscleGroup.Calves),
            _ => query
        };

        var cutoffDate = DateOnly.FromDateTime(timeProvider.GetUtcNow().DateTime.AddDays(-2));
        var recentMovements = await context.SetLogs
            .Include(sl => sl.Session)
            .Where(sl => sl.Session.UserId == request.UserId && sl.Session.Date >= cutoffDate)
            .Select(sl => sl.MovementId)
            .Distinct()
            .ToListAsync();

        var movements = await query.ToListAsync();

        var orderedMovements = movements
            .Where(m => !recentMovements.Contains(m.Id))
            .OrderBy(m => m.MovementPattern == MovementPattern.Push || m.MovementPattern == MovementPattern.Pull ? 0 : 1)
            .ThenBy(_ => Random.Shared.Next())
            .Take(6)
            .ToList();

        return mapper.Map<List<MovementModel>>(orderedMovements);
    }
}
