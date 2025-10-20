using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PplCoach.Application.Abstractions;
using PplCoach.Domain.Enums;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace PplCoach.Infrastructure.Services;

public class WebhookService(
    IConfiguration configuration,
    ILogger<WebhookService> logger,
    IIntegrationService integrationService)
    : IWebhookService
{
    private readonly IIntegrationService _integrationService = integrationService;

    public async Task<bool> ProcessWebhookAsync(IntegrationType type, string payload, Dictionary<string, string> headers)
    {
        try
        {
            logger.LogInformation("Processing webhook for {Type}: {Payload}", type, payload);

            var webhookEvent = type switch
            {
                IntegrationType.Strava => ProcessStravaWebhook(payload, headers),
                IntegrationType.MyFitnessPal => ProcessMyFitnessPalWebhook(payload, headers),
                _ => throw new NotSupportedException($"Webhook processing for {type} is not implemented")
            };

            if (webhookEvent == null)
                return false;

            // Process the webhook event based on type
            await HandleWebhookEventAsync(webhookEvent);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to process webhook for {Type}", type);
            return false;
        }
    }

    public Task<string> GetWebhookUrlAsync(IntegrationType type)
    {
        var baseUrl = configuration["BaseUrl"] ?? "https://localhost:5179";
        return Task.FromResult($"{baseUrl}/api/webhooks/{type.ToString().ToLower()}");
    }

    public Task<bool> VerifyWebhookSignatureAsync(IntegrationType type, string payload, string signature)
    {
        var result = type switch
        {
            IntegrationType.Strava => VerifyStravaSignature(payload, signature),
            IntegrationType.MyFitnessPal => VerifyMyFitnessPalSignature(payload, signature),
            _ => true // Default to allow if verification not implemented
        };
        return Task.FromResult(result);
    }

    private WebhookEvent? ProcessStravaWebhook(string payload, Dictionary<string, string> headers)
    {
        var data = JsonSerializer.Deserialize<JsonElement>(payload);

        if (!data.TryGetProperty("object_type", out var objectType) ||
            objectType.GetString() != "activity")
            return null;

        if (!data.TryGetProperty("aspect_type", out var aspectType))
            return null;

        return new WebhookEvent
        {
            Type = IntegrationType.Strava,
            EventType = aspectType.GetString() ?? "",
            ExternalUserId = data.GetProperty("owner_id").ToString(),
            ExternalObjectId = data.GetProperty("object_id").ToString(),
            EventTime = DateTimeOffset.FromUnixTimeSeconds(data.GetProperty("event_time").GetInt64()).DateTime,
            Data = JsonSerializer.Deserialize<Dictionary<string, object>>(payload) ?? new()
        };
    }

    private WebhookEvent? ProcessMyFitnessPalWebhook(string payload, Dictionary<string, string> headers)
    {
        // MyFitnessPal webhook processing would go here
        // This is a placeholder as their webhook format may vary
        var data = JsonSerializer.Deserialize<JsonElement>(payload);

        return new WebhookEvent
        {
            Type = IntegrationType.MyFitnessPal,
            EventType = "diary_update",
            ExternalUserId = data.GetProperty("user_id").ToString(),
            EventTime = DateTime.UtcNow,
            Data = JsonSerializer.Deserialize<Dictionary<string, object>>(payload) ?? new()
        };
    }

    private bool VerifyStravaSignature(string payload, string signature)
    {
        var webhookSecret = configuration["Integrations:Strava:WebhookSecret"];
        if (string.IsNullOrEmpty(webhookSecret))
            return true; // Skip verification if no secret configured

        var expectedSignature = ComputeHmacSha256(payload, webhookSecret);
        return signature.Equals(expectedSignature, StringComparison.OrdinalIgnoreCase);
    }

    private bool VerifyMyFitnessPalSignature(string payload, string signature)
    {
        var webhookSecret = configuration["Integrations:MyFitnessPal:WebhookSecret"];
        if (string.IsNullOrEmpty(webhookSecret))
            return true;

        var expectedSignature = ComputeHmacSha256(payload, webhookSecret);
        return signature.Equals(expectedSignature, StringComparison.OrdinalIgnoreCase);
    }

    private string ComputeHmacSha256(string data, string key)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToHexString(hash).ToLower();
    }

    private Task HandleWebhookEventAsync(WebhookEvent webhookEvent)
    {
        // Find the integration for this external user
        // This would need to be implemented based on your requirements
        logger.LogInformation("Handling webhook event: {EventType} for user {UserId}",
            webhookEvent.EventType, webhookEvent.ExternalUserId);

        // Example: Trigger sync for the affected integration
        if (webhookEvent.EventType == "create" || webhookEvent.EventType == "update")
        {
            // Find integration by external user ID and trigger sync
            // await _integrationService.TriggerSyncForExternalUserAsync(webhookEvent.Type, webhookEvent.ExternalUserId);
        }
        return Task.CompletedTask;
    }
}