using PplCoach.Domain.Enums;

namespace PplCoach.Application.DTOs.Integrations;

public class OAuthStateDto
{
    public Guid UserId { get; set; }
    public IntegrationType IntegrationType { get; set; }
    public string State { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public string? RedirectUrl { get; set; }
}