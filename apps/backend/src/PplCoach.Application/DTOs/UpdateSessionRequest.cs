using PplCoach.Domain.Enums;

namespace PplCoach.Application.DTOs;

public class UpdateSessionRequest
{
    public DateOnly? Date { get; set; }
    public DayType? DayType { get; set; }
    public string? Notes { get; set; }
}
