using Microsoft.AspNetCore.Mvc;
using PplCoach.Application.Models.Integrations;
using PplCoach.Application.Abstractions;
using PplCoach.Domain.Enums;

namespace PplCoach.Api.Endpoints;

public static class IntegrationEndpoints
{
    public static void MapIntegrationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("api/integrations")
            .WithTags("Integrations")
            .WithOpenApi();

        // Get available integration types
        group.MapGet("/types", () =>
        {
            var types = Enum.GetValues<IntegrationType>()
                .Select(t => new { value = (int)t, name = t.ToString() })
                .ToList();
            return Results.Ok(types);
        });

        // Get user's integrations
        group.MapGet("/user/{userId:guid}", async (
            Guid userId,
            IIntegrationService integrationService) =>
        {
            var integrations = await integrationService.GetUserIntegrationsAsync(userId);
            return Results.Ok(integrations);
        });

        // Get integration details
        group.MapGet("/{integrationId:guid}", async (
            Guid integrationId,
            IIntegrationService integrationService) =>
        {
            var integration = await integrationService.GetIntegrationAsync(integrationId);
            return integration != null ? Results.Ok(integration) : Results.NotFound();
        });

        // Get authorization URL
        group.MapPost("/{userId:guid}/authorize", async (
            Guid userId,
            [FromBody] AuthorizeIntegrationRequest request,
            IIntegrationService integrationService) =>
        {
            var authUrl = await integrationService.GetAuthorizationUrlAsync(userId, request.Type, request.RedirectUrl);
            return Results.Ok(new { authorizationUrl = authUrl });
        });

        // OAuth callback
        group.MapPost("/oauth/callback", async (
            [FromBody] CreateIntegrationModel dto,
            [FromQuery] Guid userId,
            IIntegrationService integrationService) =>
        {
            try
            {
                var integration = await integrationService.CreateIntegrationAsync(userId, dto);
                return Results.Ok(integration);
            }
            catch (UnauthorizedAccessException)
            {
                return Results.Unauthorized();
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        });

        // Revoke integration
        group.MapDelete("/{integrationId:guid}", async (
            Guid integrationId,
            IIntegrationService integrationService) =>
        {
            var success = await integrationService.RevokeIntegrationAsync(integrationId);
            return success ? Results.NoContent() : Results.NotFound();
        });

        // Trigger sync
        group.MapPost("/{integrationId:guid}/sync", async (
            Guid integrationId,
            IIntegrationService integrationService) =>
        {
            try
            {
                var syncResult = await integrationService.TriggerSyncAsync(integrationId);
                return Results.Ok(syncResult);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        });

        // Get sync history
        group.MapGet("/{integrationId:guid}/sync/history", async (Guid integrationId,
            IIntegrationService integrationService,
            [FromQuery] int limit = 10) =>
        {
            var history = await integrationService.GetSyncHistoryAsync(integrationId, limit);
            return Results.Ok(history);
        });
    }
}

public class AuthorizeIntegrationRequest
{
    public IntegrationType Type { get; set; }
    public string? RedirectUrl { get; set; }
}
