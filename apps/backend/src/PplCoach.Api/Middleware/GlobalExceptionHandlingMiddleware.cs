using System.Net;
using System.Text.Json;
using FluentValidation;
using PplCoach.Domain.Exceptions;

namespace PplCoach.Api.Middleware;

public class GlobalExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<GlobalExceptionHandlingMiddleware> logger,
    IWebHostEnvironment environment)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An unhandled exception occurred while processing the request");
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ErrorResponse();

        switch (exception)
        {
            case ValidationException validationEx:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = "Validation failed";
                response.Details = validationEx.Errors?.ToDictionary(x => x.PropertyName, x => x.ErrorMessage);
                break;

            case NotFoundException:
                response.StatusCode = (int)HttpStatusCode.NotFound;
                response.Message = "The requested resource was not found";
                break;

            case UnauthorizedException:
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                response.Message = "You are not authorized to perform this action";
                break;

            case BusinessRuleViolationException businessEx:
                response.StatusCode = (int)HttpStatusCode.UnprocessableEntity;
                response.Message = businessEx.Message;
                response.ErrorCode = businessEx.ErrorCode;
                break;

            case ExternalServiceException serviceEx:
                response.StatusCode = (int)HttpStatusCode.BadGateway;
                response.Message = "An external service is currently unavailable";
                response.ErrorCode = serviceEx.ServiceName;
                break;

            default:
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response.Message = environment.IsDevelopment()
                    ? exception.Message
                    : "An internal server error occurred";
                break;
        }

        // Add correlation ID for tracing
        if (context.Response.Headers.ContainsKey("X-Correlation-ID"))
        {
            response.CorrelationId = context.Response.Headers["X-Correlation-ID"].ToString();
        }

        context.Response.StatusCode = response.StatusCode;

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}

public class ErrorResponse
{
    public int StatusCode { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? ErrorCode { get; set; }
    public string? CorrelationId { get; set; }
    public Dictionary<string, string>? Details { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
