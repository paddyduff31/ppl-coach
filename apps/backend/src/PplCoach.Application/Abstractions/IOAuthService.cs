using PplCoach.Domain.Enums;

namespace PplCoach.Application.Abstractions;

public interface IOAuthService
{
    Task<string> GenerateAuthorizationUrlAsync(IntegrationType type, Guid userId, string? redirectUrl = null);
    Task<OAuthTokenResponse> ExchangeCodeForTokenAsync(IntegrationType type, string code, string state);
    Task<OAuthTokenResponse> RefreshTokenAsync(IntegrationType type, string refreshToken);
    Task<bool> RevokeTokenAsync(IntegrationType type, string token);
}

public class OAuthTokenResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string? RefreshToken { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string TokenType { get; set; } = "Bearer";
    public List<string> Scope { get; set; } = new();
    public Dictionary<string, object> AdditionalData { get; set; } = new();
}
