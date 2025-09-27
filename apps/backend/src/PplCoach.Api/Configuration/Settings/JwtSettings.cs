using System.ComponentModel.DataAnnotations;

namespace PplCoach.Api.Configuration.Settings;

public class JwtSettings
{
    [Required]
    [MinLength(32, ErrorMessage = "SecretKey must be at least 32 characters long")]
    public string SecretKey { get; set; } = string.Empty;

    [Required]
    public string Issuer { get; set; } = "PplCoachApi";

    [Required]
    public string Audience { get; set; } = "PplCoachClient";

    [Range(1, 1440, ErrorMessage = "ExpirationMinutes must be between 1 and 1440")]
    public int ExpirationMinutes { get; set; } = 60;

    public bool RequireHttpsMetadata { get; set; } = true;
}