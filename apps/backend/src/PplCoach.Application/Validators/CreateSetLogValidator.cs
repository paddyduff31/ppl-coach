using FluentValidation;
using PplCoach.Application.DTOs;

namespace PplCoach.Application.Validators;

public class CreateSetLogValidator : AbstractValidator<CreateSetLogDto>
{
    public CreateSetLogValidator()
    {
        RuleFor(x => x.SessionId)
            .NotEmpty();

        RuleFor(x => x.MovementId)
            .NotEmpty();

        RuleFor(x => x.SetIndex)
            .GreaterThan(0);

        RuleFor(x => x.WeightKg)
            .GreaterThan(0)
            .LessThan(1000);

        RuleFor(x => x.Reps)
            .GreaterThan(0)
            .LessThan(500);

        RuleFor(x => x.RPE)
            .GreaterThanOrEqualTo(1)
            .LessThanOrEqualTo(10)
            .When(x => x.RPE.HasValue);
    }
}