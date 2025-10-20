using FluentValidation;
using PplCoach.Application.Models;

namespace PplCoach.Application.Validators;

public class UpdateUserProfileValidator : AbstractValidator<UpdateUserProfileModel>
{
    public UpdateUserProfileValidator()
    {
        RuleFor(x => x.DisplayName)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.BodyweightKg)
            .GreaterThan(0)
            .LessThan(1000)
            .When(x => x.BodyweightKg.HasValue);

        RuleFor(x => x.HeightCm)
            .GreaterThan(0)
            .LessThan(300)
            .When(x => x.HeightCm.HasValue);

        RuleFor(x => x.Birthday)
            .LessThan(DateOnly.FromDateTime(DateTime.Today))
            .When(x => x.Birthday.HasValue);
    }
}