using AutoMapper;
using PplCoach.Application.DTOs;
using PplCoach.Application.Services;
using PplCoach.Domain.Entities;
using PplCoach.Domain.Repositories;

namespace PplCoach.Infrastructure.Services;

public class UserProfileService(IUnitOfWork unitOfWork, IMapper mapper) : IUserProfileService
{
    public async Task<UserProfileDto?> GetByIdAsync(Guid id)
    {
        var profile = await unitOfWork.UserProfiles.GetByIdAsync(id);
        return profile != null ? mapper.Map<UserProfileDto>(profile) : null;
    }

    public async Task<UserProfileDto?> GetByEmailAsync(string email)
    {
        var profile = await unitOfWork.UserProfiles.FirstOrDefaultAsync(u => u.Email == email);
        return profile != null ? mapper.Map<UserProfileDto>(profile) : null;
    }

    public async Task<UserProfileDto> UpdateAsync(Guid id, UpdateUserProfileDto dto)
    {
        var profile = await unitOfWork.UserProfiles.GetByIdAsync(id);
        if (profile == null)
            throw new InvalidOperationException($"User profile with id {id} not found");

        mapper.Map(dto, profile);
        unitOfWork.UserProfiles.Update(profile);
        await unitOfWork.SaveChangesAsync();

        return mapper.Map<UserProfileDto>(profile);
    }

    public async Task<UserProfileDto> CreateAsync(string email, string displayName)
    {
        var profile = new UserProfile
        {
            Id = Guid.NewGuid(),
            Email = email,
            DisplayName = displayName,
            CreatedAt = DateTime.UtcNow
        };

        await unitOfWork.UserProfiles.AddAsync(profile);
        await unitOfWork.SaveChangesAsync();

        return mapper.Map<UserProfileDto>(profile);
    }
}
