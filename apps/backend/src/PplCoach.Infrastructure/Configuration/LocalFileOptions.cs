using System.ComponentModel.DataAnnotations;

namespace PplCoach.Infrastructure.Configuration;

public class LocalFileOptions
{
    [Required]
    public string UploadPath { get; set; } = string.Empty;

    [Required]
    public string BaseUrl { get; set; } = string.Empty;
}
