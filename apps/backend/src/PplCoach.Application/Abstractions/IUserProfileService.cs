using PplCoach.Application.Models;

namespace PplCoach.Application.Abstractions;

public interface IUserProfileService
{
    Task<UserProfileModel?> GetByIdAsync(Guid id);
    Task<UserProfileModel?> GetByEmailAsync(string email);
    Task<UserProfileModel> UpdateAsync(Guid id, UpdateUserProfileModel dto);
    Task<UserProfileModel> CreateAsync(string email, string displayName);
}
