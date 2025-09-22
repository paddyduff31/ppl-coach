using PplCoach.Domain.Enums;

namespace PplCoach.Domain.Entities;

public class ExternalWorkout
{
    public Guid Id { get; set; }
    public Guid IntegrationId { get; set; }
    public string ExternalId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public int? DurationMinutes { get; set; }
    public decimal? CaloriesBurned { get; set; }
    public decimal? DistanceMeters { get; set; }
    public string ActivityType { get; set; } = string.Empty;
    public bool IsImported { get; set; }
    public Guid? ImportedSessionId { get; set; }
    public DateTime CreatedAt { get; set; }
    public Dictionary<string, object> RawData { get; set; } = new();

    public ThirdPartyIntegration Integration { get; set; } = null!;
    public WorkoutSession? ImportedSession { get; set; }
}