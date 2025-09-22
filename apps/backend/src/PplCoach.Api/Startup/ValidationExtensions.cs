using FluentValidation;
using PplCoach.Application.Mapping;
using PplCoach.Application.Validators;

namespace PplCoach.Api.Startup;

public static class ValidationExtensions
{
    public static IServiceCollection AddValidationServices(this IServiceCollection services)
    {
        // Add AutoMapper
        services.AddAutoMapper(cfg => cfg.AddProfile<MappingProfile>());

        // Add FluentValidation
        services.AddValidatorsFromAssemblyContaining<UpdateUserProfileValidator>();

        return services;
    }
}
