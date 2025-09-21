using Microsoft.AspNetCore.Mvc;
using PplCoach.Application.DTOs;
using PplCoach.Application.Services;
using PplCoach.Domain.Enums;

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
            var session = await service.GetSessionByIdAsync(sessionId);
            return session is not null ? Results.Ok(new { data = session }) : Results.NotFound();
        })
        .WithName("GetSession")
        .WithOpenApi();

        // Create new workout session
        group.MapPost("", async (CreateSessionRequest request, ISessionService service) =>
        {
            var sessionId = await service.CreateSessionAsync(request);
            var session = await service.GetSessionByIdAsync(sessionId);
            return Results.Created($"/api/sessions/{sessionId}", new { data = session });
        })
        .WithName("CreateSession")
        .WithOpenApi();

        // Update session
        group.MapPut("/{sessionId:guid}", async (Guid sessionId, UpdateSessionRequest request, ISessionService service) =>
        {
            await service.UpdateSessionAsync(sessionId, request);
            var session = await service.GetSessionByIdAsync(sessionId);
            return Results.Ok(new { data = session });
        })
        .WithName("UpdateSession")
        .WithOpenApi();

        // Delete session
        group.MapDelete("/{sessionId:guid}", async (Guid sessionId, ISessionService service) =>
        {
            await service.DeleteSessionAsync(sessionId);
            return Results.NoContent();
        })
        .WithName("DeleteSession")
        .WithOpenApi();

        // Log a set in a session
        group.MapPost("/{sessionId:guid}/sets", async (Guid sessionId, CreateSetLogRequest request, ISessionService service) =>
        {
            request.SessionId = sessionId;
            var setId = await service.LogSetAsync(request);
            var session = await service.GetSessionByIdAsync(sessionId);
            return Results.Created($"/api/sessions/{sessionId}/sets/{setId}", new { data = session });
        })
        .WithName("LogSet")
        .WithOpenApi();

        // Delete a set from a session
        group.MapDelete("/{sessionId:guid}/sets/{setId:guid}", async (Guid sessionId, Guid setId, ISessionService service) =>
        {
            await service.DeleteSetAsync(setId);
            var session = await service.GetSessionByIdAsync(sessionId);
            return Results.Ok(new { data = session });
        })
        .WithName("DeleteSet")
        .WithOpenApi();

        // Complete a session
        group.MapPost("/{sessionId:guid}/complete", async (Guid sessionId, ISessionService service) =>
        {
            await service.CompleteSessionAsync(sessionId);
            var session = await service.GetSessionByIdAsync(sessionId);
            return Results.Ok(new { data = session });
        })
        .WithName("CompleteSession")
        .WithOpenApi();

        return app;
    }
}
