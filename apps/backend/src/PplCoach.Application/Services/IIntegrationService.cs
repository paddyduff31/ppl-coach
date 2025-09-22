using PplCoach.Application.DTOs.Integrations;
using PplCoach.Domain.Enums;

namespace PplCoach.Application.Services;

public interface IIntegrationService
{
    Task<string> GetAuthorizationUrlAsync(Guid userId, IntegrationType type, string? redirectUrl = null);
    Task<IntegrationDto> CreateIntegrationAsync(Guid userId, CreateIntegrationDto dto);
    Task<List<IntegrationDto>> GetUserIntegrationsAsync(Guid userId);
    Task<IntegrationDto?> GetIntegrationAsync(Guid integrationId);
    Task<bool> RevokeIntegrationAsync(Guid integrationId);
    Task<IntegrationSyncDto> TriggerSyncAsync(Guid integrationId);
    Task<List<IntegrationSyncDto>> GetSyncHistoryAsync(Guid integrationId, int limit = 10);
}