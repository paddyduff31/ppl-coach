using PplCoach.Domain.Enums;

namespace PplCoach.Domain.Entities;

public class BodyMetric
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateOnly Date { get; set; }
    public MetricType MetricType { get; set; }
    public decimal Value { get; set; }

    public UserProfile User { get; set; } = null!;
}