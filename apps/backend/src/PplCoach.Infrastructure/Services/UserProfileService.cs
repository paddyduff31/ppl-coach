using AutoMapper;
using PplCoach.Application.Models;
using PplCoach.Application.Abstractions;
using PplCoach.Domain.Entities;
using PplCoach.Domain.Repositories;

namespace PplCoach.Infrastructure.Services;

public class UserProfileService(IUnitOfWork unitOfWork, IMapper mapper, TimeProvider timeProvider) : IUserProfileService
{
    public async Task<UserProfileModel?> GetByIdAsync(Guid id)
    {
        var profile = await unitOfWork.UserProfiles.GetByIdAsync(id);
        return profile != null ? mapper.Map<UserProfileModel>(profile) : null;
    }

    public async Task<UserProfileModel?> GetByEmailAsync(string email)
    {
        var profile = await unitOfWork.UserProfiles.FirstOrDefaultAsync(u => u.Email == email);
        return profile != null ? mapper.Map<UserProfileModel>(profile) : null;
    }

    public async Task<UserProfileModel> UpdateAsync(Guid id, UpdateUserProfileModel dto)
    {
        var profile = await unitOfWork.UserProfiles.GetByIdAsync(id);
        if (profile == null)
            throw new InvalidOperationException($"User profile with id {id} not found");

        mapper.Map(dto, profile);
        unitOfWork.UserProfiles.Update(profile);
        await unitOfWork.SaveChangesAsync();

        return mapper.Map<UserProfileModel>(profile);
    }

    public async Task<UserProfileModel> CreateAsync(string email, string displayName)
    {
        var profile = new UserProfile
        {
            Id = Guid.NewGuid(),
            Email = email,
            DisplayName = displayName,
            CreatedAt = timeProvider.GetUtcNow().DateTime
        };

        await unitOfWork.UserProfiles.AddAsync(profile);
        await unitOfWork.SaveChangesAsync();

        return mapper.Map<UserProfileModel>(profile);
    }
}
