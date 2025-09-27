using PplCoach.Api.Startup;

namespace PplCoach.Api.Services.BackgroundJobs;

public class AnalyticsBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AnalyticsBackgroundService> _logger;
    private readonly TimeSpan _period = TimeSpan.FromHours(24); // Generate reports daily

    public AnalyticsBackgroundService(IServiceProvider serviceProvider, ILogger<AnalyticsBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Analytics background service started");

        // Wait until 2 AM for the first run
        await WaitUntil2AM(stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var analyticsService = scope.ServiceProvider.GetRequiredService<IAnalyticsService>();

                await analyticsService.GenerateAnalyticsReportsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during analytics report generation");
            }

            await Task.Delay(_period, stoppingToken);
        }

        _logger.LogInformation("Analytics background service stopped");
    }

    private async Task WaitUntil2AM(CancellationToken stoppingToken)
    {
        var now = DateTime.Now;
        var next2AM = now.Date.AddDays(now.Hour >= 2 ? 1 : 0).AddHours(2);
        var delay = next2AM - now;

        if (delay > TimeSpan.Zero)
        {
            _logger.LogInformation("Waiting {Hours} hours until 2 AM for first analytics run", delay.TotalHours);
            await Task.Delay(delay, stoppingToken);
        }
    }
}