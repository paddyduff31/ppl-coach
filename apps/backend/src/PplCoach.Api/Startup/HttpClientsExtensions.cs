namespace PplCoach.Api.Startup;

public static class HttpClientsExtensions
{
    public static IServiceCollection AddHttpClients(this IServiceCollection services)
    {
        services.AddHttpClient("default", client =>
        {
            client.Timeout = TimeSpan.FromSeconds(30);
            client.DefaultRequestHeaders.Add("User-Agent", "PplCoach/1.0");
        });

        return services;
    }
}
