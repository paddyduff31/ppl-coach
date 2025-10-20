using PplCoach.Domain.Enums;

namespace PplCoach.Application.Models;

public class MovementModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public MuscleGroup MuscleGroup { get; set; }
    public MovementPattern MovementPattern { get; set; }
    public bool Unilateral { get; set; }
    public EquipmentType Requires { get; set; }
}

public class ShuffleRequestModel
{
    public DayType DayType { get; set; }
    public Guid UserId { get; set; }
    public List<EquipmentType> AvailableEquipment { get; set; } = new();
}
