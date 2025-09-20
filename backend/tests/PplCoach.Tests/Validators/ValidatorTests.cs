using FluentAssertions;
using PplCoach.Application.DTOs;
using PplCoach.Application.Validators;
using PplCoach.Domain.Enums;

namespace PplCoach.Tests.Validators;

public class ValidatorTests
{
    [Fact]
    public void UpdateUserProfileValidator_ValidDto_ShouldPass()
    {
        // Arrange
        var validator = new UpdateUserProfileValidator();
        var dto = new UpdateUserProfileDto
        {
            DisplayName = "John Doe",
            BodyweightKg = 75.5m,
            HeightCm = 180m,
            Sex = Sex.Male,
            Birthday = DateOnly.FromDateTime(DateTime.Today.AddYears(-25))
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void UpdateUserProfileValidator_EmptyDisplayName_ShouldFail()
    {
        // Arrange
        var validator = new UpdateUserProfileValidator();
        var dto = new UpdateUserProfileDto
        {
            DisplayName = "",
            BodyweightKg = 75.5m,
            HeightCm = 180m
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(dto.DisplayName));
    }

    [Fact]
    public void CreateSetLogValidator_ValidDto_ShouldPass()
    {
        // Arrange
        var validator = new CreateSetLogValidator();
        var dto = new CreateSetLogDto
        {
            SessionId = Guid.NewGuid(),
            MovementId = Guid.NewGuid(),
            SetIndex = 1,
            WeightKg = 50m,
            Reps = 10,
            RPE = 8m
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData(0)] // Zero weight should fail
    [InlineData(-5)] // Negative weight should fail
    [InlineData(1000)] // Excessive weight should fail
    public void CreateSetLogValidator_InvalidWeight_ShouldFail(decimal weight)
    {
        // Arrange
        var validator = new CreateSetLogValidator();
        var dto = new CreateSetLogDto
        {
            SessionId = Guid.NewGuid(),
            MovementId = Guid.NewGuid(),
            SetIndex = 1,
            WeightKg = weight,
            Reps = 10
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(dto.WeightKg));
    }

    [Fact]
    public void CreateSessionValidator_ValidDto_ShouldPass()
    {
        // Arrange
        var validator = new CreateSessionValidator();
        var dto = new CreateSessionDto
        {
            UserId = Guid.NewGuid(),
            Date = DateOnly.FromDateTime(DateTime.Today),
            DayType = DayType.Push,
            Notes = "Test session"
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeTrue();
    }
}