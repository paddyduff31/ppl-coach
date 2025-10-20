using PplCoach.Domain.Enums;

namespace PplCoach.Application.Models;

public record SessionModel(
    Guid Id,
    Guid UserId,
    DateOnly Date,
    DayType DayType,
    string? Notes,
    DateTime? StartTime,
    DateTime? EndTime,
    int? Duration,
    bool IsCompleted,
    decimal? TotalVolume,
    decimal? AverageRpe,
    List<SetLogModel> SetLogs
);

public class WorkoutSessionModel
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateOnly Date { get; set; }
    public DayType DayType { get; set; }
    public string? Notes { get; set; }
    public List<SetLogModel> SetLogs { get; set; } = new();
}

public class CreateSessionModel
{
    public Guid UserId { get; set; }
    public DateOnly Date { get; set; }
    public DayType DayType { get; set; }
    public string? Notes { get; set; }
}

public class SetLogModel
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
    public DateTime CreatedAt { get; set; }
    public string? MovementName { get; set; }
}

public class CreateSetLogModel
{
    public Guid SessionId { get; set; }
    public Guid MovementId { get; set; }
    public int SetIndex { get; set; }
    public decimal WeightKg { get; set; }
    public int Reps { get; set; }
    public decimal? RPE { get; set; }
    public string? Tempo { get; set; }
    public string? Notes { get; set; }
}
