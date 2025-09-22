using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PplCoach.Application.DTOs.Integrations;
using PplCoach.Application.Services;
using PplCoach.Domain.Entities;
using PplCoach.Domain.Enums;
using PplCoach.Domain.Repositories;
using PplCoach.Infrastructure.Data;
using System.Text.Json;

namespace PplCoach.Infrastructure.Services;

public class IntegrationService(
    IUnitOfWork unitOfWork,
    IOAuthService oauthService,
    IMapper mapper,
    PplCoachDbContext context,
    ILogger<IntegrationService> logger)
    : IIntegrationService
{
    public async Task<string> GetAuthorizationUrlAsync(Guid userId, IntegrationType type, string? redirectUrl = null)
    {
        return await oauthService.GenerateAuthorizationUrlAsync(type, userId, redirectUrl);
    }

    public async Task<IntegrationDto> CreateIntegrationAsync(Guid userId, CreateIntegrationDto dto)
    {
        // Verify state and extract user ID
        var stateData = DecodeState(dto.State);
        if (stateData.UserId != userId)
            throw new UnauthorizedAccessException("Invalid state parameter");

        // Exchange authorization code for tokens
        var tokenResponse = await oauthService.ExchangeCodeForTokenAsync(dto.Type, dto.AuthorizationCode, dto.State);

        // Get external user info
        var externalUserId = await GetExternalUserIdAsync(dto.Type, tokenResponse.AccessToken);

        // Check if integration already exists
        var existingIntegration = await context.ThirdPartyIntegrations
            .FirstOrDefaultAsync(i => i.UserId == userId && i.Type == dto.Type);

        ThirdPartyIntegration integration;

        if (existingIntegration != null)
        {
            // Update existing integration
            existingIntegration.ExternalUserId = externalUserId;
            existingIntegration.AccessToken = tokenResponse.AccessToken;
            existingIntegration.RefreshToken = tokenResponse.RefreshToken;
            existingIntegration.TokenExpiresAt = tokenResponse.ExpiresAt;
            existingIntegration.IsActive = true;
            existingIntegration.ConnectedAt = DateTime.UtcNow;

            integration = existingIntegration;
        }
        else
        {
            // Create new integration
            integration = new ThirdPartyIntegration
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Type = dto.Type,
                ExternalUserId = externalUserId,
                AccessToken = tokenResponse.AccessToken,
                RefreshToken = tokenResponse.RefreshToken,
                TokenExpiresAt = tokenResponse.ExpiresAt,
                IsActive = true,
                ConnectedAt = DateTime.UtcNow
            };

            await unitOfWork.ThirdPartyIntegrations.AddAsync(integration);
        }

        await unitOfWork.SaveChangesAsync();

        logger.LogInformation("Created/updated {Type} integration for user {UserId}", dto.Type, userId);

        return mapper.Map<IntegrationDto>(integration);
    }

    public async Task<List<IntegrationDto>> GetUserIntegrationsAsync(Guid userId)
    {
        var integrations = await context.ThirdPartyIntegrations
            .Where(i => i.UserId == userId)
            .OrderBy(i => i.Type)
            .ToListAsync();

        return mapper.Map<List<IntegrationDto>>(integrations);
    }

    public async Task<IntegrationDto?> GetIntegrationAsync(Guid integrationId)
    {
        var integration = await context.ThirdPartyIntegrations
            .FirstOrDefaultAsync(i => i.Id == integrationId);

        return integration != null ? mapper.Map<IntegrationDto>(integration) : null;
    }

    public async Task<bool> RevokeIntegrationAsync(Guid integrationId)
    {
        var integration = await context.ThirdPartyIntegrations
            .FirstOrDefaultAsync(i => i.Id == integrationId);

        if (integration == null)
            return false;

        try
        {
            // Revoke token with the provider
            await oauthService.RevokeTokenAsync(integration.Type, integration.AccessToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to revoke token with provider for integration {IntegrationId}", integrationId);
        }

        // Deactivate integration
        integration.IsActive = false;
        await unitOfWork.SaveChangesAsync();

        logger.LogInformation("Revoked integration {IntegrationId}", integrationId);

        return true;
    }

    public async Task<IntegrationSyncDto> TriggerSyncAsync(Guid integrationId)
    {
        var integration = await context.ThirdPartyIntegrations
            .FirstOrDefaultAsync(i => i.Id == integrationId && i.IsActive);

        if (integration == null)
            throw new InvalidOperationException("Integration not found or inactive");

        var syncLog = new IntegrationSyncLog
        {
            Id = Guid.NewGuid(),
            IntegrationId = integrationId,
            Status = SyncStatus.InProgress,
            StartedAt = DateTime.UtcNow
        };

        await unitOfWork.IntegrationSyncLogs.AddAsync(syncLog);
        await unitOfWork.SaveChangesAsync();

        try
        {
            // Refresh token if needed
            if (integration.TokenExpiresAt.HasValue && integration.TokenExpiresAt < DateTime.UtcNow.AddMinutes(5))
            {
                await RefreshIntegrationTokenAsync(integration);
            }

            // Perform sync based on integration type
            var result = integration.Type switch
            {
                IntegrationType.Strava => await SyncStravaDataAsync(integration),
                IntegrationType.MyFitnessPal => await SyncMyFitnessPalDataAsync(integration),
                _ => throw new NotSupportedException($"Sync not implemented for {integration.Type}")
            };

            syncLog.Status = SyncStatus.Completed;
            syncLog.CompletedAt = DateTime.UtcNow;
            syncLog.RecordsProcessed = result.RecordsProcessed;
            syncLog.RecordsImported = result.RecordsImported;
            syncLog.RecordsSkipped = result.RecordsSkipped;

            integration.LastSyncAt = DateTime.UtcNow;
            integration.SyncCursor = result.SyncCursor;
        }
        catch (Exception ex)
        {
            syncLog.Status = SyncStatus.Failed;
            syncLog.CompletedAt = DateTime.UtcNow;
            syncLog.ErrorMessage = ex.Message;
            logger.LogError(ex, "Sync failed for integration {IntegrationId}", integrationId);
        }

        await unitOfWork.SaveChangesAsync();

        return mapper.Map<IntegrationSyncDto>(syncLog);
    }

    public async Task<List<IntegrationSyncDto>> GetSyncHistoryAsync(Guid integrationId, int limit = 10)
    {
        var syncLogs = await context.IntegrationSyncLogs
            .Where(sl => sl.IntegrationId == integrationId)
            .OrderByDescending(sl => sl.StartedAt)
            .Take(limit)
            .ToListAsync();

        return mapper.Map<List<IntegrationSyncDto>>(syncLogs);
    }

    private StateData DecodeState(string state)
    {
        try
        {
            var bytes = Convert.FromBase64String(state);
            var json = System.Text.Encoding.UTF8.GetString(bytes);
            return JsonSerializer.Deserialize<StateData>(json) ?? throw new InvalidOperationException("Invalid state data");
        }
        catch
        {
            throw new UnauthorizedAccessException("Invalid state parameter");
        }
    }

    private async Task<string> GetExternalUserIdAsync(IntegrationType type, string accessToken)
    {
        // This would make API calls to get user info from each provider
        // For now, return a placeholder
        return type switch
        {
            IntegrationType.Strava => await GetStravaUserIdAsync(accessToken),
            IntegrationType.MyFitnessPal => await GetMyFitnessPalUserIdAsync(accessToken),
            _ => Guid.NewGuid().ToString()
        };
    }

    private Task<string> GetStravaUserIdAsync(string accessToken)
    {
        // Make API call to Strava to get user info
        // This is a placeholder implementation
        return Task.FromResult("strava_user_" + Guid.NewGuid().ToString("N")[..8]);
    }

    private Task<string> GetMyFitnessPalUserIdAsync(string accessToken)
    {
        // Make API call to MyFitnessPal to get user info
        // This is a placeholder implementation
        return Task.FromResult("mfp_user_" + Guid.NewGuid().ToString("N")[..8]);
    }

    private async Task RefreshIntegrationTokenAsync(ThirdPartyIntegration integration)
    {
        if (string.IsNullOrEmpty(integration.RefreshToken))
            return;

        var tokenResponse = await oauthService.RefreshTokenAsync(integration.Type, integration.RefreshToken);

        integration.AccessToken = tokenResponse.AccessToken;
        integration.RefreshToken = tokenResponse.RefreshToken ?? integration.RefreshToken;
        integration.TokenExpiresAt = tokenResponse.ExpiresAt;
    }

    private Task<SyncResult> SyncStravaDataAsync(ThirdPartyIntegration integration)
    {
        // Placeholder for Strava sync implementation
        return Task.FromResult(new SyncResult { RecordsProcessed = 0, RecordsImported = 0, RecordsSkipped = 0 });
    }

    private Task<SyncResult> SyncMyFitnessPalDataAsync(ThirdPartyIntegration integration)
    {
        // Placeholder for MyFitnessPal sync implementation
        return Task.FromResult(new SyncResult { RecordsProcessed = 0, RecordsImported = 0, RecordsSkipped = 0 });
    }

    private class StateData
    {
        public Guid UserId { get; set; }
        public IntegrationType Type { get; set; }
        public long Timestamp { get; set; }
        public Guid Nonce { get; set; }
    }

    private class SyncResult
    {
        public int RecordsProcessed { get; set; }
        public int RecordsImported { get; set; }
        public int RecordsSkipped { get; set; }
        public string? SyncCursor { get; set; }
    }
}