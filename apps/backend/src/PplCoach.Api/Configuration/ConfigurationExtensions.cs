using Microsoft.Extensions.Options;
using PplCoach.Api.Configuration.Settings;
using PplCoach.Api.Configuration.Validation;

namespace PplCoach.Api.Configuration;

public static class ConfigurationExtensions
{
    /// <summary>
    /// Adds a configuration section with validation and returns the bound settings
    /// This sexy method does it all: bind, validate, register, and return!
    /// </summary>
    public static T AddValidatedConfiguration<T>(
        this IServiceCollection services,
        IConfiguration configuration,
        string? sectionName = null) where T : class, new()
    {
        sectionName ??= typeof(T).Name;

        // Bind configuration to get the values for immediate return
        var settings = new T();
        var section = configuration.GetSection(sectionName);
        section.Bind(settings);

        // Register with DI container with full validation pipeline
        services.AddOptions<T>()
            .BindConfiguration(sectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        return settings;
    }

    /// <summary>
    /// Registers all application configuration with validation
    /// One method to rule them all! 🔥
    /// </summary>
    public static IServiceCollection AddAllConfiguration(this IServiceCollection services, IConfiguration configuration)
    {
        // Auto-discover and register all validators first
        services.AddAllValidators();

        // Register all validated configurations
        services.AddValidatedConfiguration<JwtSettings>(configuration);
        services.AddValidatedConfiguration<CorsSettings>(configuration);

        return services;
    }

    /// <summary>
    /// Automatically discovers and registers all IValidateOptions<T> validators
    /// Pure .NET magic! ✨
    /// </summary>
    public static IServiceCollection AddAllValidators(this IServiceCollection services)
    {
        var assembly = typeof(ConfigurationExtensions).Assembly;

        var validatorTypes = assembly.GetTypes()
            .Where(type => !type.IsAbstract && !type.IsInterface)
            .Where(type => type.GetInterfaces()
                .Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IValidateOptions<>)))
            .ToList();

        foreach (var validatorType in validatorTypes)
        {
            var interfaceType = validatorType.GetInterfaces()
                .First(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IValidateOptions<>));

            services.AddSingleton(interfaceType, validatorType);
        }

        return services;
    }

    /// <summary>
    /// Registers validators for a specific type (fallback method)
    /// </summary>
    private static void RegisterValidators<T>(IServiceCollection services) where T : class
    {
        // No longer needed - we register all validators upfront with AddAllValidators
        // But keeping this method for backwards compatibility if needed
    }

    /// <summary>
    /// Gets the database connection string with proper fallback
    /// </summary>
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