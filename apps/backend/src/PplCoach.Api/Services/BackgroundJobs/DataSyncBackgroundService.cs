using PplCoach.Api.Startup;

namespace PplCoach.Api.Services.BackgroundJobs;

public class DataSyncBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DataSyncBackgroundService> _logger;
    private readonly TimeSpan _period = TimeSpan.FromMinutes(15); // Sync every 15 minutes

    public DataSyncBackgroundService(IServiceProvider serviceProvider, ILogger<DataSyncBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Data sync background service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var dataSyncService = scope.ServiceProvider.GetRequiredService<IDataSyncService>();

                await dataSyncService.SyncExternalDataAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during data sync");
            }

            await Task.Delay(_period, stoppingToken);
        }

        _logger.LogInformation("Data sync background service stopped");
    }
}