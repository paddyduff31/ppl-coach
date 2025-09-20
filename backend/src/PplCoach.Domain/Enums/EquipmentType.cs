namespace PplCoach.Domain.Enums;

[Flags]
public enum EquipmentType
{
    None = 0,
    Dumbbell = 1,
    Bench = 2,
    Band = 4,
    Cable = 8,
    Machine = 16,
    Barbell = 32,
    Kettlebell = 64,
    Bodyweight = 128
}