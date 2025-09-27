using Microsoft.Extensions.Options;
using PplCoach.Api.Configuration.Settings;

namespace PplCoach.Api.Configuration.Validation;

public class JwtSettingsValidator : IValidateOptions<JwtSettings>
{
    public ValidateOptionsResult Validate(string? name, JwtSettings options)
    {
        var failures = new List<string>();

        if (string.IsNullOrWhiteSpace(options.SecretKey))
        {
            failures.Add("JWT SecretKey is required. Set it via 'JwtSettings:SecretKey' in appsettings.json.");
        }
        else if (options.SecretKey.Length < 32)
        {
            failures.Add($"JWT SecretKey must be at least 32 characters long. Current length: {options.SecretKey.Length}");
        }

        if (string.IsNullOrWhiteSpace(options.Issuer))
        {
            failures.Add("JWT Issuer is required.");
        }

        if (string.IsNullOrWhiteSpace(options.Audience))
        {
            failures.Add("JWT Audience is required.");
        }

        if (options.ExpirationMinutes < 1 || options.ExpirationMinutes > 1440)
        {
            failures.Add($"JWT ExpirationMinutes must be between 1 and 1440. Current value: {options.ExpirationMinutes}");
        }

        return failures.Count > 0
            ? ValidateOptionsResult.Fail(failures)
            : ValidateOptionsResult.Success;
    }
}