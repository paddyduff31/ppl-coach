namespace PplCoach.Domain.Entities;

public class WorkoutTemplateItem
{
    public Guid Id { get; set; }
    public Guid WorkoutTemplateId { get; set; }
    public Guid MovementId { get; set; }
    public int DefaultSets { get; set; }
    public int RepsLow { get; set; }
    public int RepsHigh { get; set; }
    public string? Notes { get; set; }

    public WorkoutTemplate WorkoutTemplate { get; set; } = null!;
    public Movement Movement { get; set; } = null!;
}