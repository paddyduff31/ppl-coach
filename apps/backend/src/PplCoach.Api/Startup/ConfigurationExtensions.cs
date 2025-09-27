using System.ComponentModel.DataAnnotations;

namespace PplCoach.Api.Startup;

public static class ConfigurationExtensions
{
    public static IServiceCollection AddConfigurationValidation(this IServiceCollection services, IConfiguration configuration)
    {
        // Validate JWT settings
        var jwtSection = configuration.GetSection("JwtSettings");
        services.Configure<JwtSettings>(jwtSection);
        services.PostConfigure<JwtSettings>(settings =>
        {
            if (string.IsNullOrEmpty(settings.SecretKey) || settings.SecretKey.Length < 32)
            {
                throw new InvalidOperationException("JWT SecretKey must be at least 32 characters long");
            }
        });

        // Validate CORS settings
        services.Configure<CorsSettings>(configuration.GetSection("Cors"));

        // Add validation for all settings
        services.AddOptions<JwtSettings>()
            .BindConfiguration("JwtSettings")
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<CorsSettings>()
            .BindConfiguration("Cors")
            .ValidateDataAnnotations()
            .ValidateOnStart();

        return services;
    }

    public static string GetConnectionString(this IConfiguration configuration)
    {
        return Environment.GetEnvironmentVariable("DATABASE_URL") ??
               configuration.GetConnectionString("DefaultConnection") ??
               "Host=localhost;Database=ppl_dev;Username=ppl;Password=ppl_password";
    }

    public static bool IsProduction(this IWebHostEnvironment environment)
        => environment.IsEnvironment("Production");

    public static bool IsStaging(this IWebHostEnvironment environment)
        => environment.IsEnvironment("Staging");
}

public class JwtSettings
{
    [Required]
    [MinLength(32, ErrorMessage = "SecretKey must be at least 32 characters long")]
    public string SecretKey { get; set; } = string.Empty;

    [Required]
    public string Issuer { get; set; } = "PplCoachApi";

    [Required]
    public string Audience { get; set; } = "PplCoachClient";

    [Range(1, 1440)]
    public int ExpirationMinutes { get; set; } = 60;
}

public class CorsSettings
{
    public string[] AllowedOrigins { get; set; } =
        ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"];

    public bool AllowCredentials { get; set; } = true;

    [Range(1, 1440)]
    public int PreflightMaxAgeMinutes { get; set; } = 10;
}