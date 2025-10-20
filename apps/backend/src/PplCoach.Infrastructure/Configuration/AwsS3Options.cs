using System.ComponentModel.DataAnnotations;

namespace PplCoach.Infrastructure.Configuration;

public class AwsS3Options
{
    [Required]
    public string BucketName { get; set; } = string.Empty;

    [Required]
    public string Region { get; set; } = string.Empty;

    public string? AccessKey { get; set; }

    public string? SecretKey { get; set; }
}
