using PplCoach.Api.Startup;
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

// Add services using extension methods - look at how clean this is! 🔥
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDatabase(connectionString, builder.Environment.IsDevelopment());
builder.Services.AddBusinessServices();
builder.Services.AddExternalServices();
builder.Services.AddValidationServices();
builder.Services.AddCustomCors();
builder.Services.AddCustomHealthChecks(connectionString);
builder.Services.AddCustomRateLimiting();
builder.Services.AddCustomCaching();

var app = builder.Build();

// Configure the HTTP request pipeline - pure poetry! ✨
app.ConfigureDevelopmentEnvironment();

if (app.Environment.IsDevelopment())
{
    await app.EnsureDatabaseAsync();
}

app.ConfigureMiddleware();

// Health checks
app.MapHealthChecks("/health").RequireCors();

// Map all endpoints
app.MapAllEndpoints();

app.Run();
