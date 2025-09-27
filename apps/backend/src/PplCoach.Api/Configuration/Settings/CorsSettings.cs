using System.ComponentModel.DataAnnotations;

namespace PplCoach.Api.Configuration.Settings;

public class CorsSettings
{
    public string[] AllowedOrigins { get; set; } =
        ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"];

    public bool AllowCredentials { get; set; } = true;

    [Range(1, 1440, ErrorMessage = "PreflightMaxAgeMinutes must be between 1 and 1440")]
    public int PreflightMaxAgeMinutes { get; set; } = 10;

    public string[] AllowedMethods { get; set; } = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];

    public string[] AllowedHeaders { get; set; } = ["*"];
}