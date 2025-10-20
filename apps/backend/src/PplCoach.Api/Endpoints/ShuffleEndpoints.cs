using Microsoft.AspNetCore.Mvc;
using PplCoach.Application.Models;
using PplCoach.Application.Abstractions;

namespace PplCoach.Api.Endpoints;

public static class ShuffleEndpoints
{
    public static IEndpointRouteBuilder MapShuffleEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/shuffle").WithTags("Shuffle");

        group.MapPost("", async ([FromBody] ShuffleRequestModel request, IMovementService service) =>
        {
            var movements = await service.ShuffleMovementsAsync(request);
            return Results.Ok(movements);
        })
        .WithName("ShuffleMovements")
        .WithOpenApi();

        return app;
    }
}