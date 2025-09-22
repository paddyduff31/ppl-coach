using AutoMapper;
using Microsoft.EntityFrameworkCore;
using PplCoach.Application.DTOs;
using PplCoach.Application.Services;
using PplCoach.Domain.Entities;
using PplCoach.Domain.Enums;
using PplCoach.Domain.Repositories;
using PplCoach.Infrastructure.Data;

namespace PplCoach.Infrastructure.Services;

public class MovementService : IMovementService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly PplCoachDbContext _context;

    public MovementService(IUnitOfWork unitOfWork, IMapper mapper, PplCoachDbContext context)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _context = context;
    }

    public async Task<List<MovementDto>> GetAllAsync()
    {
        var movements = await _unitOfWork.Movements.GetAllAsync();
        return _mapper.Map<List<MovementDto>>(movements);
    }

    public async Task<List<MovementDto>> GetByEquipmentAsync(EquipmentType availableEquipment)
    {
        var movements = await _unitOfWork.Movements
            .FindAsync(m => (m.Requires & availableEquipment) == m.Requires);
        return _mapper.Map<List<MovementDto>>(movements);
    }

    public async Task<MovementDto?> GetByIdAsync(Guid id)
    {
        var movement = await _unitOfWork.Movements.GetByIdAsync(id);
        return movement != null ? _mapper.Map<MovementDto>(movement) : null;
    }

    public async Task<List<MovementDto>> ShuffleMovementsAsync(ShuffleRequestDto request)
    {
        var availableEquipment = request.AvailableEquipment.Aggregate(EquipmentType.None, (current, eq) => current | eq);

        var query = _context.Movements
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

        var cutoffDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-2));
        var recentMovements = await _context.SetLogs
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

        return _mapper.Map<List<MovementDto>>(orderedMovements);
    }
}
