using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Text.Json;

namespace PplCoach.Api.Startup;

public static class HealthCheckExtensions
{
    public static IServiceCollection AddCustomHealthChecks(this IServiceCollection services, string connectionString)
    {
        services.AddHealthChecks()
            .AddNpgSql(connectionString, name: "database", tags: ["db", "ready"]);

        return services;
    }

    public static IApplicationBuilder UseHealthCheckEndpoints(this IApplicationBuilder app)
    {
        var environment = app.ApplicationServices.GetRequiredService<IWebHostEnvironment>();

        // 🏥 Main Health Check - Comprehensive system status
        app.UseHealthChecks("/health", new HealthCheckOptions
        {
            ResponseWriter = async (context, report) =>
            {
                context.Response.ContentType = "application/json";
                var timeProvider = context.RequestServices.GetRequiredService<TimeProvider>();
                var now = timeProvider.GetUtcNow().DateTime;
                var response = new
                {
                    status = report.Status.ToString().ToLowerInvariant(),
                    timestamp = now,
                    environment = environment.EnvironmentName,
                    version = "1.0.0",
                    uptime = now - System.Diagnostics.Process.GetCurrentProcess().StartTime,
                    checks = report.Entries.ToDictionary(
                        kvp => kvp.Key,
                        kvp => new
                        {
                            status = kvp.Value.Status.ToString().ToLowerInvariant(),
                            description = kvp.Value.Description,
                            exception = kvp.Value.Exception?.Message,
                            duration = kvp.Value.Duration.TotalMilliseconds,
                            tags = kvp.Value.Tags
                        }
                    ),
                    totalDuration = report.TotalDuration.TotalMilliseconds
                };
                await context.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    WriteIndented = true
                }));
            }
        });

        // 🎯 Kubernetes Readiness Probe
        app.UseHealthChecks("/health/ready", new HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("ready"),
            ResponseWriter = async (context, report) =>
            {
                context.Response.ContentType = "application/json";
                var result = report.Status == HealthStatus.Healthy ? "ready" : "not ready";
                await context.Response.WriteAsync(JsonSerializer.Serialize(new { status = result }));
            }
        });

        // ❤️ Kubernetes Liveness Probe
        app.UseHealthChecks("/health/live", new HealthCheckOptions
        {
            Predicate = _ => false, // Only basic liveness check
            ResponseWriter = async (context, _) =>
            {
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync(JsonSerializer.Serialize(new { status = "alive" }));
            }
        });

        return app;
    }
}
