using PplCoach.Application.Common.Models;

namespace PplCoach.Application.Abstractions;

public interface IImageUploadService
{
    Task<Result<string>> UploadImageAsync(Stream imageStream, string fileName, string contentType, CancellationToken cancellationToken = default);
    Task<Result<bool>> DeleteImageAsync(string imageUrl, CancellationToken cancellationToken = default);
    Task<Result<string>> GetSignedUrlAsync(string imageUrl, TimeSpan expiration, CancellationToken cancellationToken = default);
}

public class ImageUploadRequest
{
    public required Stream ImageStream { get; init; }
    public required string FileName { get; init; }
    public required string ContentType { get; init; }
    public string? UserId { get; init; }
    public ImageCategory Category { get; init; } = ImageCategory.Profile;
}

public enum ImageCategory
{
    Profile,
    Exercise,
    Progress,
    General
}
