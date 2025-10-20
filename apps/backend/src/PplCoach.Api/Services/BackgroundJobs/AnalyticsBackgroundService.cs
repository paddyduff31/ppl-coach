using PplCoach.Api.Startup;

namespace PplCoach.Api.Services.BackgroundJobs;

public class AnalyticsBackgroundService(IServiceProvider serviceProvider, ILogger<AnalyticsBackgroundService> logger)
    : BackgroundService
{
    private readonly TimeSpan _period = TimeSpan.FromHours(24); // Generate reports daily

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Analytics background service started");

        // Wait until 2 AM for the first run
        await WaitUntil2AM(stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = serviceProvider.CreateScope();
                var analyticsService = scope.ServiceProvider.GetRequiredService<IAnalyticsService>();

                await analyticsService.GenerateAnalyticsReportsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred during analytics report generation");
            }

            await Task.Delay(_period, stoppingToken);
        }

        logger.LogInformation("Analytics background service stopped");
    }

    private async Task WaitUntil2AM(CancellationToken stoppingToken)
    {
        var now = DateTime.Now;
        var next2AM = now.Date.AddDays(now.Hour >= 2 ? 1 : 0).AddHours(2);
        var delay = next2AM - now;

        if (delay > TimeSpan.Zero)
        {
            logger.LogInformation("Waiting {Hours} hours until 2 AM for first analytics run", delay.TotalHours);
            await Task.Delay(delay, stoppingToken);
        }
    }
}
