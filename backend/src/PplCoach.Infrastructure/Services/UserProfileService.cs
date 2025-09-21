using AutoMapper;
using PplCoach.Application.DTOs;
using PplCoach.Application.Services;
using PplCoach.Domain.Entities;
using IUnitOfWork = PplCoach.Infrastructure.Repositories.IUnitOfWork;

namespace PplCoach.Infrastructure.Services;

public class UserProfileService : IUserProfileService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UserProfileService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<UserProfileDto?> GetByIdAsync(Guid id)
    {
        var profile = await _unitOfWork.UserProfiles.GetByIdAsync(id);
        return profile != null ? _mapper.Map<UserProfileDto>(profile) : null;
    }

    public async Task<UserProfileDto?> GetByEmailAsync(string email)
    {
        var profile = await _unitOfWork.UserProfiles.FirstOrDefaultAsync(u => u.Email == email);
        return profile != null ? _mapper.Map<UserProfileDto>(profile) : null;
    }

    public async Task<UserProfileDto> UpdateAsync(Guid id, UpdateUserProfileDto dto)
    {
        var profile = await _unitOfWork.UserProfiles.GetByIdAsync(id);
        if (profile == null)
            throw new InvalidOperationException($"User profile with id {id} not found");

        _mapper.Map(dto, profile);
        _unitOfWork.UserProfiles.Update(profile);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<UserProfileDto>(profile);
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

        await _unitOfWork.UserProfiles.AddAsync(profile);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<UserProfileDto>(profile);
    }
}