using FluentAssertions;
using PplCoach.Application.Utils;

namespace PplCoach.Tests.Utils;

public class ProgressCalculatorTests
{
    [Theory]
    [InlineData(100, 1, 100)] // 1RM should equal the weight
    [InlineData(100, 5, 116.67)] // 5 reps at 100kg
    [InlineData(80, 10, 106.67)] // 10 reps at 80kg
    [InlineData(60, 15, 90)] // 15 reps at 60kg
    public void CalculateEstimatedOneRepMax_ShouldReturnCorrectValue(decimal weight, int reps, decimal expected)
    {
        // Act
        var result = ProgressCalculator.CalculateEstimatedOneRepMax(weight, reps);

        // Assert
        result.Should().BeApproximately(expected, 0.01m);
    }

    [Fact]
    public void CalculateEffectiveSets_6RepsRPE7_ShouldReturn1()
    {
        var result = ProgressCalculator.CalculateEffectiveSets(6, 7m);
        result.Should().Be(1.0m);
    }

    [Fact]
    public void CalculateEffectiveSets_10RepsRPE5_ShouldReturn1()
    {
        var result = ProgressCalculator.CalculateEffectiveSets(10, 5m);
        result.Should().Be(1.0m);
    }

    [Fact]
    public void CalculateEffectiveSets_12RepsRPE6_ShouldReturn1()
    {
        var result = ProgressCalculator.CalculateEffectiveSets(12, 6m);
        result.Should().Be(1.0m);
    }

    [Fact]
    public void CalculateEffectiveSets_5RepsRPE6_ShouldReturnHalf()
    {
        var result = ProgressCalculator.CalculateEffectiveSets(5, 6m);
        result.Should().Be(0.5m);
    }

    [Fact]
    public void CalculateEffectiveSets_8RepsRPE5_ShouldReturnHalf()
    {
        var result = ProgressCalculator.CalculateEffectiveSets(8, 5m);
        result.Should().Be(0.5m);
    }

    [Fact]
    public void CalculateEffectiveSets_15RepsNoRPE_ShouldReturn1()
    {
        var result = ProgressCalculator.CalculateEffectiveSets(15, null);
        result.Should().Be(1.0m);
    }
}