using PplCoach.Api.Endpoints;

namespace PplCoach.Api.Startup;

public static class EndpointExtensions
{
    public static WebApplication MapAllEndpoints(this WebApplication app)
    {
        // Map API endpoints
        app.MapSessionEndpoints();
        app.MapMovementEndpoints();
        app.MapProgressEndpoints();
        app.MapShuffleEndpoints();
        app.MapIntegrationEndpoints();
        app.MapWebhookEndpoints();

        return app;
    }
}
