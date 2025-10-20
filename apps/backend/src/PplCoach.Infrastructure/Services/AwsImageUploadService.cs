using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PplCoach.Infrastructure.Configuration;
using PplCoach.Application.Common.Models;
using PplCoach.Application.Abstractions;

namespace PplCoach.Infrastructure.Services;

public class AwsImageUploadService : IImageUploadService
{
    private readonly IAmazonS3 _s3Client;
    private readonly AwsS3Options _options;
    private readonly ILogger<AwsImageUploadService> _logger;

    public AwsImageUploadService(
        IAmazonS3 s3Client,
        IOptions<AwsS3Options> options,
        ILogger<AwsImageUploadService> logger)
    {
        _s3Client = s3Client;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<Result<string>> UploadImageAsync(
        Stream imageStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var key = GenerateImageKey(fileName);

            var request = new PutObjectRequest
            {
                BucketName = _options.BucketName,
                Key = key,
                InputStream = imageStream,
                ContentType = contentType,
                ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256,
                Metadata =
                {
                    ["uploaded-at"] = DateTime.UtcNow.ToString("O"),
                    ["original-filename"] = fileName
                }
            };

            var response = await _s3Client.PutObjectAsync(request, cancellationToken);

            if (response.HttpStatusCode == System.Net.HttpStatusCode.OK)
            {
                var imageUrl = $"https://{_options.BucketName}.s3.{_options.Region}.amazonaws.com/{key}";
                _logger.LogInformation("Successfully uploaded image {FileName} to {ImageUrl}", fileName, imageUrl);
                return Result<string>.Success(imageUrl);
            }

            _logger.LogError("Failed to upload image {FileName}. HTTP Status: {StatusCode}", fileName, response.HttpStatusCode);
            return Result<string>.Failure("Failed to upload image");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading image {FileName}", fileName);
            return Result<string>.Failure($"Error uploading image: {ex.Message}");
        }
    }

    public async Task<Result<bool>> DeleteImageAsync(string imageUrl, CancellationToken cancellationToken = default)
    {
        try
        {
            var key = ExtractKeyFromUrl(imageUrl);
            if (string.IsNullOrEmpty(key))
            {
                return Result<bool>.Failure("Invalid image URL");
            }

            var request = new DeleteObjectRequest
            {
                BucketName = _options.BucketName,
                Key = key
            };

            var response = await _s3Client.DeleteObjectAsync(request, cancellationToken);

            _logger.LogInformation("Successfully deleted image with key {Key}", key);
            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting image {ImageUrl}", imageUrl);
            return Result<bool>.Failure($"Error deleting image: {ex.Message}");
        }
    }

    public async Task<Result<string>> GetSignedUrlAsync(string imageUrl, TimeSpan expiration, CancellationToken cancellationToken = default)
    {
        try
        {
            var key = ExtractKeyFromUrl(imageUrl);
            if (string.IsNullOrEmpty(key))
            {
                return Result<string>.Failure("Invalid image URL");
            }

            var request = new GetPreSignedUrlRequest
            {
                BucketName = _options.BucketName,
                Key = key,
                Verb = HttpVerb.GET,
                Expires = DateTime.UtcNow.Add(expiration)
            };

            var signedUrl = await _s3Client.GetPreSignedURLAsync(request);
            return Result<string>.Success(signedUrl);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating signed URL for {ImageUrl}", imageUrl);
            return Result<string>.Failure($"Error generating signed URL: {ex.Message}");
        }
    }

    private string GenerateImageKey(string fileName)
    {
        var timestamp = DateTime.UtcNow.ToString("yyyy/MM/dd");
        var uniqueId = Guid.NewGuid().ToString("N")[..8];
        var extension = Path.GetExtension(fileName);
        var cleanFileName = Path.GetFileNameWithoutExtension(fileName)
            .Replace(" ", "-")
            .ToLowerInvariant();

        return $"images/{timestamp}/{cleanFileName}-{uniqueId}{extension}";
    }

    private string? ExtractKeyFromUrl(string imageUrl)
    {
        try
        {
            var uri = new Uri(imageUrl);
            return uri.AbsolutePath.TrimStart('/');
        }
        catch
        {
            return null;
        }
    }
}

