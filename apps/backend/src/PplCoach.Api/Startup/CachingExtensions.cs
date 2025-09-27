namespace PplCoach.Api.Startup;

public static class CachingExtensions
{
    public static IServiceCollection AddCustomCaching(this IServiceCollection services)
    {
        services.AddMemoryCache();

        // Add output caching even though React Query handles client-side caching
        // This is still useful for API responses that don't change often
        services.AddOutputCache(options =>
        {
            options.AddBasePolicy(builder =>
                builder.Expire(TimeSpan.FromMinutes(1)));

            // Cache GET requests to specific endpoints
            options.AddPolicy("DefaultCache", builder =>
                builder.Expire(TimeSpan.FromMinutes(5))
                       .SetVaryByQuery("*"));
        });

        return services;
    }
}
