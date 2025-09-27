using Microsoft.Extensions.Options;
using PplCoach.Api.Configuration;
using PplCoach.Api.Configuration.Settings;

namespace PplCoach.Api.Startup;

public static class CorsExtensions
{
    public static IServiceCollection AddCustomCors(this IServiceCollection services, IConfiguration configuration)
    {
        // Get CORS settings from configuration (without registering again since AddAllConfiguration already did it)
        var corsSettings = new CorsSettings();
        configuration.GetSection("CorsSettings").Bind(corsSettings);

        services.AddCors(options =>
        {
            options.AddPolicy("AllowWebFrontend", policy =>
            {
                policy.WithOrigins(corsSettings.AllowedOrigins)
                      .WithHeaders(corsSettings.AllowedHeaders)
                      .WithMethods(corsSettings.AllowedMethods)
                      .SetIsOriginAllowed(origin => corsSettings.AllowedOrigins.Contains("*") || corsSettings.AllowedOrigins.Contains(origin))
                      .SetPreflightMaxAge(TimeSpan.FromMinutes(corsSettings.PreflightMaxAgeMinutes));

                if (corsSettings.AllowCredentials)
                {
                    policy.AllowCredentials();
                }
            });

            // Set as default policy as well
            options.AddDefaultPolicy(policy =>
            {
                policy.WithOrigins(corsSettings.AllowedOrigins)
                      .WithHeaders(corsSettings.AllowedHeaders)
                      .WithMethods(corsSettings.AllowedMethods)
                      .SetIsOriginAllowed(origin => corsSettings.AllowedOrigins.Contains("*") || corsSettings.AllowedOrigins.Contains(origin))
                      .SetPreflightMaxAge(TimeSpan.FromMinutes(corsSettings.PreflightMaxAgeMinutes));

                if (corsSettings.AllowCredentials)
                {
                    policy.AllowCredentials();
                }
            });
        });

        return services;
    }
}
