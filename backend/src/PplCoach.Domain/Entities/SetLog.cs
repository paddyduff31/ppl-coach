namespace PplCoach.Domain.Entities;

public class SetLog
{
    public Guid Id { get; set; }
    public Guid SessionId { get; set; }
    public Guid MovementId { get; set; }
    public int SetIndex { get; set; }
    public decimal WeightKg { get; set; }
    public int Reps { get; set; }
    public decimal? RPE { get; set; }
    public string? Tempo { get; set; }
    public string? Notes { get; set; }

    public WorkoutSession Session { get; set; } = null!;
    public Movement Movement { get; set; } = null!;
}