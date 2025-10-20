using PplCoach.Domain.Enums;

namespace PplCoach.Application.Models.Integrations;

public class OAuthStateModel
{
    public Guid UserId { get; set; }
    public IntegrationType IntegrationType { get; set; }
    public string State { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public string? RedirectUrl { get; set; }
}
