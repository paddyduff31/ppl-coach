namespace PplCoach.Application.Utils;

public static class ProgressCalculator
{
    public static decimal CalculateEstimatedOneRepMax(decimal weightKg, int reps)
    {
        if (reps == 1)
            return weightKg;

        return weightKg * (1 + reps / 30.0m);
    }

    public static decimal CalculateEffectiveSets(int reps, decimal? rpe)
    {
        if (reps >= 6 && (rpe >= 7 || reps >= 10))
            return 1.0m;

        return 0.5m;
    }
}