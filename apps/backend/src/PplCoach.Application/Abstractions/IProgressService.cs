using PplCoach.Application.Models;
using PplCoach.Domain.Enums;

namespace PplCoach.Application.Abstractions;

public interface IProgressService
{
    Task<List<PersonalRecordModel>> GetPersonalRecordsAsync(Guid userId);
    Task<List<MuscleGroupProgressModel>> GetMuscleGroupProgressAsync(Guid userId, DateOnly startDate, DateOnly endDate);
    Task<ProgressSummaryModel> GetProgressSummaryAsync(Guid userId);
}
