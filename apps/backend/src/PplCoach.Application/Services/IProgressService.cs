using PplCoach.Application.DTOs;
using PplCoach.Domain.Enums;

namespace PplCoach.Application.Services;

public interface IProgressService
{
    Task<List<PersonalRecordDto>> GetPersonalRecordsAsync(Guid userId);
    Task<List<MuscleGroupProgressDto>> GetMuscleGroupProgressAsync(Guid userId, DateOnly startDate, DateOnly endDate);
    Task<ProgressSummaryDto> GetProgressSummaryAsync(Guid userId);
}