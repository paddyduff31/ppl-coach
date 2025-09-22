namespace PplCoach.Api.Startup;

public static class CachingExtensions
{
    public static IServiceCollection AddCustomCaching(this IServiceCollection services)
    {
        // Add memory cache for better performance
        services.AddMemoryCache();

        // Add output caching
        services.AddOutputCache(options =>
        {
            options.AddBasePolicy(outputCachePolicyBuilder => outputCachePolicyBuilder.Expire(TimeSpan.FromMinutes(10)));
            options.AddPolicy("movements", policyBuilder => policyBuilder.Expire(TimeSpan.FromHours(1)));
        });

        return services;
    }
}
