using PplCoach.Domain.Enums;

namespace PplCoach.Domain.Entities;

public class EquipmentItem
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public EquipmentType Type { get; set; }
    public decimal? MaxLoadKg { get; set; }
}