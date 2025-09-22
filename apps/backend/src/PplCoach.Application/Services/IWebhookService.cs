using PplCoach.Domain.Enums;

namespace PplCoach.Application.Services;

public interface IWebhookService
{
    Task<bool> ProcessWebhookAsync(IntegrationType type, string payload, Dictionary<string, string> headers);
    Task<string> GetWebhookUrlAsync(IntegrationType type);
    Task<bool> VerifyWebhookSignatureAsync(IntegrationType type, string payload, string signature);
}

public class WebhookEvent
{
    public IntegrationType Type { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string ExternalUserId { get; set; } = string.Empty;
    public string? ExternalObjectId { get; set; }
    public DateTime EventTime { get; set; }
    public Dictionary<string, object> Data { get; set; } = new();
}