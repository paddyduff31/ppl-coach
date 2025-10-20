using Microsoft.AspNetCore.Mvc;
using PplCoach.Application.Models;
using PplCoach.Application.Abstractions;
using PplCoach.Domain.Enums;

namespace PplCoach.Api.Endpoints;

public static class MovementEndpoints
{
    public static IEndpointRouteBuilder MapMovementEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/movements").WithTags("Movements");

        group.MapGet("", async (IMovementService service) =>
        {
            var movements = await service.GetAllAsync();
            return Results.Ok(movements);
        })
        .WithName("GetAllMovements")
        .WithOpenApi();

        group.MapGet("/{id:guid}", async (Guid id, IMovementService service) =>
        {
            var movement = await service.GetByIdAsync(id);
            return movement is not null ? Results.Ok(movement) : Results.NotFound();
        })
        .WithName("GetMovement")
        .WithOpenApi();

        group.MapGet("/equipment", async (string equipmentTypes, IMovementService service) =>
        {
            var equipmentFlags = EquipmentType.None;
            foreach (var equipmentType in equipmentTypes.Split(','))
            {
                if (Enum.TryParse<EquipmentType>(equipmentType.Trim(), true, out var parsed))
                {
                    equipmentFlags |= parsed;
                }
            }

            var movements = await service.GetByEquipmentAsync(equipmentFlags);
            return Results.Ok(movements);
        })
        .WithName("GetMovementsByEquipment")
        .WithOpenApi();

        return app;
    }
}