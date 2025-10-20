using PplCoach.Application.Models.Integrations;
using PplCoach.Domain.Enums;

namespace PplCoach.Application.Abstractions;

public interface IIntegrationService
{
    Task<string> GetAuthorizationUrlAsync(Guid userId, IntegrationType type, string? redirectUrl = null);
    Task<IntegrationModel> CreateIntegrationAsync(Guid userId, CreateIntegrationModel dto);
    Task<List<IntegrationModel>> GetUserIntegrationsAsync(Guid userId);
    Task<IntegrationModel?> GetIntegrationAsync(Guid integrationId);
    Task<bool> RevokeIntegrationAsync(Guid integrationId);
    Task<IntegrationSyncModel> TriggerSyncAsync(Guid integrationId);
    Task<List<IntegrationSyncModel>> GetSyncHistoryAsync(Guid integrationId, int limit = 10);
}
