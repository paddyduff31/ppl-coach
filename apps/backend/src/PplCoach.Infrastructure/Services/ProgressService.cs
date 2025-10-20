using Microsoft.EntityFrameworkCore;
using PplCoach.Application.Models;
using PplCoach.Application.Abstractions;
using PplCoach.Application.Utils;
using PplCoach.Infrastructure.Data;

namespace PplCoach.Infrastructure.Services;

public class ProgressService(PplCoachDbContext context) : IProgressService
{
    public async Task<List<PersonalRecordModel>> GetPersonalRecordsAsync(Guid userId)
    {
        var records = await context.SetLogs
            .Include(sl => sl.Session)
            .Include(sl => sl.Movement)
            .Where(sl => sl.Session.UserId == userId)
            .GroupBy(sl => sl.MovementId)
            .Select(g => new
            {
                MovementId = g.Key,
                MovementName = g.First().Movement.Name,
                HeaviestSet = g.OrderByDescending(sl => sl.WeightKg).ThenByDescending(sl => sl.Reps).First(),
                MostRepsSet = g.OrderByDescending(sl => sl.Reps).ThenByDescending(sl => sl.WeightKg).First()
            })
            .ToListAsync();

        var personalRecords = records.Select(r => new PersonalRecordModel
        {
            MovementName = r.MovementName,
            HeaviestWeight = r.HeaviestSet.WeightKg,
            RepsAtHeaviest = r.HeaviestSet.Reps,
            EstimatedOneRepMax = ProgressCalculator.CalculateEstimatedOneRepMax(r.HeaviestSet.WeightKg, r.HeaviestSet.Reps),
            Date = r.HeaviestSet.Session.Date
        }).ToList();

        return personalRecords;
    }

    public async Task<List<MuscleGroupProgressModel>> GetMuscleGroupProgressAsync(Guid userId, DateOnly startDate, DateOnly endDate)
    {
        var setLogs = await context.SetLogs
            .Include(sl => sl.Session)
            .Include(sl => sl.Movement)
            .Where(sl => sl.Session.UserId == userId &&
                        sl.Session.Date >= startDate &&
                        sl.Session.Date <= endDate)
            .ToListAsync();

        var weeklyProgress = setLogs
            .GroupBy(sl => new
            {
                MuscleGroup = sl.Movement.MuscleGroup,
                Week = GetWeekStart(sl.Session.Date)
            })
            .Select(g => new MuscleGroupProgressModel
            {
                MuscleGroup = g.Key.MuscleGroup,
                WeekStarting = g.Key.Week,
                WeeklyEffectiveSets = (int)g.Sum(sl => ProgressCalculator.CalculateEffectiveSets(sl.Reps, sl.RPE))
            })
            .OrderBy(p => p.WeekStarting)
            .ThenBy(p => p.MuscleGroup)
            .ToList();

        return weeklyProgress;
    }

    public async Task<ProgressSummaryModel> GetProgressSummaryAsync(Guid userId)
    {
        var personalRecords = await GetPersonalRecordsAsync(userId);
        var lastMonth = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var muscleGroupProgress = await GetMuscleGroupProgressAsync(userId, lastMonth, today);

        return new ProgressSummaryModel
        {
            PersonalRecords = personalRecords,
            MuscleGroupProgress = muscleGroupProgress
        };
    }

    private static DateOnly GetWeekStart(DateOnly date)
    {
        var dayOfWeek = (int)date.DayOfWeek;
        var daysToSubtract = dayOfWeek == 0 ? 6 : dayOfWeek - 1;
        return date.AddDays(-daysToSubtract);
    }
}
