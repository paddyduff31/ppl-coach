using PplCoach.Api.Middleware;
using Serilog;

namespace PplCoach.Api.Startup;

public static class MiddlewareExtensions
{
    public static WebApplication ConfigureMiddleware(this WebApplication app)
    {
        app.UseSerilogRequestLogging();
        app.UseMiddleware<GlobalExceptionMiddleware>();
        app.UseMiddleware<PerformanceMiddleware>();
        app.UseRateLimiter();
        app.UseOutputCache();
        app.UseCors();

        return app;
    }

    public static WebApplication ConfigureDevelopmentEnvironment(this WebApplication app)
    {
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
        }

        return app;
    }
}
