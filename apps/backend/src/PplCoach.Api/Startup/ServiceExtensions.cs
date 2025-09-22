using PplCoach.Application.Services;
using PplCoach.Domain.Repositories;
using PplCoach.Infrastructure.Repositories;
using PplCoach.Infrastructure.Services;
using PplCoach.Infrastructure.Services.Integrations;

namespace PplCoach.Api.Startup;

public static class ServiceExtensions
{
    public static void AddBusinessServices(this IServiceCollection services)
    {
        // Add repositories and services
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IUserProfileService, UserProfileService>();
        services.AddScoped<ISessionService, SessionService>();
        services.AddScoped<IMovementService, MovementService>();
        services.AddScoped<IProgressService, ProgressService>();
        services.AddScoped<IIntegrationService, IntegrationService>();
        services.AddScoped<IOAuthService, OAuthService>();
        services.AddScoped<IWebhookService, WebhookService>();
    }

    public static void AddExternalServices(this IServiceCollection services)
    {
        // Add HTTP clients for third-party services
        services.AddHttpClient<StravaService>();
        services.AddHttpClient<MyFitnessPalService>();
    }
}
