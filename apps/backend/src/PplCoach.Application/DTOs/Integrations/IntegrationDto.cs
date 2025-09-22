using PplCoach.Domain.Enums;

namespace PplCoach.Application.DTOs.Integrations;

public class IntegrationDto
{
    public Guid Id { get; set; }
    public IntegrationType Type { get; set; }
    public string ExternalUserId { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime ConnectedAt { get; set; }
    public DateTime? LastSyncAt { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
}

public class CreateIntegrationDto
{
    public IntegrationType Type { get; set; }
    public string AuthorizationCode { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string? RedirectUri { get; set; }
}

public class IntegrationSyncDto
{
    public Guid Id { get; set; }
    public SyncStatus Status { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int RecordsProcessed { get; set; }
    public int RecordsImported { get; set; }
    public int RecordsSkipped { get; set; }
    public string? ErrorMessage { get; set; }
}