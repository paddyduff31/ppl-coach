using PplCoach.Domain.Enums;

namespace PplCoach.Domain.Entities;

public class ThirdPartyIntegration
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public IntegrationType Type { get; set; }
    public string ExternalUserId { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public string? RefreshToken { get; set; }
    public DateTime? TokenExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime ConnectedAt { get; set; }
    public DateTime? LastSyncAt { get; set; }
    public string? SyncCursor { get; set; } // For pagination/incremental sync
    public Dictionary<string, object> Metadata { get; set; } = new();

    public UserProfile User { get; set; } = null!;
    public List<IntegrationSyncLog> SyncLogs { get; set; } = new();
}