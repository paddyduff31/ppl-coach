using Hangfire;
using Hangfire.PostgreSql;
using PplCoach.Application.Services;

namespace PplCoach.Api.Startup;

public static class BackgroundJobExtensions
{
    public static void AddBackgroundJobs(this IServiceCollection services, string connectionString)
    {
        // Add Hangfire for background job processing
        services.AddHangfire(configuration => configuration
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UsePostgreSqlStorage(connectionString, new PostgreSqlStorageOptions
            {
                QueuePollInterval = TimeSpan.FromSeconds(10),
                JobExpirationCheckInterval = TimeSpan.FromHours(1),
                CountersAggregateInterval = TimeSpan.FromMinutes(5),
                PrepareSchemaIfNecessary = true,
                DashboardJobListLimit = 25000,
                TransactionSynchronisationTimeout = TimeSpan.FromMinutes(5),
                SchemaName = "hangfire"
            }));

        services.AddHangfireServer(options =>
        {
            options.WorkerCount = Environment.ProcessorCount;
            options.Queues = new[] { "default", "integrations", "notifications", "analytics" };
        });

        // Register background job services
        services.AddScoped<ISyncIntegrationsJob, SyncIntegrationsJob>();
        services.AddScoped<IDataAnalyticsJob, DataAnalyticsJob>();
        services.AddScoped<INotificationJob, NotificationJob>();
    }

    public static void UseBackgroundJobs(this IApplicationBuilder app, IWebHostEnvironment env)
    {
        // Hangfire Dashboard (only in development or with proper authentication in production)
        if (env.IsDevelopment())
        {
            app.UseHangfireDashboard("/hangfire");
        }
        else
        {
            app.UseHangfireDashboard("/hangfire", new DashboardOptions
            {
                Authorization = new[] { new HangfireAuthorizationFilter() }
            });
        }

        // Schedule recurring jobs
        var recurringJobs = app.ApplicationServices.GetRequiredService<IRecurringJobManager>();

        // Sync third-party integrations every 15 minutes
        recurringJobs.AddOrUpdate<ISyncIntegrationsJob>(
            "sync-integrations",
            job => job.ExecuteAsync(),
            "*/15 * * * *", // Every 15 minutes
            TimeZoneInfo.Utc);

        // Generate analytics reports daily at 2 AM
        recurringJobs.AddOrUpdate<IDataAnalyticsJob>(
            "daily-analytics",
            job => job.GenerateDailyReportsAsync(),
            "0 2 * * *", // Daily at 2 AM UTC
            TimeZoneInfo.Utc);
    }
}

// Simple auth filter for Hangfire dashboard in production
public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        // In production, you'd want proper authentication here
        // For now, just check if user is authenticated
        return context.GetHttpContext().User.Identity?.IsAuthenticated == true;
    }
}
