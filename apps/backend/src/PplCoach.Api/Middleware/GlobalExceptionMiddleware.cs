using System.Net;
using System.Text.Json;
using FluentValidation;

namespace PplCoach.Api.Middleware;

public class GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        object response = new
        {
            Message = "An error occurred",
            Details = exception.Message,
            Timestamp = DateTime.UtcNow,
            TraceId = context.TraceIdentifier
        };

        switch (exception)
        {
            case ValidationException validationEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response = new
                {
                    Message = "Validation failed",
                    Details = validationEx.Message,
                    Errors = validationEx.Errors.Select(e => new { e.PropertyName, e.ErrorMessage }),
                    Timestamp = DateTime.UtcNow,
                    TraceId = context.TraceIdentifier
                };
                break;

            case UnauthorizedAccessException:
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                response = new
                {
                    Message = "Unauthorized access",
                    Details = exception.Message,
                    Timestamp = DateTime.UtcNow,
                    TraceId = context.TraceIdentifier
                };
                break;

            case KeyNotFoundException:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                response = new
                {
                    Message = "Resource not found",
                    Details = exception.Message,
                    Timestamp = DateTime.UtcNow,
                    TraceId = context.TraceIdentifier
                };
                break;

            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                break;
        }

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}
