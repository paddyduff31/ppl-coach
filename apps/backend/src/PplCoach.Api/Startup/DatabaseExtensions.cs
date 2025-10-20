using Microsoft.EntityFrameworkCore;
using PplCoach.Infrastructure.Data;

namespace PplCoach.Api.Startup;

public static class DatabaseExtensions
{
    public static IServiceCollection AddDatabase(this IServiceCollection services, string connectionString, bool isDevelopment)
    {
        services.AddDbContext<PplCoachDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
                npgsqlOptions.CommandTimeout(30);
                npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "public");
            });

            if (!isDevelopment) return;
            options.EnableSensitiveDataLogging();
            options.EnableDetailedErrors();
        });

        // Health checks are registered separately in HealthCheckExtensions
        return services;
    }

    public static async Task MigrateDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<PplCoachDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        try
        {
            var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
            if (pendingMigrations.Any())
            {
                logger.LogInformation("Applying {Count} pending migrations", pendingMigrations.Count());
                await context.Database.MigrateAsync();
                logger.LogInformation("Database migrations applied successfully");
            }
            else
            {
                logger.LogInformation("Database is up to date");
            }

            // Seed data after migrations if seeder exists
            var timeProvider = scope.ServiceProvider.GetRequiredService<TimeProvider>();
            await DatabaseSeeder.SeedAsync(context, timeProvider);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while migrating the database");
            throw; // Fail fast in production
        }
    }
}
