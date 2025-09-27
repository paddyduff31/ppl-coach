namespace PplCoach.Api.Startup;

public static class CachingExtensions
{
    public static IServiceCollection AddCustomCaching(this IServiceCollection services)
    {
        services.AddMemoryCache();
        // No point adding output caching as we are usinf React Query which handles caching on the client side
        return services;
    }
}
