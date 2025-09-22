using PplCoach.Application.DTOs;

namespace PplCoach.Application.Services;

public interface IUserProfileService
{
    Task<UserProfileDto?> GetByIdAsync(Guid id);
    Task<UserProfileDto?> GetByEmailAsync(string email);
    Task<UserProfileDto> UpdateAsync(Guid id, UpdateUserProfileDto dto);
    Task<UserProfileDto> CreateAsync(string email, string displayName);
}