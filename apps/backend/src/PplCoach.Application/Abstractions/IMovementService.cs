using PplCoach.Application.Models;
using PplCoach.Domain.Enums;

namespace PplCoach.Application.Abstractions;

public interface IMovementService
{
    Task<List<MovementModel>> GetAllAsync();
    Task<List<MovementModel>> GetByEquipmentAsync(EquipmentType availableEquipment);
    Task<MovementModel?> GetByIdAsync(Guid id);
    Task<List<MovementModel>> ShuffleMovementsAsync(ShuffleRequestModel request);
}
