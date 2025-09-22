using System.Diagnostics;
using System.Text.Json;

namespace PplCoach.Api.Middleware;

public class PerformanceMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<PerformanceMiddleware> _logger;

    public PerformanceMiddleware(RequestDelegate next, ILogger<PerformanceMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var startTime = DateTime.UtcNow;

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            var responseTime = stopwatch.ElapsedMilliseconds;

            // Log slow requests
            if (responseTime > 1000)
            {
                _logger.LogWarning("Slow request detected: {Method} {Path} took {ResponseTime}ms",
                    context.Request.Method,
                    context.Request.Path,
                    responseTime);
            }

            // Add performance headers
            context.Response.Headers.Add("X-Response-Time", responseTime.ToString());
            context.Response.Headers.Add("X-Timestamp", startTime.ToString("O"));

            // Log performance metrics
            using var activity = Activity.Current;
            activity?.SetTag("http.response_time_ms", responseTime);
            activity?.SetTag("http.status_code", context.Response.StatusCode);
        }
    }
}
