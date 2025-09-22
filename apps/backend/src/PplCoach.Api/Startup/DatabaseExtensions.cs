using Microsoft.EntityFrameworkCore;
using PplCoach.Infrastructure.Data;

namespace PplCoach.Api.Startup;

public static class DatabaseExtensions
{
    public static void AddDatabase(this IServiceCollection services, string connectionString, bool isDevelopment)
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
            });

            if (isDevelopment)
            {
                options.EnableSensitiveDataLogging();
                options.EnableDetailedErrors();
            }
        });
    }

    public static async Task EnsureDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<PplCoachDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        try
        {
            await context.Database.EnsureCreatedAsync();
            await DatabaseSeeder.SeedAsync(context);
            logger.LogInformation("Database created and seeded successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while creating/seeding the database.");
            // Continue anyway - the API can run without seed data
        }
    }
}
