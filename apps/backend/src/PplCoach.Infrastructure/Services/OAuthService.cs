using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PplCoach.Application.Abstractions;
using PplCoach.Domain.Enums;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace PplCoach.Infrastructure.Services;

public class OAuthService : IOAuthService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<OAuthService> _logger;

    private readonly Dictionary<IntegrationType, OAuthConfig> _configs;

    public OAuthService(HttpClient httpClient, IConfiguration configuration, ILogger<OAuthService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;

        _configs = new Dictionary<IntegrationType, OAuthConfig>
        {
            {
                IntegrationType.Strava,
                new OAuthConfig
                {
                    AuthorizationUrl = "https://www.strava.com/oauth/authorize",
                    TokenUrl = "https://www.strava.com/oauth/token",
                    RevokeUrl = "https://www.strava.com/oauth/deauthorize",
                    ClientId = _configuration["Integrations:Strava:ClientId"] ?? "",
                    ClientSecret = _configuration["Integrations:Strava:ClientSecret"] ?? "",
                    Scopes = new[] { "read", "activity:read_all" }
                }
            },
            {
                IntegrationType.MyFitnessPal,
                new OAuthConfig
                {
                    AuthorizationUrl = "https://www.myfitnesspal.com/oauth2/authorize",
                    TokenUrl = "https://www.myfitnesspal.com/oauth2/token",
                    ClientId = _configuration["Integrations:MyFitnessPal:ClientId"] ?? "",
                    ClientSecret = _configuration["Integrations:MyFitnessPal:ClientSecret"] ?? "",
                    Scopes = new[] { "diary" }
                }
            }
        };
    }

    public Task<string> GenerateAuthorizationUrlAsync(IntegrationType type, Guid userId, string? redirectUrl = null)
    {
        if (!_configs.TryGetValue(type, out var config))
            throw new NotSupportedException($"Integration type {type} is not supported");

        var state = GenerateSecureState(userId, type);
        var defaultRedirectUrl = _configuration["BaseUrl"] + "/api/integrations/oauth/callback";

        var queryParams = new Dictionary<string, string>
        {
            { "client_id", config.ClientId },
            { "response_type", "code" },
            { "redirect_uri", redirectUrl ?? defaultRedirectUrl },
            { "scope", string.Join(",", config.Scopes) },
            { "state", state }
        };

        if (type == IntegrationType.Strava)
        {
            queryParams["approval_prompt"] = "auto";
        }

        var queryString = string.Join("&", queryParams.Select(kvp => $"{kvp.Key}={Uri.EscapeDataString(kvp.Value)}"));
        return Task.FromResult($"{config.AuthorizationUrl}?{queryString}");
    }

    public async Task<OAuthTokenResponse> ExchangeCodeForTokenAsync(IntegrationType type, string code, string state)
    {
        if (!_configs.TryGetValue(type, out var config))
            throw new NotSupportedException($"Integration type {type} is not supported");

        var requestData = new Dictionary<string, string>
        {
            { "client_id", config.ClientId },
            { "client_secret", config.ClientSecret },
            { "code", code },
            { "grant_type", "authorization_code" }
        };

        var content = new FormUrlEncodedContent(requestData);
        var response = await _httpClient.PostAsync(config.TokenUrl, content);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogError("OAuth token exchange failed: {StatusCode} - {Content}", response.StatusCode, errorContent);
            throw new InvalidOperationException($"OAuth token exchange failed: {response.StatusCode}");
        }

        var jsonResponse = await response.Content.ReadAsStringAsync();
        var tokenData = JsonSerializer.Deserialize<JsonElement>(jsonResponse);

        return new OAuthTokenResponse
        {
            AccessToken = tokenData.GetProperty("access_token").GetString() ?? "",
            RefreshToken = tokenData.TryGetProperty("refresh_token", out var refresh) ? refresh.GetString() : null,
            ExpiresAt = tokenData.TryGetProperty("expires_at", out var expiresAt)
                ? DateTimeOffset.FromUnixTimeSeconds(expiresAt.GetInt64()).DateTime
                : tokenData.TryGetProperty("expires_in", out var expiresIn)
                    ? DateTime.UtcNow.AddSeconds(expiresIn.GetInt32())
                    : null,
            TokenType = tokenData.TryGetProperty("token_type", out var tokenType) ? tokenType.GetString() ?? "Bearer" : "Bearer",
            Scope = tokenData.TryGetProperty("scope", out var scope)
                ? scope.GetString()?.Split(',').ToList() ?? new List<string>()
                : new List<string>()
        };
    }

    public async Task<OAuthTokenResponse> RefreshTokenAsync(IntegrationType type, string refreshToken)
    {
        if (!_configs.TryGetValue(type, out var config))
            throw new NotSupportedException($"Integration type {type} is not supported");

        var requestData = new Dictionary<string, string>
        {
            { "client_id", config.ClientId },
            { "client_secret", config.ClientSecret },
            { "refresh_token", refreshToken },
            { "grant_type", "refresh_token" }
        };

        var content = new FormUrlEncodedContent(requestData);
        var response = await _httpClient.PostAsync(config.TokenUrl, content);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogError("OAuth token refresh failed: {StatusCode} - {Content}", response.StatusCode, errorContent);
            throw new InvalidOperationException($"OAuth token refresh failed: {response.StatusCode}");
        }

        var jsonResponse = await response.Content.ReadAsStringAsync();
        var tokenData = JsonSerializer.Deserialize<JsonElement>(jsonResponse);

        return new OAuthTokenResponse
        {
            AccessToken = tokenData.GetProperty("access_token").GetString() ?? "",
            RefreshToken = tokenData.TryGetProperty("refresh_token", out var newRefresh) ? newRefresh.GetString() : refreshToken,
            ExpiresAt = tokenData.TryGetProperty("expires_at", out var expiresAt)
                ? DateTimeOffset.FromUnixTimeSeconds(expiresAt.GetInt64()).DateTime
                : tokenData.TryGetProperty("expires_in", out var expiresIn)
                    ? DateTime.UtcNow.AddSeconds(expiresIn.GetInt32())
                    : null
        };
    }

    public async Task<bool> RevokeTokenAsync(IntegrationType type, string token)
    {
        if (!_configs.TryGetValue(type, out var config) || string.IsNullOrEmpty(config.RevokeUrl))
            return false;

        var requestData = new Dictionary<string, string>
        {
            { "access_token", token }
        };

        var content = new FormUrlEncodedContent(requestData);
        var response = await _httpClient.PostAsync(config.RevokeUrl, content);

        return response.IsSuccessStatusCode;
    }

    private string GenerateSecureState(Guid userId, IntegrationType type)
    {
        var stateData = new
        {
            UserId = userId,
            Type = type,
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            Nonce = Guid.NewGuid()
        };

        var json = JsonSerializer.Serialize(stateData);
        var bytes = Encoding.UTF8.GetBytes(json);
        return Convert.ToBase64String(bytes);
    }

    private class OAuthConfig
    {
        public string AuthorizationUrl { get; set; } = string.Empty;
        public string TokenUrl { get; set; } = string.Empty;
        public string? RevokeUrl { get; set; }
        public string ClientId { get; set; } = string.Empty;
        public string ClientSecret { get; set; } = string.Empty;
        public string[] Scopes { get; set; } = Array.Empty<string>();
    }
}