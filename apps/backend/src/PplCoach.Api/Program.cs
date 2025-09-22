using PplCoach.Api.Startup;
using PplCoach.Api.Middleware;
using PplCoach.Api.Hubs;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Get connection string
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL") ??
    builder.Configuration.GetConnectionString("DefaultConnection") ??
    "Host=localhost;Database=ppl_dev;Username=ppl;Password=ppl_password";

// Add all services using extension methods - ENTERPRISE LEVEL! 🚀
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddApiVersioningAndSwagger();
builder.Services.AddDatabase(connectionString, builder.Environment.IsDevelopment());
builder.Services.AddBusinessServices();
builder.Services.AddExternalServices();
builder.Services.AddValidationServices();
builder.Services.AddCustomCors();
builder.Services.AddCustomHealthChecks(connectionString);
builder.Services.AddCustomRateLimiting();
builder.Services.AddCustomCaching();

// NEW ENTERPRISE FEATURES 🔥
builder.Services.AddObservability(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddSecurityHeaders();
builder.Services.AddBackgroundJobs(connectionString);
builder.Services.AddResiliencePatterns();
builder.Services.AddSignalR();

var app = builder.Build();

// Set service provider for resilience patterns
ResilienceExtensions.SetServiceProvider(app.Services);

// Configure the HTTP request pipeline - PRODUCTION READY! ✨
app.ConfigureDevelopmentEnvironment();

// Apply database migrations (production-ready approach)
await app.MigrateDatabaseAsync();

// Add global exception handling
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();

// Add observability and security
app.UseObservability();
app.UseSecurityHeaders(app.Environment);

app.ConfigureMiddleware();

// Background jobs
app.UseBackgroundJobs(app.Environment);

// Health checks with detailed responses
app.MapHealthChecks("/health").RequireCors();
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

// SignalR hubs
app.MapHub<WorkoutHub>("/hubs/workout");

// Map all endpoints
app.MapAllEndpoints();

app.Run();
