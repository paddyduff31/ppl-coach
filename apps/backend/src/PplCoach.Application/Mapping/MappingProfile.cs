using AutoMapper;
using PplCoach.Application.DTOs;
using PplCoach.Application.DTOs.Integrations;
using PplCoach.Domain.Entities;

namespace PplCoach.Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<UserProfile, UserProfileDto>();
        CreateMap<UpdateUserProfileDto, UserProfile>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Email, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());

        CreateMap<Movement, MovementDto>();

        CreateMap<WorkoutSession, WorkoutSessionDto>();
        CreateMap<CreateSessionDto, WorkoutSession>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.SetLogs, opt => opt.Ignore());

        CreateMap<SetLog, SetLogDto>()
            .ForMember(dest => dest.MovementName, opt => opt.MapFrom(src => src.Movement.Name));
        CreateMap<CreateSetLogDto, SetLog>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Session, opt => opt.Ignore())
            .ForMember(dest => dest.Movement, opt => opt.Ignore());

        // Integration mappings
        CreateMap<ThirdPartyIntegration, IntegrationDto>();
        CreateMap<IntegrationSyncLog, IntegrationSyncDto>();
    }
}