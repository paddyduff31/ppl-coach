using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using PplCoach.Application.DTOs;
using PplCoach.Application.Services;

namespace PplCoach.Api.Endpoints;

public static class ProfileEndpoints
{
    public static IEndpointRouteBuilder MapProfileEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/profile").WithTags("Profile");

        group.MapGet("/{id:guid}", async (Guid id, IUserProfileService service) =>
        {
            var profile = await service.GetByIdAsync(id);
            return profile is not null ? Results.Ok(profile) : Results.NotFound();
        })
        .WithName("GetProfile")
        .WithOpenApi();

        group.MapGet("/email/{email}", async (string email, IUserProfileService service) =>
        {
            var profile = await service.GetByEmailAsync(email);
            return profile is not null ? Results.Ok(profile) : Results.NotFound();
        })
        .WithName("GetProfileByEmail")
        .WithOpenApi();

        group.MapPost("", async (string email, string displayName, IUserProfileService service) =>
        {
            var profile = await service.CreateAsync(email, displayName);
            return Results.Created($"/api/profile/{profile.Id}", profile);
        })
        .WithName("CreateProfile")
        .WithOpenApi();

        group.MapPut("/{id:guid}", async (
            Guid id,
            [FromBody] UpdateUserProfileDto dto,
            IUserProfileService service,
            IValidator<UpdateUserProfileDto> validator) =>
        {
            var validationResult = await validator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            try
            {
                var profile = await service.UpdateAsync(id, dto);
                return Results.Ok(profile);
            }
            catch (InvalidOperationException)
            {
                return Results.NotFound();
            }
        })
        .WithName("UpdateProfile")
        .WithOpenApi();

        return app;
    }
}