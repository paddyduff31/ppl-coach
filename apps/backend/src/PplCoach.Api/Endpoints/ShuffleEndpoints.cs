using Microsoft.AspNetCore.Mvc;
using PplCoach.Application.DTOs;
using PplCoach.Application.Services;

namespace PplCoach.Api.Endpoints;

public static class ShuffleEndpoints
{
    public static IEndpointRouteBuilder MapShuffleEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/shuffle").WithTags("Shuffle");

        group.MapPost("", async ([FromBody] ShuffleRequestDto request, IMovementService service) =>
        {
            var movements = await service.ShuffleMovementsAsync(request);
            return Results.Ok(movements);
        })
        .WithName("ShuffleMovements")
        .WithOpenApi();

        return app;
    }
}