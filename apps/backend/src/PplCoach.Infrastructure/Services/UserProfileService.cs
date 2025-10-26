using AutoMapper;
using Microsoft.EntityFrameworkCore;
using PplCoach.Application.Models;
using PplCoach.Application.Abstractions;
using PplCoach.Domain.Entities;
using PplCoach.Infrastructure.Data;

namespace PplCoach.Infrastructure.Services;

public class UserProfileService(PplCoachDbContext context, IMapper mapper, TimeProvider timeProvider) : IUserProfileService
{
    public async Task<UserProfileModel?> GetByIdAsync(Guid id)
    {
        var profile = await context.UserProfiles.FindAsync(id);
        return profile != null ? mapper.Map<UserProfileModel>(profile) : null;
    }

    public async Task<UserProfileModel?> GetByEmailAsync(string email)
    {
        var profile = await context.UserProfiles
            .FirstOrDefaultAsync(u => u.Email == email);
        return profile != null ? mapper.Map<UserProfileModel>(profile) : null;
    }

    public async Task<UserProfileModel> UpdateAsync(Guid id, UpdateUserProfileModel dto)
    {
        var profile = await context.UserProfiles.FindAsync(id);
        if (profile == null)
            throw new InvalidOperationException($"User profile with id {id} not found");

        mapper.Map(dto, profile);
        await context.SaveChangesAsync();

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

        await context.UserProfiles.AddAsync(profile);
        await context.SaveChangesAsync();

        return mapper.Map<UserProfileModel>(profile);
    }
}
