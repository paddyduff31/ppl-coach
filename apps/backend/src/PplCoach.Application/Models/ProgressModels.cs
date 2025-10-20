using PplCoach.Domain.Enums;

namespace PplCoach.Application.Models;

public class PersonalRecordModel
{
    public string MovementName { get; set; } = string.Empty;
    public decimal HeaviestWeight { get; set; }
    public int RepsAtHeaviest { get; set; }
    public decimal EstimatedOneRepMax { get; set; }
    public DateOnly Date { get; set; }
}

public class MuscleGroupProgressModel
{
    public MuscleGroup MuscleGroup { get; set; }
    public int WeeklyEffectiveSets { get; set; }
    public DateOnly WeekStarting { get; set; }
}

public class ProgressSummaryModel
{
    public List<PersonalRecordModel> PersonalRecords { get; set; } = new();
    public List<MuscleGroupProgressModel> MuscleGroupProgress { get; set; } = new();
}
