using FluentValidation;
using PplCoach.Application.Models;

namespace PplCoach.Application.Validators;

public class CreateSessionValidator : AbstractValidator<CreateSessionModel>
{
    public CreateSessionValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty();

        RuleFor(x => x.Date)
            .NotEmpty()
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today.AddDays(1)));

        RuleFor(x => x.DayType)
            .IsInEnum();
    }
}