using Microsoft.Extensions.Options;
using PplCoach.Api.Configuration.Settings;

namespace PplCoach.Api.Configuration.Validation;

public class CorsSettingsValidator : IValidateOptions<CorsSettings>
{
    public ValidateOptionsResult Validate(string? name, CorsSettings options)
    {
        var failures = new List<string>();

        if (options.AllowedOrigins.Length == 0)
        {
            failures.Add("At least one CORS origin must be configured.");
        }

        foreach (var origin in options.AllowedOrigins)
        {
            if (string.IsNullOrWhiteSpace(origin))
            {
                failures.Add("CORS origins cannot be empty or whitespace.");
                break;
            }

            if (origin != "*" && !Uri.IsWellFormedUriString(origin, UriKind.Absolute))
            {
                failures.Add($"Invalid CORS origin format: '{origin}'");
            }
        }

        if (options.PreflightMaxAgeMinutes < 1 || options.PreflightMaxAgeMinutes > 1440)
        {
            failures.Add($"CORS PreflightMaxAgeMinutes must be between 1 and 1440. Current value: {options.PreflightMaxAgeMinutes}");
        }

        return failures.Count > 0
            ? ValidateOptionsResult.Fail(failures)
            : ValidateOptionsResult.Success;
    }
}