using System.Diagnostics;
using System.Text.Json;

namespace PplCoach.Api.Middleware;

public class PerformanceMiddleware(RequestDelegate next, ILogger<PerformanceMiddleware> logger, TimeProvider timeProvider)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var startTime = timeProvider.GetUtcNow();

        try
        {
            await next(context);
        }
        finally
        {
            stopwatch.Stop();
            var responseTime = stopwatch.ElapsedMilliseconds;

            // Log slow requests
            if (responseTime > 1000)
            {
                logger.LogWarning("Slow request detected: {Method} {Path} took {ResponseTime}ms",
                    context.Request.Method,
                    context.Request.Path,
                    responseTime);
            }

            // Add performance headers only if response hasn't started
            if (!context.Response.HasStarted)
            {
                context.Response.Headers["X-Response-Time"] = responseTime.ToString();
                context.Response.Headers["X-Timestamp"] = startTime.ToString("O");
            }

            // Log performance metrics
            using var activity = Activity.Current;
            activity?.SetTag("http.response_time_ms", responseTime);
            activity?.SetTag("http.status_code", context.Response.StatusCode);
        }
    }
}
