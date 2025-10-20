using Microsoft.AspNetCore.Mvc;
using PplCoach.Application.Abstractions;
using PplCoach.Domain.Enums;
using System.Text;

namespace PplCoach.Api.Endpoints;

public static class WebhookEndpoints
{
    public static void MapWebhookEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("api/webhooks")
            .WithTags("Webhooks")
            .WithOpenApi();

        // Strava webhook
        group.MapPost("/strava", async (
            HttpContext context,
            IWebhookService webhookService,
            ILogger<Program> logger) =>
        {
            return await ProcessWebhook(context, IntegrationType.Strava, webhookService, logger);
        });

        // Strava webhook verification (GET)
        group.MapGet("/strava", (
            [FromQuery(Name = "hub.mode")] string mode,
            [FromQuery(Name = "hub.challenge")] string challenge,
            [FromQuery(Name = "hub.verify_token")] string verifyToken,
            IConfiguration configuration) =>
        {
            // Strava webhook verification
            var expectedToken = configuration["Integrations:Strava:WebhookVerifyToken"];

            if (mode == "subscribe" && verifyToken == expectedToken)
            {
                return Results.Json(new { hubChallenge = challenge });
            }

            return Results.BadRequest();
        });

        // MyFitnessPal webhook
        group.MapPost("/myfitnesspal", async (
            HttpContext context,
            IWebhookService webhookService,
            ILogger<Program> logger) =>
        {
            return await ProcessWebhook(context, IntegrationType.MyFitnessPal, webhookService, logger);
        });

        // Generic webhook processor
        group.MapPost("/{type}", async (
            string type,
            HttpContext context,
            IWebhookService webhookService,
            ILogger<Program> logger) =>
        {
            if (!Enum.TryParse<IntegrationType>(type, true, out var integrationType))
            {
                return Results.BadRequest(new { error = "Unknown integration type" });
            }

            return await ProcessWebhook(context, integrationType, webhookService, logger);
        });
    }

    private static async Task<IResult> ProcessWebhook(
        HttpContext context,
        IntegrationType type,
        IWebhookService webhookService,
        ILogger logger)
    {
        try
        {
            // Read the request body
            using var reader = new StreamReader(context.Request.Body, Encoding.UTF8);
            var payload = await reader.ReadToEndAsync();

            // Extract headers
            var headers = context.Request.Headers
                .ToDictionary(h => h.Key, h => h.Value.ToString());

            // Get signature header for verification
            var signature = type switch
            {
                IntegrationType.Strava => headers.GetValueOrDefault("X-Hub-Signature", ""),
                IntegrationType.MyFitnessPal => headers.GetValueOrDefault("X-Signature", ""),
                _ => ""
            };

            // Verify webhook signature
            if (!string.IsNullOrEmpty(signature))
            {
                var isValid = await webhookService.VerifyWebhookSignatureAsync(type, payload, signature);
                if (!isValid)
                {
                    logger.LogWarning("Invalid webhook signature for {Type}", type);
                    return Results.Unauthorized();
                }
            }

            // Process the webhook
            var success = await webhookService.ProcessWebhookAsync(type, payload, headers);

            if (success)
            {
                logger.LogInformation("Successfully processed {Type} webhook", type);
                return Results.Ok();
            }
            else
            {
                logger.LogWarning("Failed to process {Type} webhook", type);
                return Results.BadRequest();
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error processing {Type} webhook", type);
            return Results.StatusCode(500);
        }
    }
}
