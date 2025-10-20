// 🚀 PPL COACH API - OOTB MICROSOFT STACK 🚀
// Maximum use of built-in .NET features, minimal custom code

using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using PplCoach.Api.Startup;
using PplCoach.Api.Configuration;
using PplCoach.Api.Middleware;
using PplCoach.Api.Hubs;
using Serilog;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// ⚙️ CONFIGURATION & VALIDATION - One method to rule them all! 🔥
builder.Services.AddAllConfiguration(builder.Configuration);
var connectionString = builder.Configuration.GetConnectionString();

// 📝 LOGGING - Built-in Serilog integration
builder.Host.UseSerilog((context, config) =>
    config.ReadFrom.Configuration(context.Configuration)
          .Enrich.FromLogContext()
          .Enrich.WithProperty("Application", "PplCoach.Api")
          .Enrich.WithProperty("Environment", context.HostingEnvironment.EnvironmentName));

// 🔗 FLUENT SERVICE REGISTRATION - Method chaining for cleaner code
builder.Services
    .AddControllers()
    .Services
    .AddCustomApiVersioning()
    .AddSwaggerDocumentation()

    // Data & Persistence - chained together
    .AddDatabase(connectionString, builder.Environment.IsDevelopment())
    .AddCustomHealthChecks(connectionString)
    .AddCustomCaching()

    // Application Services - all business logic
    .AddBusinessServices()
    .AddExternalServices()
    .AddValidationServices()

    // File Upload Services - Register interface directly
    .AddFileUpload(builder.Configuration, builder.Environment)

    // Web Services - HTTP concerns
    .AddCustomCors(builder.Configuration)
    .AddCustomRateLimiting();

// Continue the service chain
builder.Services
    // Security - authentication and authorization
    .AddJwtAuthentication(builder.Configuration)
    .AddSecurityHeaders()

    // Background Processing - use OOTB IHostedService
    .AddBackgroundJobs()

    // HTTP Clients with built-in resilience
    .AddHttpClients();

// SignalR with JSON protocol
builder.Services.AddSignalR()
    .AddJsonProtocol(options =>
        options.PayloadSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase);

// 📊 OPTIONAL - Only add observability if configured
builder.Services.AddObservability(builder.Configuration);

var app = builder.Build();

// ⚡ OOTB MIDDLEWARE PIPELINE - Clean and simple
try
{
    // Development tools
    if (app.Environment.IsDevelopment())
    {
        app.UseDeveloperExceptionPage()
           .UseSwaggerDocumentation();
    }

    // Database initialization
    await app.MigrateDatabaseAsync();

    // File upload initialization
    await app.InitializeFileUploadAsync();

    // Enable static file serving for uploads
    app.UseFileUpload();

    // Built-in middleware chain
    app.UseMiddleware<GlobalExceptionHandlingMiddleware>()
       .UseSecurityHeaders(app.Environment)
       .UseSerilogRequestLogging()
       .UseCors("AllowWebFrontend")
       .UseRateLimiter()
       .UseOutputCache()
       .UseAuthentication()
       .UseAuthorization()
       .UseObservability();

    // Application endpoints
    app.UseHealthCheckEndpoints()
       .UseBackgroundJobs(app.Environment);

    // API endpoints with security
    app.MapHub<WorkoutHub>("/hubs/workout").RequireAuthorization();
    app.MapControllers();
    app.MapAllEndpoints();

    // Success logging
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("🚀 PPL Coach API started in {Environment} mode!", app.Environment.EnvironmentName);

    if (app.Environment.IsDevelopment())
        logger.LogInformation("📚 Documentation: https://localhost:7001/api/docs");

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "💥 Startup failed!");
    throw;
}
finally
{
    Log.CloseAndFlush();
}
