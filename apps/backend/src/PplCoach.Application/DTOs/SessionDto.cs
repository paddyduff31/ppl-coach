using PplCoach.Domain.Enums;

namespace PplCoach.Application.DTOs;

public record SessionDto(
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
    List<SetLogDto> SetLogs
);

public class WorkoutSessionDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateOnly Date { get; set; }
    public DayType DayType { get; set; }
    public string? Notes { get; set; }
    public List<SetLogDto> SetLogs { get; set; } = new();
}

public class CreateSessionDto
{
    public Guid UserId { get; set; }
    public DateOnly Date { get; set; }
    public DayType DayType { get; set; }
    public string? Notes { get; set; }
}

public class SetLogDto
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

public class CreateSetLogDto
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
