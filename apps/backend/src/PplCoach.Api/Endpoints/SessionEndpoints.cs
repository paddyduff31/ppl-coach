using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using PplCoach.Application.Services;
using PplCoach.Application.DTOs;

namespace PplCoach.Api.Endpoints;

public static class SessionEndpoints
{
    public static void MapSessionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/sessions")
            .WithTags("Sessions")
            .WithOpenApi();

        // GET /api/sessions/user/{userId}
        group.MapGet("/user/{userId:guid}", async (
            [FromRoute] Guid userId,
            [FromQuery] DateOnly? startDate,
            [FromQuery] DateOnly? endDate,
            ISessionService service) =>
        {
            try
            {
                var sessions = await service.GetUserSessionsAsync(userId, startDate, endDate);
                return Results.Ok(sessions);
            }
            catch (Exception ex)
            {
                return Results.Problem(
                    title: "Failed to retrieve sessions",
                    detail: ex.Message,
                    statusCode: 500
                );
            }
        })
        .WithName("GetUserSessions")
        .WithSummary("Get user sessions")
        .WithDescription("Retrieve all workout sessions for a specific user, optionally filtered by date range")
        .Produces<List<WorkoutSessionDto>>(200)
        .ProducesProblem(500);

        // GET /api/sessions/{id}
        group.MapGet("/{id:guid}", async (
            [FromRoute] Guid id,
            ISessionService service) =>
        {
            try
            {
                var session = await service.GetSessionAsync(id);
                return session is not null ? Results.Ok(session) : Results.NotFound();
            }
            catch (Exception ex)
            {
                return Results.Problem(
                    title: "Failed to retrieve session",
                    detail: ex.Message,
                    statusCode: 500
                );
            }
        })
        .WithName("GetSessionById")
        .WithSummary("Get session by ID")
        .WithDescription("Retrieve a specific workout session by its ID")
        .Produces<WorkoutSessionDto>(200)
        .ProducesProblem(404)
        .ProducesProblem(500);

        // GET /api/sessions/user/{userId}/stats
        group.MapGet("/user/{userId:guid}/stats", async (
            [FromRoute] Guid userId,
            ISessionService service) =>
        {
            try
            {
                var stats = await service.GetUserSessionStatsAsync(userId);
                return Results.Ok(stats);
            }
            catch (Exception ex)
            {
                return Results.Problem(
                    title: "Failed to retrieve session stats",
                    detail: ex.Message,
                    statusCode: 500
                );
            }
        })
        .WithName("GetUserSessionStats")
        .WithSummary("Get user session statistics")
        .WithDescription("Retrieve aggregated statistics for a user's workout sessions")
        .Produces<object>(200) // Replace with proper DTO type
        .ProducesProblem(500);

        // POST /api/sessions
        group.MapPost("/", async (
            [FromBody] CreateSessionDto request,
            ISessionService service) =>
        {
            try
            {
                var session = await service.CreateSessionAsync(request);
                return Results.Created($"/api/sessions/{session.Id}", session);
            }
            catch (Exception ex)
            {
                return Results.Problem(
                    title: "Failed to create session",
                    detail: ex.Message,
                    statusCode: 500
                );
            }
        })
        .WithName("CreateSession")
        .WithSummary("Create a new workout session")
        .WithDescription("Create a new workout session for a user")
        .Produces<WorkoutSessionDto>(201)
        .ProducesProblem(500);

        // PUT /api/sessions/{id}
        group.MapPut("/{id:guid}", async (
            [FromRoute] Guid id,
            [FromBody] CreateSessionDto request,
            ISessionService service) =>
        {
            try
            {
                var session = await service.UpdateSessionAsync(id, request);
                return Results.Ok(session);
            }
            catch (Exception ex)
            {
                return Results.Problem(
                    title: "Failed to update session",
                    detail: ex.Message,
                    statusCode: 500
                );
            }
        })
        .WithName("UpdateSession")
        .WithSummary("Update an existing workout session")
        .WithDescription("Update an existing workout session")
        .Produces<WorkoutSessionDto>(200)
        .ProducesProblem(404)
        .ProducesProblem(500);

        // POST /api/sessions/{sessionId}/sets
        group.MapPost("/{sessionId:guid}/sets", async (
            [FromRoute] Guid sessionId,
            [FromBody] CreateSetLogDto request,
            ISessionService service) =>
        {
            try
            {
                var setLog = await service.LogSetAsync(request);
                return Results.Created($"/api/sessions/{sessionId}/sets/{setLog.Id}", setLog);
            }
            catch (Exception ex)
            {
                return Results.Problem(
                    title: "Failed to log set",
                    detail: ex.Message,
                    statusCode: 500
                );
            }
        })
        .WithName("LogSet")
        .WithSummary("Log a set for a workout session")
        .WithDescription("Add a new set log entry to an existing workout session")
        .Produces<SetLogDto>(201)
        .ProducesProblem(500);
    }
}
