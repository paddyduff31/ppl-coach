using PplCoach.Domain.Enums;

namespace PplCoach.Domain.Entities;

public class IntegrationSyncLog
{
    public Guid Id { get; set; }
    public Guid IntegrationId { get; set; }
    public SyncStatus Status { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int RecordsProcessed { get; set; }
    public int RecordsImported { get; set; }
    public int RecordsSkipped { get; set; }
    public string? ErrorMessage { get; set; }
    public string? SyncCursor { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();

    public ThirdPartyIntegration Integration { get; set; } = null!;
}