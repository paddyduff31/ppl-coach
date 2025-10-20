using Amazon.S3;
using Microsoft.Extensions.FileProviders;
using PplCoach.Api.Configuration;
using PplCoach.Application.Abstractions;
using PplCoach.Infrastructure.Configuration;
using PplCoach.Infrastructure.Services;

namespace PplCoach.Api.Startup;

public static class FileUploadExtensions
{
    public static IServiceCollection AddFileUpload(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        if (environment.IsDevelopment())
        {
            services.AddValidatedConfiguration<LocalFileOptions>(configuration);
            services.AddScoped<IImageUploadService, LocalImageUploadService>();
        }
        else
        {
            var awsOptions = services.AddValidatedConfiguration<AwsS3Options>(configuration);

            services.AddSingleton<IAmazonS3>(serviceProvider =>
            {
                var config = new AmazonS3Config
                {
                    RegionEndpoint = Amazon.RegionEndpoint.GetBySystemName(awsOptions.Region)
                };

                return !string.IsNullOrEmpty(awsOptions.AccessKey) && !string.IsNullOrEmpty(awsOptions.SecretKey)
                    ? new AmazonS3Client(awsOptions.AccessKey, awsOptions.SecretKey, config)
                    : new AmazonS3Client(config);
            });

            services.AddScoped<IImageUploadService, AwsImageUploadService>();
        }

        return services;
    }

    public static WebApplication UseFileUpload(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            // Serve static files from uploads directory in development
            var localFileOptions = app.Services.GetRequiredService<Microsoft.Extensions.Options.IOptions<LocalFileOptions>>().Value;
            var absolutePath = Path.GetFullPath(localFileOptions.UploadPath);

            if (Directory.Exists(absolutePath))
            {
                app.UseStaticFiles(new StaticFileOptions
                {
                    FileProvider = new PhysicalFileProvider(absolutePath),
                    RequestPath = "/uploads"
                });
            }
        }

        return app;
    }

    public static async Task<WebApplication> InitializeFileUploadAsync(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            // Initialize local file upload
            using var scope = app.Services.CreateScope();
            var localFileOptions = scope.ServiceProvider.GetRequiredService<Microsoft.Extensions.Options.IOptions<LocalFileOptions>>().Value;
            var absolutePath = Path.GetFullPath(localFileOptions.UploadPath);
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

            try
            {
                if (!Directory.Exists(absolutePath))
                {
                    Directory.CreateDirectory(absolutePath);
                    logger.LogInformation("Created local upload directory: {Path}", absolutePath);
                }
                else
                {
                    logger.LogInformation("Using local upload directory: {Path}", absolutePath);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to initialize local upload directory");
            }
        }
        else
        {
            // Initialize AWS S3 in production
            using var scope = app.Services.CreateScope();
            var s3Client = scope.ServiceProvider.GetRequiredService<IAmazonS3>();
            var options = scope.ServiceProvider.GetRequiredService<Microsoft.Extensions.Options.IOptions<AwsS3Options>>().Value;
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

            try
            {
                var bucketExists = await Amazon.S3.Util.AmazonS3Util.DoesS3BucketExistV2Async(s3Client, options.BucketName);

                if (bucketExists)
                {
                    logger.LogInformation("Successfully connected to S3 bucket: {BucketName}", options.BucketName);
                }
                else
                {
                    logger.LogWarning("S3 bucket {BucketName} does not exist or is not accessible", options.BucketName);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to verify S3 bucket connection");
            }
        }

        return app;
    }
}