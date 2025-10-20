using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PplCoach.Infrastructure.Configuration;
using PplCoach.Application.Common.Models;
using PplCoach.Application.Abstractions;

namespace PplCoach.Infrastructure.Services;

public class LocalImageUploadService : IImageUploadService
{
    private readonly LocalFileOptions _options;
    private readonly ILogger<LocalImageUploadService> _logger;
    private readonly IHostEnvironment _environment;
    private readonly TimeProvider _timeProvider;

    public LocalImageUploadService(
        IOptions<LocalFileOptions> options,
        ILogger<LocalImageUploadService> logger,
        IHostEnvironment environment,
        TimeProvider timeProvider)
    {
        var rawOptions = options.Value;
        // Convert relative path to absolute path
        _options = new LocalFileOptions
        {
            UploadPath = Path.GetFullPath(rawOptions.UploadPath),
            BaseUrl = rawOptions.BaseUrl
        };
        _logger = logger;
        _environment = environment;
        _timeProvider = timeProvider;

        // Ensure upload directory exists
        EnsureUploadDirectoryExists();
    }

    public async Task<Result<string>> UploadImageAsync(
        Stream imageStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var fileExtension = Path.GetExtension(fileName);
            var uniqueFileName = $"{Guid.NewGuid():N}{fileExtension}";
            var timestamp = _timeProvider.GetUtcNow().ToString("yyyy/MM/dd");
            var relativePath = Path.Combine("images", timestamp, uniqueFileName);
            var fullPath = Path.Combine(_options.UploadPath, relativePath);

            // Ensure directory exists
            var directory = Path.GetDirectoryName(fullPath)!;
            Directory.CreateDirectory(directory);

            // Save file
            using var fileStream = new FileStream(fullPath, FileMode.Create);
            await imageStream.CopyToAsync(fileStream, cancellationToken);

            // Generate URL
            var imageUrl = $"{_options.BaseUrl.TrimEnd('/')}/uploads/{relativePath.Replace('\\', '/')}";

            _logger.LogInformation("Successfully uploaded image {FileName} to {ImageUrl}", fileName, imageUrl);
            return Result<string>.Success(imageUrl);
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
            var relativePath = ExtractRelativePathFromUrl(imageUrl);
            if (string.IsNullOrEmpty(relativePath))
            {
                return Result<bool>.Failure("Invalid image URL");
            }

            var fullPath = Path.Combine(_options.UploadPath, relativePath);

            if (File.Exists(fullPath))
            {
                await Task.Run(() => File.Delete(fullPath), cancellationToken);
                _logger.LogInformation("Successfully deleted image at {Path}", fullPath);
            }

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting image {ImageUrl}", imageUrl);
            return Result<bool>.Failure($"Error deleting image: {ex.Message}");
        }
    }

    public Task<Result<string>> GetSignedUrlAsync(string imageUrl, TimeSpan expiration, CancellationToken cancellationToken = default)
    {
        // For local development, we don't need signed URLs - just return the original URL
        return Task.FromResult(Result<string>.Success(imageUrl));
    }

    private void EnsureUploadDirectoryExists()
    {
        try
        {
            if (!Directory.Exists(_options.UploadPath))
            {
                Directory.CreateDirectory(_options.UploadPath);
                _logger.LogInformation("Created upload directory: {Path}", _options.UploadPath);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create upload directory: {Path}", _options.UploadPath);
            throw;
        }
    }

    private string? ExtractRelativePathFromUrl(string imageUrl)
    {
        try
        {
            var uri = new Uri(imageUrl);
            var path = uri.AbsolutePath;

            // Remove /uploads/ prefix to get relative path
            if (path.StartsWith("/uploads/"))
            {
                return path[9..].Replace('/', Path.DirectorySeparatorChar);
            }

            return null;
        }
        catch
        {
            return null;
        }
    }
}

