using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using PplCoach.Application.DTOs;
using PplCoach.Application.Services;

namespace PplCoach.Api.Endpoints;

public static class SessionEndpoints
{
    public static IEndpointRouteBuilder MapSessionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/sessions").WithTags("Sessions");

        group.MapPost("", async (
            [FromBody] CreateSessionDto dto,
            ISessionService service,
            IValidator<CreateSessionDto> validator) =>
        {
            var validationResult = await validator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var session = await service.CreateSessionAsync(dto);
            return Results.Created($"/api/sessions/{session.Id}", session);
        })
        .WithName("CreateSession")
        .WithOpenApi();

        group.MapGet("/{id:guid}", async (Guid id, ISessionService service) =>
        {
            var session = await service.GetSessionAsync(id);
            return session is not null ? Results.Ok(session) : Results.NotFound();
        })
        .WithName("GetSession")
        .WithOpenApi();

        group.MapGet("/user/{userId:guid}", async (
            Guid userId,
            DateOnly? startDate,
            DateOnly? endDate,
            ISessionService service) =>
        {
            var sessions = await service.GetUserSessionsAsync(userId, startDate, endDate);
            return Results.Ok(sessions);
        })
        .WithName("GetUserSessions")
        .WithOpenApi();

        group.MapPost("/sets", async (
            [FromBody] CreateSetLogDto dto,
            ISessionService service,
            IValidator<CreateSetLogDto> validator) =>
        {
            var validationResult = await validator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var setLog = await service.LogSetAsync(dto);
            return Results.Created($"/api/sessions/sets/{setLog.Id}", setLog);
        })
        .WithName("LogSet")
        .WithOpenApi();

        group.MapDelete("/sets/{setId:guid}", async (Guid setId, ISessionService service) =>
        {
            try
            {
                await service.DeleteSetAsync(setId);
                return Results.NoContent();
            }
            catch (InvalidOperationException)
            {
                return Results.NotFound();
            }
        })
        .WithName("DeleteSet")
        .WithOpenApi();

        return app;
    }
}