using PplCoach.Domain.Enums;

namespace PplCoach.Application.DTOs;

public class CreateSessionRequest
{
    public Guid UserId { get; set; }
    public DateOnly Date { get; set; }
    public DayType DayType { get; set; }
    public string? Notes { get; set; }
}

public class CreateSetLogRequest
{
    public Guid SessionId { get; set; }
    public Guid MovementId { get; set; }
    public int SetIndex { get; set; }
    public decimal WeightKg { get; set; }
    public int Reps { get; set; }
    public decimal? Rpe { get; set; }
    public string? Tempo { get; set; }
    public string? Notes { get; set; }
}

public class ShuffleMovementsRequest
{
    public List<int>? AvailableEquipment { get; set; }
    public int? Count { get; set; }
}
