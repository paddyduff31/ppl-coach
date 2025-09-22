using Polly;
using Polly.CircuitBreaker;
using Polly.Extensions.Http;

namespace PplCoach.Api.Startup;

public static class ResilienceExtensions
{
    public static void AddResiliencePatterns(this IServiceCollection services)
    {
        // Circuit breaker for Strava API
        services.AddHttpClient("StravaApi", client =>
        {
            client.BaseAddress = new Uri("https://www.strava.com/api/v3/");
            client.Timeout = TimeSpan.FromSeconds(30);
        })
        .AddPolicyHandler(GetCircuitBreakerPolicy("Strava"))
        .AddPolicyHandler(GetRetryPolicy());

        // Circuit breaker for MyFitnessPal API
        services.AddHttpClient("MyFitnessPalApi", client =>
        {
            client.BaseAddress = new Uri("https://api.myfitnesspal.com/");
            client.Timeout = TimeSpan.FromSeconds(30);
        })
        .AddPolicyHandler(GetCircuitBreakerPolicy("MyFitnessPal"))
        .AddPolicyHandler(GetRetryPolicy());

        // General HTTP client with resilience
        services.AddHttpClient("DefaultApi")
            .AddPolicyHandler(GetRetryPolicy())
            .AddPolicyHandler(GetTimeoutPolicy());
    }

    private static IAsyncPolicy<HttpResponseMessage> GetCircuitBreakerPolicy(string serviceName)
    {
        return Policy
            .HandleResult<HttpResponseMessage>(r => !r.IsSuccessStatusCode)
            .Or<HttpRequestException>()
            .Or<TaskCanceledException>()
            .CircuitBreakerAsync(
                // Open circuit after 3 consecutive failures
                handledEventsAllowedBeforeBreaking: 3,
                // Keep circuit open for 30 seconds
                durationOfBreak: TimeSpan.FromSeconds(30),
                onBreak: (exception, duration) =>
                {
                    var logger = ServiceProvider.GetService<ILogger<ResilienceExtensions>>();
                    logger?.LogWarning("Circuit breaker opened for {ServiceName} for {Duration}s",
                        serviceName, duration.TotalSeconds);
                },
                onReset: () =>
                {
                    var logger = ServiceProvider.GetService<ILogger<ResilienceExtensions>>();
                    logger?.LogInformation("Circuit breaker reset for {ServiceName}", serviceName);
                },
                onHalfOpen: () =>
                {
                    var logger = ServiceProvider.GetService<ILogger<ResilienceExtensions>>();
                    logger?.LogInformation("Circuit breaker half-opened for {ServiceName}", serviceName);
                });
    }

    private static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
    {
        return HttpPolicyExtensions
            .HandleTransientHttpError()
            .WaitAndRetryAsync(
                retryCount: 3,
                sleepDurationProvider: retryAttempt =>
                    TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)) +
                    TimeSpan.FromMilliseconds(new Random().Next(0, 100)), // Jitter
                onRetry: (outcome, retryNumber, context) =>
                {
                    var logger = ServiceProvider.GetService<ILogger<ResilienceExtensions>>();
                    logger?.LogWarning("Retrying HTTP request. Attempt {RetryNumber}", retryNumber);
                });
    }

    private static IAsyncPolicy<HttpResponseMessage> GetTimeoutPolicy()
    {
        return Policy.TimeoutAsync<HttpResponseMessage>(10); // 10 second timeout
    }

    private static IServiceProvider ServiceProvider { get; set; } = null!;

    public static void SetServiceProvider(IServiceProvider serviceProvider)
    {
        ServiceProvider = serviceProvider;
    }
}
