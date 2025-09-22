using PplCoach.Application.Services;

namespace PplCoach.Api.Endpoints;

public static class ProgressEndpoints
{
    public static IEndpointRouteBuilder MapProgressEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/progress").WithTags("Progress");

        group.MapGet("/user/{userId:guid}/personal-records", async (Guid userId, IProgressService service) =>
        {
            var records = await service.GetPersonalRecordsAsync(userId);
            return Results.Ok(records);
        })
        .WithName("GetPersonalRecords")
        .WithOpenApi();

        group.MapGet("/user/{userId:guid}/muscle-groups", async (
            Guid userId,
            DateOnly startDate,
            DateOnly endDate,
            IProgressService service) =>
        {
            var progress = await service.GetMuscleGroupProgressAsync(userId, startDate, endDate);
            return Results.Ok(progress);
        })
        .WithName("GetMuscleGroupProgress")
        .WithOpenApi();

        group.MapGet("/user/{userId:guid}/summary", async (Guid userId, IProgressService service) =>
        {
            var summary = await service.GetProgressSummaryAsync(userId);
            return Results.Ok(summary);
        })
        .WithName("GetProgressSummary")
        .WithOpenApi();

        return app;
    }
}