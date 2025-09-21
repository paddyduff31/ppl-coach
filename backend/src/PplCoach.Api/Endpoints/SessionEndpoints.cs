using PplCoach.Application.DTOs;
using PplCoach.Application.Services;

namespace PplCoach.Api.Endpoints;

public static class SessionEndpoints
{
    public static IEndpointRouteBuilder MapSessionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/sessions").WithTags("Sessions");

        // Get all sessions for a user
        group.MapGet("/user/{userId:guid}", async (Guid userId, ISessionService service) =>
        {
            var sessions = await service.GetUserSessionsAsync(userId);
            return Results.Ok(new { data = sessions });
        })
        .WithName("GetUserSessions")
        .WithOpenApi();

        // Get specific session by ID
        group.MapGet("/{sessionId:guid}", async (Guid sessionId, ISessionService service) =>
        {
            var session = await service.GetSessionAsync(sessionId);
            return session is not null ? Results.Ok(new { data = session }) : Results.NotFound();
        })
        .WithName("GetSession")
        .WithOpenApi();

        // Create new workout session
        group.MapPost("", async (CreateSessionDto request, ISessionService service) =>
        {
            var session = await service.CreateSessionAsync(request);
            return Results.Created($"/api/sessions/{session.Id}", new { data = session });
        })
        .WithName("CreateSession")
        .WithOpenApi();

        // Update session
        group.MapPut("/{sessionId:guid}", async (Guid sessionId, UpdateSessionRequest request, ISessionService service) =>
        {
            var session = await service.UpdateSessionAsync(sessionId, request);
            return Results.Ok(new { data = session });
        })
        .WithName("UpdateSession")
        .WithOpenApi();

        // Log a set in a session
        group.MapPost("/{sessionId:guid}/sets", async (Guid sessionId, CreateSetLogDto request, ISessionService service) =>
        {
            request.SessionId = sessionId;
            var setLog = await service.LogSetAsync(request);
            var session = await service.GetSessionAsync(sessionId);
            return Results.Created($"/api/sessions/{sessionId}/sets/{setLog.Id}", new { data = session });
        })
        .WithName("LogSet")
        .WithOpenApi();

        // Delete a set from a session
        group.MapDelete("/{sessionId:guid}/sets/{setId:guid}", async (Guid sessionId, Guid setId, ISessionService service) =>
        {
            await service.DeleteSetAsync(setId);
            var session = await service.GetSessionAsync(sessionId);
            return Results.Ok(new { data = session });
        })
        .WithName("DeleteSet")
        .WithOpenApi();

        return app;
    }
}
