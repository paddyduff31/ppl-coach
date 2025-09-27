using PplCoach.Api.Services.BackgroundJobs;

namespace PplCoach.Api.Startup;

public static class BackgroundJobExtensions
{
    public static IServiceCollection AddBackgroundJobs(this IServiceCollection services)
    {
        // Register background services using IHostedService (built-in .NET, no external dependencies!)
        services.AddHostedService<DataSyncBackgroundService>();
        services.AddHostedService<NotificationBackgroundService>();
        services.AddHostedService<AnalyticsBackgroundService>();
        services.AddHostedService<HealthCheckBackgroundService>();

        // Register job-related services
        services.AddScoped<IDataSyncService, DataSyncService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IAnalyticsService, AnalyticsService>();

        return services;
    }

    public static void UseBackgroundJobs(this IApplicationBuilder app, IWebHostEnvironment env)
    {
        // Background jobs start automatically via IHostedService
        // No additional configuration needed!

        var logger = app.ApplicationServices.GetRequiredService<ILogger<Program>>();
        logger.LogInformation("Background jobs configured and will start automatically");
    }
}

// Background job services interfaces
public interface IDataSyncService
{
    Task SyncExternalDataAsync(CancellationToken cancellationToken = default);
}

public interface INotificationService
{
    Task ProcessNotificationQueueAsync(CancellationToken cancellationToken = default);
}

public interface IAnalyticsService
{
    Task GenerateAnalyticsReportsAsync(CancellationToken cancellationToken = default);
}

// Sample implementations
public class DataSyncService : IDataSyncService
{
    private readonly ILogger<DataSyncService> _logger;

    public DataSyncService(ILogger<DataSyncService> logger)
    {
        _logger = logger;
    }

    public async Task SyncExternalDataAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting external data sync...");

        // Your sync logic here
        await Task.Delay(1000, cancellationToken); // Simulate work

        _logger.LogInformation("External data sync completed");
    }
}

public class NotificationService : INotificationService
{
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(ILogger<NotificationService> logger)
    {
        _logger = logger;
    }

    public async Task ProcessNotificationQueueAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Processing notification queue...");

        // Your notification logic here
        await Task.Delay(500, cancellationToken); // Simulate work

        _logger.LogInformation("Notification queue processed");
    }
}

public class AnalyticsService : IAnalyticsService
{
    private readonly ILogger<AnalyticsService> _logger;

    public AnalyticsService(ILogger<AnalyticsService> logger)
    {
        _logger = logger;
    }

    public async Task GenerateAnalyticsReportsAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Generating analytics reports...");

        // Your analytics logic here
        await Task.Delay(2000, cancellationToken); // Simulate work

        _logger.LogInformation("Analytics reports generated");
    }
}