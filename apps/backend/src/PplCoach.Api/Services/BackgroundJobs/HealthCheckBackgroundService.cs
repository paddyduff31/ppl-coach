namespace PplCoach.Api.Services.BackgroundJobs;

public class HealthCheckBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<HealthCheckBackgroundService> _logger;
    private readonly TimeSpan _period = TimeSpan.FromMinutes(2); // Health check every 2 minutes

    public HealthCheckBackgroundService(IServiceProvider serviceProvider, ILogger<HealthCheckBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Health check background service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var healthCheckService = scope.ServiceProvider.GetService<Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckService>();

                if (healthCheckService != null)
                {
                    var result = await healthCheckService.CheckHealthAsync(stoppingToken);

                    if (result.Status != Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Healthy)
                    {
                        _logger.LogWarning("Health check failed: {Status} - {Entries}",
                            result.Status,
                            string.Join(", ", result.Entries.Where(e => e.Value.Status != Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Healthy)
                                .Select(e => $"{e.Key}: {e.Value.Status}")));
                    }
                    else
                    {
                        _logger.LogDebug("Health check passed");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during health check");
            }

            await Task.Delay(_period, stoppingToken);
        }

        _logger.LogInformation("Health check background service stopped");
    }
}