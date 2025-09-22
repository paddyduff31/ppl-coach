using PplCoach.Application.DTOs;
using PplCoach.Domain.Enums;

namespace PplCoach.Application.Services;

public interface IMovementService
{
    Task<List<MovementDto>> GetAllAsync();
    Task<List<MovementDto>> GetByEquipmentAsync(EquipmentType availableEquipment);
    Task<MovementDto?> GetByIdAsync(Guid id);
    Task<List<MovementDto>> ShuffleMovementsAsync(ShuffleRequestDto request);
}