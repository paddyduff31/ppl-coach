using PplCoach.Domain.Enums;

namespace PplCoach.Domain.Entities;

public class WorkoutSession
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateOnly Date { get; set; }
    public DayType DayType { get; set; }
    public string? Notes { get; set; }

    public UserProfile User { get; set; } = null!;
    public List<SetLog> SetLogs { get; set; } = new();
}