using PplCoach.Domain.Enums;

namespace PplCoach.Application.DTOs;

public class PersonalRecordDto
{
    public string MovementName { get; set; } = string.Empty;
    public decimal HeaviestWeight { get; set; }
    public int RepsAtHeaviest { get; set; }
    public decimal EstimatedOneRepMax { get; set; }
    public DateOnly Date { get; set; }
}

public class MuscleGroupProgressDto
{
    public MuscleGroup MuscleGroup { get; set; }
    public int WeeklyEffectiveSets { get; set; }
    public DateOnly WeekStarting { get; set; }
}

public class ProgressSummaryDto
{
    public List<PersonalRecordDto> PersonalRecords { get; set; } = new();
    public List<MuscleGroupProgressDto> MuscleGroupProgress { get; set; } = new();
}