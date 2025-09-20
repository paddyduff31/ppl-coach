using PplCoach.Domain.Enums;

namespace PplCoach.Domain.Entities;

public class Movement
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public MuscleGroup MuscleGroup { get; set; }
    public MovementPattern MovementPattern { get; set; }
    public bool Unilateral { get; set; }
    public EquipmentType Requires { get; set; }
}