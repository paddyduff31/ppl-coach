using Microsoft.AspNetCore.Mvc;
using PplCoach.Application.Abstractions;

namespace PplCoach.Api.Endpoints;

public static class ImageEndpoints
{
    public static IEndpointRouteBuilder MapImageEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/images")
            .WithTags("Images")
            .RequireAuthorization();

        group.MapPost("/upload", UploadImage)
            .WithName("UploadImage")
            .WithOpenApi(operation => new(operation)
            {
                Summary = "Upload an image",
                Description = "Upload an image file to cloud storage"
            })
            .DisableAntiforgery(); // Required for file uploads

        group.MapDelete("/{imageUrl}", DeleteImage)
            .WithName("DeleteImage")
            .WithOpenApi(operation => new(operation)
            {
                Summary = "Delete an image",
                Description = "Delete an image from cloud storage"
            });

        return app;
    }

    private static async Task<IResult> UploadImage(
        [FromServices] IImageUploadService imageUploadService,
        [FromServices] ILoggerFactory loggerFactory,
        IFormFile file,
        CancellationToken cancellationToken)
    {
        // Validate file
        if (file == null || file.Length == 0)
        {
            return Results.BadRequest("No file provided");
        }

        // Validate file size (max 5MB)
        const long maxFileSize = 5 * 1024 * 1024;
        if (file.Length > maxFileSize)
        {
            return Results.BadRequest("File size must be less than 5MB");
        }

        // Validate file type
        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        if (!allowedTypes.Contains(file.ContentType.ToLowerInvariant()))
        {
            return Results.BadRequest("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed");
        }

        var logger = loggerFactory.CreateLogger("ImageEndpoints");

        try
        {
            using var stream = file.OpenReadStream();
            var result = await imageUploadService.UploadImageAsync(
                stream,
                file.FileName,
                file.ContentType,
                cancellationToken);

            if (result.IsSuccess)
            {
                logger.LogInformation("Successfully uploaded image: {FileName}", file.FileName);
                return Results.Ok(new { imageUrl = result.Value });
            }

            logger.LogWarning("Failed to upload image {FileName}: {Error}", file.FileName, result.Error);
            return Results.BadRequest(result.Error);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error uploading image {FileName}", file.FileName);
            return Results.StatusCode(500);
        }
    }

    private static async Task<IResult> DeleteImage(
        [FromServices] IImageUploadService imageUploadService,
        [FromServices] ILoggerFactory loggerFactory,
        string imageUrl,
        CancellationToken cancellationToken)
    {
        var logger = loggerFactory.CreateLogger("ImageEndpoints");

        try
        {
            // Decode the URL parameter
            var decodedUrl = Uri.UnescapeDataString(imageUrl);

            var result = await imageUploadService.DeleteImageAsync(decodedUrl, cancellationToken);

            if (result.IsSuccess)
            {
                logger.LogInformation("Successfully deleted image: {ImageUrl}", decodedUrl);
                return Results.Ok(new { deleted = true });
            }

            logger.LogWarning("Failed to delete image {ImageUrl}: {Error}", decodedUrl, result.Error);
            return Results.BadRequest(result.Error);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting image {ImageUrl}", imageUrl);
            return Results.StatusCode(500);
        }
    }
}
