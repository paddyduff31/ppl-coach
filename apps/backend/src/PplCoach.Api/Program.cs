using FluentValidation;
using Microsoft.EntityFrameworkCore;
using PplCoach.Api.Endpoints;
using PplCoach.Api.Middleware;
using PplCoach.Application.Mapping;
using PplCoach.Application.Services;
using PplCoach.Application.Validators;
using PplCoach.Infrastructure.Data;
using PplCoach.Infrastructure.Repositories;
using PplCoach.Infrastructure.Services;
using PplCoach.Domain.Repositories;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add database
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL") ??
    builder.Configuration.GetConnectionString("DefaultConnection") ??
    "Host=localhost;Database=ppl_dev;Username=ppl;Password=ppl_password";

builder.Services.AddDbContext<PplCoachDbContext>(options =>
{
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorCodesToAdd: null);
        npgsqlOptions.CommandTimeout(30);
    });

    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});

// Add repositories and services
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IUserProfileService, UserProfileService>();
builder.Services.AddScoped<ISessionService, SessionService>();
builder.Services.AddScoped<IMovementService, MovementService>();
builder.Services.AddScoped<IProgressService, ProgressService>();

// Add AutoMapper
builder.Services.AddAutoMapper(cfg => cfg.AddProfile<MappingProfile>());

// Add FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<UpdateUserProfileValidator>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Add health checks
builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString);

// Add rate limiting
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("api", limiterOptions =>
    {
        limiterOptions.PermitLimit = 100;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 5;
    });

    options.AddFixedWindowLimiter("auth", limiterOptions =>
    {
        limiterOptions.PermitLimit = 5;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
    });
});

// Add memory cache for better performance
builder.Services.AddMemoryCache();

// Add output caching
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => builder.Expire(TimeSpan.FromMinutes(10)));
    options.AddPolicy("movements", builder => builder.Expire(TimeSpan.FromHours(1)));
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(c =>
    {
        c.RouteTemplate = "swagger/{documentName}/swagger.json";
    });
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PPL Coach API v1");
    });

    // Create database and seed data in development
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

app.UseSerilogRequestLogging();
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseMiddleware<PerformanceMiddleware>();
app.UseRateLimiter();
app.UseOutputCache();
app.UseCors();

// Health checks
app.MapHealthChecks("/health");

// Map API endpoints
app.MapProfileEndpoints();
app.MapSessionEndpoints();
app.MapMovementEndpoints();
app.MapProgressEndpoints();
app.MapShuffleEndpoints();

app.Run();
