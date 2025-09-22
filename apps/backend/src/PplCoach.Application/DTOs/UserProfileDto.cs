using PplCoach.Domain.Enums;

namespace PplCoach.Application.DTOs;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public decimal? BodyweightKg { get; set; }
    public decimal? HeightCm { get; set; }
    public Sex? Sex { get; set; }
    public DateOnly? Birthday { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateUserProfileDto
{
    public string DisplayName { get; set; } = string.Empty;
    public decimal? BodyweightKg { get; set; }
    public decimal? HeightCm { get; set; }
    public Sex? Sex { get; set; }
    public DateOnly? Birthday { get; set; }
}